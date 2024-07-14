import {DairyReport, Msg} from "./types";
import {useEffect, useState} from "react";

export default function App() {
    const [reports, setReports] = useState([]);

    const reportPostCallback = (message: Msg<DairyReport[]>) => {
        if (message.type !== "report_post") return;
        setReports(message.data);
    };

    useEffect(() => {
        (async () => {
            // awaitを使うためにasyncで即時関数を使っている
            chrome.runtime.onMessage.addListener(reportPostCallback);
            const tabId = await chrome.tabs
                .query({active: true, currentWindow: true})
                .then((tabs) => tabs[0].id);
            if (!tabId) return;
            await chrome.tabs
                .sendMessage<Msg<undefined>>(tabId, {
                    type: "report_request",
                })
                .catch(() => {});
        })();
        return () => {
            chrome.runtime.onMessage.removeListener(reportPostCallback);
        };
    }, []); // 第二引数に空配列を渡すことで初回レンダリング時のみ実行される

    return (
        <>
            <h1>Vite+React</h1>
            {reports.map((report: DairyReport) => (
                <li key={JSON.stringify(report)}>
                    {report.id.business} / {report.id.service} /{" "}
                    {report.content.major} / {report.content.minor} /{" "}
                    {report.content.detail}
                </li>
            ))}
        </>
    );
}
