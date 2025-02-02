class ThemeManager {
  constructor() {
    this.themeToggle = document.getElementById("themeToggle");
    this.sunIcon = document.getElementById("sunIcon");
    this.moonIcon = document.getElementById("moonIcon");
    this.isDark = localStorage.getItem("theme") === "dark";

    this.initialize();
    this.setupEventListeners();
  }

  initialize() {
    // Set initial theme based on localStorage or system preference
    if (localStorage.getItem("theme") === null) {
      this.isDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
    }

    this.updateTheme();
  }

  setupEventListeners() {
    this.themeToggle.addEventListener("click", () => {
      this.isDark = !this.isDark;
      this.updateTheme();
    });

    // Listen for system theme changes
    window
      .matchMedia("(prefers-color-scheme: dark)")
      .addEventListener("change", (e) => {
        if (localStorage.getItem("theme") === null) {
          this.isDark = e.matches;
          this.updateTheme();
        }
      });
  }

  updateTheme() {
    if (this.isDark) {
      document.body.classList.add("dark");
      this.sunIcon.classList.remove("hidden");
      this.moonIcon.classList.add("hidden");
      localStorage.setItem("theme", "dark");
    } else {
      document.body.classList.remove("dark");
      this.sunIcon.classList.add("hidden");
      this.moonIcon.classList.remove("hidden");
      localStorage.setItem("theme", "light");
    }
  }
}

// Initialize theme manager when DOM is loaded
document.addEventListener("DOMContentLoaded", () => {
  new ThemeManager();
});
