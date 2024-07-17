import {DairyReport, Msg} from "./types";
import {useEffect, useState} from "react";
import {CardComponent} from "./component";

export default function App() {
    const [reports, setReports] = useState<DairyReport[]>([]);

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
                .sendMessage<Msg<string>>(tabId, {
                    data: "",
                    type: "report_request",
                })
                .catch(() => {});
        })();
        return () => {
            chrome.runtime.onMessage.removeListener(reportPostCallback);
        };
    }, []); // 第二引数に空配列を渡すことで初回レンダリング時のみ実行される

    return (
        <div className="h-screen bg-stone-50 font-sans text-sm">
            {/* todo: レスポンシブ対応考える */}
            <div className="mx-auto flex max-w-2xl flex-col gap-2 overflow-hidden p-2">
                {reports.length > 0 ? (
                    <CardComponent>
                        <CurrentReportComponent reports={reports} />
                    </CardComponent>
                ) : (
                    <></>
                )}
            </div>
        </div>
    );
}

interface CurrentReportProps {
    reports: DairyReport[];
}

const CurrentReportComponent = (props: CurrentReportProps) => {
    return (
        <>
            {props.reports.map((report: DairyReport) => (
                <li key={JSON.stringify(report)} className="px-4 py-5">
                    {report.id.business} / {report.id.service} /{" "}
                    {report.content.major} / {report.content.minor}
                    {report.content.detail !== null
                        ? ` / ${report.content.detail}`
                        : ""}
                </li>
            ))}
        </>
    );
};
