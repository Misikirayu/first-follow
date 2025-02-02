# 🎯 Grammar Set Calculator

A modern web application for computing FIRST, FOLLOW, and PREDICT sets for context-free grammars. Built with pure JavaScript and styled with Tailwind CSS.

![Grammar Set Calculator](preview.gif)

## ✨ Features

- **Real-time Calculation**: Instantly compute FIRST, FOLLOW, and PREDICT sets
- **Modern UI/UX**: Clean and responsive interface with smooth animations
- **Dark Mode**: Toggle between light and dark themes for comfortable viewing
- **Error Handling**: Beautiful error notifications with detailed feedback
- **Line Numbers**: Built-in line numbering for better grammar input
- **Mobile Friendly**: Fully responsive design that works on all devices

## 🚀 Usage

1. Enter your context-free grammar rules in the input area
2. Each rule should be on a new line
3. Use `->` for production rules
4. Use `|` to separate multiple productions
5. Use `epsilon` or `ε` for empty string
6. Click "Calculate Sets" to see the results

### Example Grammar
E  -> T E'
E' -> +T E' | ε
T  -> F T'
T' -> *F T' | ε
F  -> (E) | id


## 🎨 Input Format

- Non-terminals: Single uppercase letters (optionally followed by prime `'`)
- Terminals: Lowercase letters, operators (`+`, `*`), parentheses, and `id`
- Special symbols: `epsilon` or `ε` for empty string
- Production separator: `|`
- Production indicator: `->`

## 🛠️ Technical Details

### Built With
- HTML5
- CSS3 (Tailwind CSS)
- Vanilla JavaScript
- Framer Motion

### Features
- CSS Grid and Flexbox for responsive layouts
- CSS animations and transitions
- Local storage for theme preference
- Error boundary and validation
- Dynamic line numbering

## 🎓 Created By

Haramaya University Computer Science Students 2025

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🤝 Contributing

Contributions, issues, and feature requests are welcome! Feel free to check the [issues page](issues).

## 💡 Acknowledgments

- Inspired by compiler design principles
- UI/UX inspired by modern web applications
- Special thanks to our compiler design course instructor

---
Made with ❤️ by Haramaya University Computer Science Students 2025