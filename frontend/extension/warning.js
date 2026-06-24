document.addEventListener("DOMContentLoaded", () => {
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get("url") || "Unknown URL";
    const reason = urlParams.get("reason") || "Suspicious Activity detected.";

    document.getElementById("malicious-url").textContent = url;
    document.getElementById("block-reason").textContent = reason;

    document.getElementById("btn-back").addEventListener("click", () => {
        // Try to go back in history, or close the tab
        if (window.history.length > 1) {
            window.history.back();
        } else {
            window.close();
        }
    });

    document.getElementById("btn-continue").addEventListener("click", () => {
        // To bypass the restriction, we could temporarily whitelist the URL
        // But for this simple implementation, we'll just show an alert
        alert("Continuing to this site is highly discouraged by Xenon Security. The threat remains active.");
        window.location.href = url; // Navigating back will re-trigger the blocker unless whitelisted!
    });
});
