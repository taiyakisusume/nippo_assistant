const targetUrl = new URL(import.meta.env.VITE_CONTENT_URL);
let oldUrl = "";

// SPA対応のページ単位トリガー
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

const targetSelector =
    "body > div > main > div > div:nth-child(2) > table > tbody";
window.addEventListener("urlChange", () => {
    if (location.pathname !== targetUrl.pathname) return;
    const targetElement: Element | null =
        document.querySelector(targetSelector);
    if (targetElement == null) {
        waitForTargetOccurrence.observe(document.body, {
            subtree: true,
            childList: true,
            attributes: true,
            characterData: true,
        });
        return;
    }
    registerObserver(targetElement);
});
const waitForTargetOccurrence = new MutationObserver(() => {
    const targetElement: Element | null =
        document.querySelector(targetSelector);
    if (targetElement === null) return;
    waitForTargetOccurrence.disconnect();
    registerObserver(targetElement);
});
const registerObserver = (targetElement: Element) => {
    targetCallback(targetElement)();
    targetObserver(targetElement).observe(targetElement, {
        subtree: true,
        childList: true,
        attributes: true,
        characterData: true,
    });
};
const targetObserver = (targetElement: Element) =>
    new MutationObserver(targetCallback(targetElement));

const targetCallback = (targetElement: Element) => () => {
    console.log(targetElement.children.length);
};
