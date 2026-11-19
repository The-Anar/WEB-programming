
"use strict";

// Theme toggle
const themeButton = document.getElementById("theme");

function syncThemeButton() {
    themeButton.textContent =
        document.body.classList.contains("light")
            ? "🌙 Dark mode"
            : "☀️ Light mode";
}

themeButton.addEventListener("click", () => {
    document.body.classList.toggle("light");
    syncThemeButton();
});

syncThemeButton();

// Confirm that the deferred script executed
// after the HTML document was parsed.
const loadStatus = document.getElementById("load-status");

loadStatus.textContent =
    "Success! The HTML was parsed before this deferred script executed.";

// Interactive execution-order demonstration
const runButton = document.getElementById("run");
const demoResults = document.getElementById("demo-results");

runButton.addEventListener("click", () => {
    demoResults.innerHTML = `
        <strong>Deferred script execution order:</strong>
        <ol>
            <li>HTML parsing starts.</li>
            <li>first.js downloads in parallel.</li>
            <li>second.js downloads in parallel.</li>
            <li>HTML parsing finishes.</li>
            <li>first.js executes.</li>
            <li>second.js executes.</li>
        </ol>
        <strong>Result:</strong>
        Deferred scripts execute after HTML parsing
        and preserve their document order.
    `;
});
