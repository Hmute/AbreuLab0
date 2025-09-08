/*
  ChatGPT usage disclosure:
  Portions of this assignment were created with the assistance of ChatGPT.
*/
(() => {
  "use strict";

  const MESSAGES = {
    // UI labels & buttons
    LABEL_COUNT: "How many buttons to create?",
    BTN_GO: "Go!",

    // Validation
    ERR_RANGE: "Please enter a number between 3 and 7.",
    ERR_INT: "Please enter a whole number.",

    // Status / flow
    STATUS_READY: "Enter a number (3–7) and press Go.",
    STATUS_CREATING: "Creating buttons...",
    STATUS_WAITING: (n) =>
      `Memorize the order… starting in ${n} second${n === 1 ? "" : "s"}…`,
    STATUS_SCRAMBLING: (i, total) => `Scrambling ${i}/${total}…`,
    STATUS_CLICK_TO_PLAY: "Now click buttons in the original order.",
    STATUS_WRONG: "Wrong order!",
    STATUS_WIN: "Excellent memory!",
  };

  // Expose to the app
  window.MESSAGES = MESSAGES;
})();
