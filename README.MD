# Lab 0 – Memory Game (OOP with JavaScript Classes)

An interactive memory game that:
1) Creates **n** colored buttons (3–7) in a row (wraps on small screens).  
2) Waits **n** seconds, then **scrambles n times** (every 2 seconds), reading the **current** window/play-area size **before each scramble** so buttons never land outside.  
3) Hides numbers and lets the user click buttons in the **original** order.  
   - Correct clicks reveal that button’s number.  
   - First wrong click reveals all numbers and ends the game.  
   - If all are correct: **“Excellent memory!”**.

---

## Folder Structure (required layout)

project-root/
├─ index.html
├─ css/
│ └─ style.css
├─ js/
│ └─ script.js
└─ lang/
└─ messages/
└─ en/
└─ user.js


- **No inline JS/CSS.** All JavaScript and CSS are external.
- **No `var`.** Only `const` and `let`.
- **No hardcoded UI strings in logic.** All user-facing messages live in `lang/messages/en/user.js`.

---

## How to Run

- Open `index.html` directly in a modern browser **or** serve with a simple static server:
  - Python: `python -m http.server 8080`
  - Node: `npx http-server -p 8080` or `npx serve .`
- In the page:
  1. Enter a number **3–7** and press **Go!**  
  2. Memorize the order while numbers are visible.  
  3. Watch the scrambles.  
  4. After the last scramble, numbers hide—click in the original order.

---

## Implementation Notes

### Object-Oriented Design (≥ 3 classes)
- **`MemoryGame`** – Orchestrates the game flow (create → wait → scramble → play), timers, and state reset.
- **`LayoutManager`** – Switches between row flow and absolute positioning; computes safe random positions based on **live** play-area size.
- **`ButtonTile`** – Encapsulates each button (color, label visibility, enabling clicks, size measurements, absolute positioning).
- **`MessageView`** – (Helper) Displays status with styles (`info`, `ok`, `warn`).

### Window-Aware Scrambling
Before **each** scramble:
- Read `playArea.getBoundingClientRect()` for current bounds.
- Read each button’s `getBoundingClientRect()` to ensure the top-left is chosen so the entire button fits inside the play area.

### Accessibility / UX
- Status element uses `aria-live="polite"`.
- Large, high-contrast buttons (`10em × 5em`).
- “Reduced motion” users: transitions disabled via `prefers-reduced-motion`.

---

## Files Overview

- **`index.html`** – Minimal HTML; loads CSS, then `lang/messages/en/user.js`, then `js/script.js`.
- **`css/style.css`** – All styles (controls, status banners, row/absolute layouts, button dimensions).
- **`lang/messages/en/user.js`** – Centralized messages (labels, validation, statuses).
- **`js/script.js`** – Full OOP logic with classes listed above; uses `const`/`let` only.

---