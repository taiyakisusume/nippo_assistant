import {getStoredOption} from "../lib/options.ts";

// 通知フィルター実行部分
new MutationObserver(async () => {
    const notificationContainerList = document.getElementsByClassName(
        "notistack-SnackbarContainer",
    );
    if (notificationContainerList.length === 0) return;
    const filter = (await getStoredOption("notification_filter")) as string;
    if (!filter) return; // フィルターが空文字の場合は何もしない
    const regexp = new RegExp(filter as string);
    for (const notification of notificationContainerList[0].children) {
        const notificationHTML = notification as HTMLElement;
        if (notificationHTML.style.display === "none") continue;
        const notificationText = notificationHTML.querySelector(
            "#notistack-snackbar",
        )?.textContent as string;
        if (!regexp.test(notificationText)) continue;
        notificationHTML.style.display = "none"; // noneにするといい感じに消える
    }
}).observe(document.body, {
    subtree: true,
    childList: true,
    characterData: true,
});
