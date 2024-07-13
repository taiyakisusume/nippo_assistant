const targetUrl = new URL(import.meta.env.VITE_CONTENT_URL);

const panelController = async (tabId: number) => {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url) return;
    const currentUrl = new URL(tab.url);
    if (currentUrl.origin === targetUrl.origin) {
        await chrome.sidePanel.setOptions({
            tabId,
            path: "index.html",
            enabled: true,
        });
    } else {
        // Disables the side panel on all other sites
        await chrome.sidePanel.setOptions({
            tabId,
            enabled: false,
        });
    }
};

chrome.tabs.onUpdated.addListener(async (tabId) => panelController(tabId));
chrome.tabs.onActivated.addListener(async ({tabId}) => panelController(tabId));
