class GrammarCalculator {
  constructor(grammarText) {
    this.first = new Map();
    this.follow = new Map();
    this.predict = new Map();
    this.grammar = this.parseGrammar(grammarText);
  }

  parseGrammar(grammarText) {
    if (!grammarText || grammarText.trim() === "") {
      throw new Error("Grammar input cannot be empty");
    }

    // Initialize sets before using them
    this.nonTerminals = new Set();
    this.terminals = new Set();

    const grammar = new Map();
    const lines = grammarText.trim().split("\n");

    for (const line of lines) {
      if (!line.includes("->")) {
        throw new Error(
          `Invalid line format: ${line}\nEach line must contain '->'`
        );
      }

      const [nonTerminal, productions] = line.split("->").map((s) => s.trim());

      if (!nonTerminal || !productions) {
        throw new Error(
          `Invalid line format: ${line}\nBoth non-terminal and productions are required`
        );
      }

      if (!/^[A-Z]'?$/.test(nonTerminal)) {
        throw new Error(
          `Invalid non-terminal: ${nonTerminal}\nNon-terminals must be a single uppercase letter optionally followed by a prime (')`
        );
      }

      const productionsList = productions.split("|").map((p) => p.trim());

      for (const prod of productionsList) {
        if (!prod) {
          throw new Error(`Empty production found in line: ${line}`);
        }

        const tokens = this.tokenizeProduction(prod);
        if (
          !tokens.every(
            (token) =>
              /^[A-Z]'?$/.test(token) || // Non-terminal (with optional prime)
              /^[a-z+*()]$/.test(token) || // Terminal or operator
              token === "id" || // Special token
              token === "epsilon" || // Epsilon
              token === "ε" // Epsilon symbol
          )
        ) {
          throw new Error(
            `Invalid production: ${prod}\nAllowed tokens are non-terminals (with optional prime), operators, parentheses, 'id', and 'epsilon'`
          );
        }
      }

      grammar.set(nonTerminal, productionsList);
      this.nonTerminals.add(nonTerminal);

      // Update terminal detection
      for (const prod of productionsList) {
        if (prod === "epsilon" || prod === "ε") continue;

        const tokens = this.tokenizeProduction(prod);
        for (const token of tokens) {
          if (
            !this.isNonTerminal(token) &&
            token !== "epsilon" &&
            token !== "ε" &&
            token !== "'"
          ) {
            this.terminals.add(token);
          }
        }
      }
    }

    if (grammar.size === 0) {
      throw new Error("No valid grammar rules found");
    }

    return grammar;
  }

  isNonTerminal(symbol) {
    return /^[A-Z]'?$/.test(symbol);
  }

  calculateFirst() {
    // Initialize FIRST sets
    for (const nonTerminal of this.nonTerminals) {
      this.first.set(nonTerminal, new Set());
    }

    let changed = true;
    while (changed) {
      changed = false;

      for (const [nonTerminal, productions] of this.grammar) {
        for (const production of productions) {
          if (production === "ε" || production === "epsilon") {
            const firstSet = this.first.get(nonTerminal);
            if (!firstSet.has("ε")) {
              firstSet.add("ε");
              changed = true;
            }
            continue;
          }

          const tokens = this.tokenizeProduction(production);
          let allPrecedingCanBeEmpty = true;

          for (let i = 0; i < tokens.length && allPrecedingCanBeEmpty; i++) {
            const token = tokens[i];
            const firstSet = this.first.get(nonTerminal);
            const beforeSize = firstSet.size;

            if (!this.isNonTerminal(token)) {
              firstSet.add(token);
              allPrecedingCanBeEmpty = false;
            } else {
              const symbolFirst = this.first.get(token);
              for (const terminal of symbolFirst) {
                if (terminal !== "ε") {
                  firstSet.add(terminal);
                }
              }
              allPrecedingCanBeEmpty = symbolFirst.has("ε");
            }

            if (firstSet.size > beforeSize) {
              changed = true;
            }
          }
        }
      }
    }
  }

  calculateFollow() {
    // Initialize FOLLOW sets
    for (const nonTerminal of this.nonTerminals) {
      this.follow.set(nonTerminal, new Set());
    }

    // Add $ to the start symbol's FOLLOW set
    const startSymbol = this.grammar.keys().next().value;
    this.follow.get(startSymbol).add("$");

    let changed = true;
    while (changed) {
      changed = false;

      for (const [nonTerminal, productions] of this.grammar) {
        for (const production of productions) {
          if (production === "ε" || production === "epsilon") continue;

          const tokens = this.tokenizeProduction(production);
          for (let i = 0; i < tokens.length; i++) {
            const token = tokens[i];
            if (!this.isNonTerminal(token)) continue;

            const remainingTokens = tokens.slice(i + 1);
            const firstOfRemaining = new Set();

            if (remainingTokens.length === 0) {
              const followOfNonTerminal = this.follow.get(nonTerminal);
              for (const terminal of followOfNonTerminal) {
                const followSet = this.follow.get(token);
                if (!followSet.has(terminal)) {
                  followSet.add(terminal);
                  changed = true;
                }
              }
            } else {
              let allCanBeEmpty = true;
              for (
                let j = 0;
                j < remainingTokens.length && allCanBeEmpty;
                j++
              ) {
                const nextToken = remainingTokens[j];
                if (!this.isNonTerminal(nextToken)) {
                  firstOfRemaining.add(nextToken);
                  allCanBeEmpty = false;
                } else {
                  const firstOfNext = this.first.get(nextToken);
                  for (const terminal of firstOfNext) {
                    if (terminal !== "ε") {
                      firstOfRemaining.add(terminal);
                    }
                  }
                  allCanBeEmpty = firstOfNext.has("ε");
                }
              }

              const followSet = this.follow.get(token);
              for (const terminal of firstOfRemaining) {
                if (!followSet.has(terminal)) {
                  followSet.add(terminal);
                  changed = true;
                }
              }

              if (allCanBeEmpty) {
                const followOfNonTerminal = this.follow.get(nonTerminal);
                for (const terminal of followOfNonTerminal) {
                  if (!followSet.has(terminal)) {
                    followSet.add(terminal);
                    changed = true;
                  }
                }
              }
            }
          }
        }
      }
    }
  }

  calculatePredict() {
    for (const [nonTerminal, productions] of this.grammar) {
      for (const production of productions) {
        const key = `${nonTerminal} -> ${production}`;
        this.predict.set(key, new Set());
        const predictSet = this.predict.get(key);

        if (production === "epsilon" || production === "ε") {
          // If production is epsilon, add FOLLOW(nonTerminal) to PREDICT set
          const followSet = this.follow.get(nonTerminal);
          for (const symbol of followSet) {
            predictSet.add(symbol);
          }
          continue;
        }

        const tokens = this.tokenizeProduction(production);
        let allCanBeEmpty = true;

        // Look at each symbol in the production until we find one that can't be empty
        for (let i = 0; i < tokens.length && allCanBeEmpty; i++) {
          const token = tokens[i];

          if (!this.isNonTerminal(token)) {
            // If it's a terminal, add it to predict set and stop
            predictSet.add(token);
            allCanBeEmpty = false;
          } else {
            // If it's a non-terminal, add its FIRST set
            const firstSet = this.first.get(token);
            for (const symbol of firstSet) {
              if (symbol !== "ε") {
                predictSet.add(symbol);
              }
            }
            // Check if this non-terminal can derive epsilon
            allCanBeEmpty = firstSet.has("ε");
          }
        }

        // If all symbols can derive epsilon, add FOLLOW(nonTerminal)
        if (allCanBeEmpty) {
          const followSet = this.follow.get(nonTerminal);
          for (const symbol of followSet) {
            predictSet.add(symbol);
          }
        }
      }
    }
  }

  calculate() {
    this.calculateFirst();
    this.calculateFollow();
    this.calculatePredict();

    return {
      first: this.mapToObject(this.first),
      follow: this.mapToObject(this.follow),
      predict: this.mapToObject(this.predict),
    };
  }

  mapToObject(map) {
    const obj = {};
    for (const [key, value] of map) {
      obj[key] = Array.from(value).sort().join(", ");
    }
    return obj;
  }

  // Add new method to tokenize productions
  tokenizeProduction(production) {
    if (production === "epsilon" || production === "ε") return [production];

    const tokens = [];
    let i = 0;
    while (i < production.length) {
      if (production.startsWith("id", i)) {
        tokens.push("id");
        i += 2;
      } else if (i + 1 < production.length && production[i + 1] === "'") {
        // Handle non-terminal with prime
        tokens.push(production.slice(i, i + 2));
        i += 2;
      } else {
        tokens.push(production[i]);
        i++;
      }
    }
    return tokens;
  }
}

// Add event listener to the calculate button
document.addEventListener("DOMContentLoaded", () => {
  const calculateBtn = document.getElementById("calculateBtn");
  const clearBtn = document.getElementById("clearBtn");
  const grammarInput = document.getElementById("grammarInput");
  const firstSets = document.getElementById("firstSets");
  const followSets = document.getElementById("followSets");
  const predictSets = document.getElementById("predictSets");

  // Add clear button functionality
  clearBtn.addEventListener("click", () => {
    // Clear input
    grammarInput.value = "";
    updateLineNumbers(); // Update line numbers after clearing

    // Clear results with fade out animation
    const results = document.querySelectorAll(".result-item");
    results.forEach((result) => {
      result.style.opacity = "0";
      result.style.transform = "translateX(-20px)";
    });

    // Clear results after animation
    setTimeout(() => {
      firstSets.innerHTML = "";
      followSets.innerHTML = "";
      predictSets.innerHTML = "";
    }, 300);

    // Reset cards to initial state
    const cards = document.querySelectorAll(".result-card");
    cards.forEach((card) => {
      card.style.transform = "translateY(0)";
      card.style.boxShadow =
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)";
    });

    // Focus on input
    grammarInput.focus();
  });

  calculateBtn.addEventListener("click", () => {
    try {
      const calculator = new GrammarCalculator(grammarInput.value);
      const results = calculator.calculate();

      // Display results
      firstSets.innerHTML = Object.entries(results.first)
        .map(
          ([key, value], index) =>
            `<div class="result-item p-2 rounded hover:bg-gray-50 transition-colors" 
                  style="opacity: 0; transform: translateX(-20px); transition-delay: ${
                    index * 100
                  }ms">
                <span class="font-mono font-semibold text-blue-600">FIRST(${key})</span> = 
                <span class="font-mono">{${value}}</span>
            </div>`
        )
        .join("");

      followSets.innerHTML = Object.entries(results.follow)
        .map(
          ([key, value], index) =>
            `<div class="result-item p-2 rounded hover:bg-gray-50 transition-colors"
                  style="opacity: 0; transform: translateX(-20px); transition-delay: ${
                    index * 100
                  }ms">
                <span class="font-mono font-semibold text-purple-600">FOLLOW(${key})</span> = 
                <span class="font-mono">{${value}}</span>
            </div>`
        )
        .join("");

      predictSets.innerHTML = Object.entries(results.predict)
        .map(
          ([key, value], index) =>
            `<div class="result-item p-2 rounded hover:bg-gray-50 transition-colors"
                  style="opacity: 0; transform: translateX(-20px); transition-delay: ${
                    index * 100
                  }ms">
                <span class="font-mono font-semibold text-pink-600">PREDICT(${key})</span> = 
                <span class="font-mono">{${value}}</span>
            </div>`
        )
        .join("");

      // Trigger animations after updating content
      Card.animateResults();
    } catch (error) {
      notificationManager.show(error.message);
      console.error(error);
    }
  });
});
