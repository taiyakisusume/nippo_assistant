import {DairyReport, Msg} from "../types";
import {encryptSha256} from "../lib/crypto.ts";
import {REPORT_APPLY_URL} from "../const";

// 入力済み日報が表示されるテーブルのCSSセレクタ
const targetSelector =
    "body > div > main > div > div:nth-child(2) > table > tbody";

// サイドパネルからの日報データリクエストへの対応
// 必ずデータを返す（report_forceを用いる）
const reportRequestCallback = async (message: Msg<undefined>) => {
    if (message.type !== "report_request") return;
    const targetElement: Element | null =
        document.querySelector(targetSelector);
    if (targetElement == null) {
        // 入力済みの日報がない場合でも、無かったことを伝える
        await sendReports({type: "report_force", data: []});
        return;
    }
    // ある場合は普段の処理に任せる
    await targetCallback(targetElement, true)();
};

// データリクエストは常時受け付ける
chrome.runtime.onMessage.addListener(reportRequestCallback);

// url遷移時に目的のページにいるかを確認し監視スクリプトを準備する
window.addEventListener("urlChange", () => {
    if (location.pathname !== REPORT_APPLY_URL.pathname) return;
    const targetElement: Element | null =
        document.querySelector(targetSelector);
    if (targetElement == null) {
        // ターゲットが見つからない場合はターゲットの出現を待つ
        waitForTargetOccurrence.observe(document.body, {
            subtree: true,
            childList: true,
            attributes: true,
            characterData: true,
        });
        return;
    }
    // 既にターゲットが見つかっている場合は直接監視を開始する
    registerObserver(targetElement);
});
const waitForTargetOccurrence = new MutationObserver(() => {
    const targetElement: Element | null =
        document.querySelector(targetSelector);
    if (targetElement === null) return;
    waitForTargetOccurrence.disconnect();
    // ターゲットの変化を監視するスクリプトを実行
    registerObserver(targetElement);
});
const registerObserver = (targetElement: Element) => {
    targetCallback(targetElement)(); // 初期状態データの取得を試みる
    // ターゲットの変化を監視する
    targetObserver(targetElement).observe(targetElement, {
        subtree: true,
        childList: true,
        attributes: true,
        characterData: true,
    });
};
const targetObserver = (targetElement: Element) =>
    new MutationObserver(targetCallback(targetElement));

// 日報データの取得と送信
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
            // サイドパネルからのリクエストに対してはforce, それ以外は通常タイプ
            type: isForce ? "report_force" : "report_post",
            data: reports,
        };
        await sendReports(msg);
    };

const sendReports = async (msg: Msg<DairyReport[]>) => {
    await chrome.runtime.sendMessage<Msg<DairyReport[]>>(msg).catch(() => {}); // listenされなかった際のエラーは握りつぶす
};
