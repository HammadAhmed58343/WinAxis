# WinAxis

A lightweight, high-performance GNOME Shell extension designed to instantly center and scale your active window using customizable hotkeys and settings.

Developed for modern GNOME Shell versions (GNOME 45 through GNOME 50+), **WinAxis** brings precise window positioning to your desktop workspace.

---

## 🚀 Features

*   **Quick Center (`<Ctrl>+<Alt>+1`):** Instantly centers the active window on your current monitor while preserving its existing dimensions.
*   **Quick Center Right (`<Ctrl>+<Alt>+2`):** Moves the active window to the center-right of the screen while preserving its dimensions.
*   **Scale & Center (`<Ctrl>+<Alt>+3`):** Resizes the active window to a configurable percentage of your screen area, then centers it.
*   **Customizable Shortcuts:** Directly rebind any hotkey via the preferences GUI.
*   **Maximized Window Handling:** Smart transition logic that unmaximizes or untiles windows and applies positioning smoothly.
*   **Preferences GUI:** Integrates directly with GNOME Extension Manager, allowing you to customize shortcuts and adjust target width and height percentages (from 10% to 100%).
*   **Clean ESM Architecture:** Built natively with modern GNOME GJS and ESM import specifications.

---

## 🛠️ Installation

### Option 1: Manual Installation (From Source)

1. Clone or copy this repository to your local GNOME Shell extensions directory:
   ```bash
   mkdir -p ~/.local/share/gnome-shell/extensions
   git clone https://github.com/HammadAhmed58343/WinAxis.git ~/.local/share/gnome-shell/extensions/winaxis@antigravity
   ```

2. Compile the settings schema:
   ```bash
   glib-compile-schemas ~/.local/share/gnome-shell/extensions/winaxis@antigravity/schemas/
   ```

3. Enable the extension:
   ```bash
   gnome-extensions enable winaxis@antigravity
   ```

4. **Note for Wayland users:** Since GNOME Shell is the display server, you must log out of your session and log back in to force the shell to discover the new extension.

---

## ⌨️ Keyboard Shortcuts

| Setting Key | Action | Default |
| :--- | :--- | :---: |
| `shortcut-center` | Center active window (keep size) | `<Ctrl>+<Alt>+1` |
| `shortcut-center-right` | Move active window to center right (keep size) | `<Ctrl>+<Alt>+2` |
| `shortcut-resize-center` | Resize window and center it | `<Ctrl>+<Alt>+3` |

---

## ⚙️ Configuration & Customization

1. Open the **Extension Manager** (or the default **Extensions** app).
2. Find **WinAxis** and click the **Settings (Gear)** icon (or run `gnome-extensions prefs winaxis@antigravity`).
3. **Change Shortcuts:** Click any shortcut button and press your desired key combination. Press **Backspace/Delete** to disable a shortcut, or **Escape** to cancel.
4. **Adjust Proportions:** Use the spinner controls to adjust the **Target Width (%)** and **Target Height (%)** for the Scale & Center action.

---

## 📄 License

This project is licensed under the GPL-3.0 License. See the LICENSE file for details.

---

## 👨‍💻 Author

Created and maintained by **Hammad Ahmed** ([Dev Dominion](https://github.com/hammad-ahmed)).
