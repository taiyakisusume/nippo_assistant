const targetUrl = new URL(import.meta.env.VITE_CONTENT_URL);
let oldUrl = "";

// SPA対応のページ単位トリガー
new MutationObserver(() => {
    const currentUrl = location.href;
    if (oldUrl === currentUrl) return;
    oldUrl = currentUrl;
    window.dispatchEvent(new CustomEvent("urlChange"));
}).observe(document.body, { // DOMの変化はurl更新の必要条件とみなす
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true,
});
window.addEventListener("urlChange", () => {
    if (location.pathname !== targetUrl.pathname) return;
    console.log("content start");
});
