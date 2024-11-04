let oldUrl = "";

// SPA対応のURL更新イベントを定義
new MutationObserver(() => {
    const currentUrl = location.href;
    if (oldUrl === currentUrl) return;
    oldUrl = currentUrl;
    window.dispatchEvent(new CustomEvent("urlChange"));
}).observe(document.body, {
    // DOMの変化はurl更新の必要条件とみなす
    subtree: true,
    childList: true,
    attributes: true,
    characterData: true,
});
