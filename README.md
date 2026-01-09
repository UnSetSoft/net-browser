# NetBrowser 🌐

A modern, fast, and privacy-focused web browser built with **Electron**, **React**, and **Vite**. NetBrowser offers a streamlined experience with a powerful tab system, a dynamic sidebar, and integrated security features.

---

## ✨ Features

### 🗂️ Advanced Tab Management
- **Compact Pinned Tabs**: Keep your essential sites organized on the left with favicon-only pinned tabs.
- **Vertical & Horizontal Layouts**: Choose between a standard top bar or a modern vertical tab list in the sidebar.
- **Tab Persistence**: All tabs and states are preserved between sessions.

### 🛡️ Privacy & Security
- **Integrated AdBlocker**: Powerful built-in engine to block intrusive ads and trackers.
- **Privacy Controls**: Native support for **Do Not Track (DNT)** and **Global Privacy Control (GPC)** headers.
- **Secure Sandboxing**: Full process isolation for a safer browsing experience.

### 🎨 Personalization
- **Dynamic Themes**: Seamlessly switch between Light and Dark modes.
- **Flexible UI**: Collapsible sidebar (right-aligned) for a distraction-free view.
- **Quick Shortcuts**: Access your favorite bookmarks and frequent sites from the dynamic grid.

### ⚙️ Power Features
- **Smart Navigation**: Intelligent URL handling that reuses new tabs and optimizes memory.
- **Download Manager**: Full-featured download control with customizable paths.
- **History Explorer**: Search through your browsing history with an intuitive interface.
- **Find in Page**: Quick text search within any webview.

---

## 🚀 Getting Started

### Prerequisites
- [Node.js](https://nodejs.org/) (Recommended: Latest LTS)
- [npm](https://www.npmjs.com/)

### Installation
Clone the repository and install dependencies:
```bash
git clone https://github.com/your-repo/netbrowser.git
cd netbrowser
npm install
```

### Development
Run the application in development mode:
```bash
npm run app
```

To run only the Vite development server (frontend only):
```bash
npm run vite:dev
```

### Building for Production
Create an installer for your operating system:
```bash
npm run app:build
```

---

## 🛠️ Technology Stack
- **Engine**: [Chromium 140](https://www.chromium.org/)
- **Runtime**: [Electron 39](https://www.electronjs.org/)
- **Frontend Architecture**: [React 19](https://react.dev/)
- **Build Tool**: [Vite 7](https://vitejs.dev/)
- **Styling**: Vanilla CSS with Desktop-grade UX
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 🤝 Contributing
Forks are welcome! Feel free to fork this repository and submit improvements or bug fixes. Every contribution helps make NetBrowser better.

---

## 📄 License
This project is licensed under the **UPL-1.0** License - see the [LICENCE.md](LICENCE.md) file for details.

---

Developed with ❤️ by **UnSetSoft**
