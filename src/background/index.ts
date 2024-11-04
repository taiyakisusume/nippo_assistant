import {REPORT_APPLY_URL} from "../const";

const enablePanel = async (tabId: number) => {
    await chrome.sidePanel.setOptions({
        tabId,
        path: "src/assets/index.html",
        enabled: true,
    });
};

const disablePanel = async (tabId: number) => {
    await chrome.sidePanel.setOptions({
        tabId,
        enabled: false,
    });
};

const panelController = async (tabId: number) => {
    const tab = await chrome.tabs.get(tabId);
    if (!tab.url) {
        await disablePanel(tabId);
        return;
    }
    const currentUrl = new URL(tab.url);
    if (currentUrl.origin === REPORT_APPLY_URL.origin) {
        await enablePanel(tabId);
        return;
    }
    await disablePanel(tabId);
};

chrome.sidePanel
    .setPanelBehavior({openPanelOnActionClick: true})
    .catch(() => {});
chrome.tabs.onActivated.addListener(async ({tabId}) => panelController(tabId));
chrome.tabs.onUpdated.addListener(async (tabId, changeInfo, tab) => {
    if (changeInfo.status != "complete") return;
    if (tab.status != "complete") return;
    await panelController(tabId);
});
