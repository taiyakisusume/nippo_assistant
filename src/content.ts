import {DairyReport, Msg} from "./types";
import {encryptSha256} from "./lib/crypto.ts";
import {REPORT_APPLY_URL} from "./const";

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

const reportRequestCallback = async (message: Msg<undefined>) => {
    if (message.type !== "report_request") return;
    const targetElement: Element | null =
        document.querySelector(targetSelector);
    if (targetElement == null) {
        await sendReports({type: "report_force", data: []});
        return;
    }
    await targetCallback(targetElement, true)();
};

chrome.runtime.onMessage.addListener(reportRequestCallback);
window.addEventListener("urlChange", () => {
    if (location.pathname !== REPORT_APPLY_URL.pathname) return;
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

const targetCallback =
    (targetElement: Element, isForce = false) =>
    async () => {
        const reports: DairyReport[] = [];
        // childrenがない場合にearly returnしなくても普通に動いてるっぽい?
        // if (targetElement.childElementCount === 0) return;
        const hashSet = new Set<string>();
        for (const child of targetElement.children) {
            const team = child.children[0].textContent!;
            const place = child.children[1].textContent!;
            const id = child.children[2].textContent!.split(" / ", 2);
            const content = child.children[3].textContent!.split(" ");
            let detail: string | null = content.slice(2).join(" ");
            if (!detail) detail = null;
            const data: DairyReport = {
                team: team,
                place: place,
                id: {
                    business: id[0],
                    service: id[1],
                },
                content: {
                    major: content[0],
                    minor: content[1],
                    detail: detail,
                },
            };
            const hash = encryptSha256(JSON.stringify(data));
            if (hashSet.has(hash)) continue;
            reports.push(data);
            hashSet.add(hash);
        }
        const msg: Msg<DairyReport[]> = {
            type: isForce ? "report_force" : "report_post",
            data: reports,
        };
        await sendReports(msg);
    };

const sendReports = async (msg: Msg<DairyReport[]>) => {
    await chrome.runtime.sendMessage<Msg<DairyReport[]>>(msg).catch(() => {}); // listenされなかった際のエラーは握りつぶす
};
