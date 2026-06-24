const API_BASE_URL = "http://localhost:8000/api/scan/url";

chrome.webNavigation.onBeforeNavigate.addListener(async (details) => {
    // Only check main frame navigations (not iframes/resources)
    if (details.frameId !== 0) return;

    // Ignore extension pages and local files
    if (details.url.startsWith("chrome-extension://") || details.url.startsWith("file://")) return;

    try {
        const response = await fetch(`${API_BASE_URL}?url=${encodeURIComponent(details.url)}`);
        const result = await response.json();

        if (result.is_malicious) {
            // Check if we are already on the warning page to avoid infinite loops
            if (!details.url.includes("warning.html")) {
                const warningUrl = chrome.runtime.getURL(`warning.html?url=${encodeURIComponent(details.url)}&reason=${encodeURIComponent(result.reason)}`);
                chrome.tabs.update(details.tabId, { url: warningUrl });
            }
        }
    } catch (error) {
        console.error("[Xenon Web Shield] Error checking URL:", error);
    }
});
