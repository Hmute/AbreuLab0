/*
  ChatGPT usage disclosure:
  Portions of this assignment were created with the assistance of ChatGPT.
*/
"use strict";

/* ===================== Constants & selectors ===================== */
const SELECTORS = {
    label: "#btnCountLabel",
    input: "#btnCount",
    go: "#goBtn",
    status: "#status",
    play: "#playArea",
};

const NUM = {
    MIN: 3,
    MAX: 7,
    SCRAMBLE_INTERVAL_MS: 2000, // every 2 seconds
};

/* ===================== MessageView ===================== */
class MessageView {
    constructor(statusEl) { this.statusEl = statusEl; }
    set(text, klass = "") {
        this.statusEl.textContent = text;
        this.statusEl.className = `status ${klass}`.trim();
    }
    info(t) { this.set(t, "info"); }
    ok(t) { this.set(t, "ok"); }
    warn(t) { this.set(t, "warn"); }
}

/* ===================== ButtonTile ===================== */
class ButtonTile {
    constructor(originalIndex, el) {
        this.originalIndex = originalIndex; // 0..n-1
        this.el = el;
        this.revealed = true;
        this.clickEnabled = false;
        this._onClick = null;
    }

    setColor(color) { this.el.style.background = color; }

    setLabelVisible(visible) {
        this.revealed = visible;
        this.el.textContent = visible ? String(this.originalIndex + 1) : "";
        this.el.classList.toggle("revealed", visible);
    }

    enableClick(handler) {
        this._onClick = handler;
        this.clickEnabled = true;
        this.el.classList.add("clickable");
        this.el.classList.remove("disabled");
        this.el.onclick = () => handler(this);
    }

    disableClick() {
        this.clickEnabled = false;
        this.el.classList.remove("clickable");
        this.el.classList.add("disabled");
        this.el.onclick = null;
    }

    getSizePx() {
        const r = this.el.getBoundingClientRect();
        return { w: r.width, h: r.height };
    }

    setAbsolutePosition(leftPx, topPx) {
        this.el.classList.add("tile-abs");
        this.el.style.left = `${leftPx}px`;
        this.el.style.top = `${topPx}px`;
    }
}

/* ===================== LayoutManager ===================== */
class LayoutManager {
    constructor(playArea) { this.playArea = playArea; }

    setFlowLayout() {
        this.playArea.classList.add("row-layout");
        this.playArea.classList.remove("absolute-layout");
    }

    setAbsoluteLayout() {
        this.playArea.classList.remove("row-layout");
        this.playArea.classList.add("absolute-layout");
    }

    /** Compute a safe random (left, top) within the current play area for a box of size {w,h}. */
    randomPositionFor(size) {
        const rect = this.playArea.getBoundingClientRect(); // read fresh size each time
        const maxLeft = Math.max(0, rect.width - size.w);
        const maxTop = Math.max(0, rect.height - size.h);
        const left = Math.floor(Math.random() * (maxLeft + 1));
        const top = Math.floor(Math.random() * (maxTop + 1));
        return { left, top };
    }
}

/* ===================== MemoryGame ===================== */
class MemoryGame {
    constructor({ playArea, messageView, inputEl, goBtn }) {
        this.playArea = playArea;
        this.msg = messageView;
        this.inputEl = inputEl;
        this.goBtn = goBtn;

        this.tiles = [];
        this.expectedIndex = 0;
        this.layout = new LayoutManager(playArea);

        this._timeouts = [];
        this._interval = null;

        this._wireUI();
        this._primeUITexts();
    }

    _wireUI() {
        this.goBtn.addEventListener("click", () => this.start());
        this.inputEl.addEventListener("keydown", (e) => {
            if (e.key === "Enter") this.goBtn.click();
        });
    }

    _primeUITexts() {
        document.querySelector(SELECTORS.label).textContent = window.MESSAGES.LABEL_COUNT;
        this.goBtn.textContent = window.MESSAGES.BTN_GO;
        this.msg.info(window.MESSAGES.STATUS_READY);
    }

    _validateN(raw) {
        if (!/^\d+$/.test(raw)) { this.msg.warn(window.MESSAGES.ERR_INT); return null; }
        const n = Number(raw);
        if (n < NUM.MIN || n > NUM.MAX) { this.msg.warn(window.MESSAGES.ERR_RANGE); return null; }
        return n;
    }

    _clearTimers() {
        this._timeouts.forEach(id => clearTimeout(id));
        this._timeouts = [];
        if (this._interval) clearInterval(this._interval);
        this._interval = null;
    }

    _clearBoard() {
        this.playArea.innerHTML = "";
        this.tiles = [];
        this.expectedIndex = 0;
    }

    start() {
        const n = this._validateN(this.inputEl.value.trim());
        if (n === null) return;

        this.goBtn.disabled = true; // block restarts while setting up/running
        this.msg.info(window.MESSAGES.STATUS_CREATING);
        this._clearTimers();
        this._clearBoard();

        // Create buttons in a flow row layout first
        this.layout.setFlowLayout();
        const frag = document.createDocumentFragment();

        for (let i = 0; i < n; i++) {
            const btn = document.createElement("button");
            btn.className = "tile-btn disabled"; // disabled until play phase
            btn.type = "button";
            btn.style.width = "var(--btn-w)";
            btn.style.height = "var(--btn-h)";
            const tile = new ButtonTile(i, btn);
            tile.setLabelVisible(true); // show numbers to memorize
            tile.setColor(this._randomColor());
            frag.appendChild(btn);
            this.tiles.push(tile);
        }
        this.playArea.appendChild(frag);

        // Wait n seconds before scrambling n times every 2 seconds
        this.msg.info(window.MESSAGES.STATUS_WAITING(n));
        const waitId = setTimeout(() => this._beginScrambles(n), n * 1000);
        this._timeouts.push(waitId);
    }

    _beginScrambles(times) {
        // Switch to absolute layout and pin current positions (avoid an initial jump)
        this.layout.setAbsoluteLayout();

        const parentRect = this.playArea.getBoundingClientRect();
        this.tiles.forEach(tile => {
            const r = tile.el.getBoundingClientRect();
            const left = r.left - parentRect.left;
            const top = r.top - parentRect.top;
            tile.setAbsolutePosition(left, top);
        });

        let count = 0;
        const doScramble = () => {
            count += 1;
            this.msg.info(window.MESSAGES.STATUS_SCRAMBLING(count, times));

            for (const tile of this.tiles) {
                const size = tile.getSizePx(); // read current button size
                const { left, top } = this.layout.randomPositionFor(size); // read current play-area size
                tile.setAbsolutePosition(left, top); // ensures fully inside bounds
            }

            if (count >= times) {
                clearInterval(this._interval);
                this._interval = null;
                this._prepareForClicks();
            }
        };

        // First scramble immediately, then every 2s
        doScramble();
        this._interval = setInterval(doScramble, NUM.SCRAMBLE_INTERVAL_MS);
    }

    _prepareForClicks() {
        // Hide labels and enable interactive memory test
        for (const tile of this.tiles) {
            tile.setLabelVisible(false);
            tile.disableClick(); // cleanup first
            tile.enableClick(this._handleTileClick.bind(this));
        }
        this.msg.ok(window.MESSAGES.STATUS_CLICK_TO_PLAY);
        this.goBtn.disabled = false; // allow starting a new game now
    }

    _handleTileClick(tile) {
        // User must click in original order: 1..n
        if (tile.originalIndex === this.expectedIndex) {
            tile.setLabelVisible(true); // confirm and lock
            tile.disableClick();
            this.expectedIndex += 1;

            if (this.expectedIndex >= this.tiles.length) {
                this.msg.ok(window.MESSAGES.STATUS_WIN);
            }
        } else {
            // Wrong → reveal all correct numbers and end interaction
            for (const t of this.tiles) {
                t.setLabelVisible(true);
                t.disableClick();
            }
            this.msg.warn(window.MESSAGES.STATUS_WRONG);
        }
    }

    _randomColor() {
        const h = Math.floor(Math.random() * 360);
        const s = 70 + Math.floor(Math.random() * 20);
        const l = 50 + Math.floor(Math.random() * 15);
        return `hsl(${h} ${s}% ${l}%)`;
    }
}

/* ===================== Boot ===================== */
window.addEventListener("DOMContentLoaded", () => {
    const game = new MemoryGame({
        playArea: document.querySelector(SELECTORS.play),
        messageView: new MessageView(document.querySelector(SELECTORS.status)),
        inputEl: document.querySelector(SELECTORS.input),
        goBtn: document.querySelector(SELECTORS.go),
    });

    // Default value to speed up testing
    document.querySelector(SELECTORS.input).value = "4";
});
