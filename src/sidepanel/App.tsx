import {DairyReport, Msg} from "../types";
import {ChangeEvent, MouseEvent, useEffect, useRef, useState} from "react";
import {CardComponent, SwitchComponent, TooltipComponent} from "../component";
import {
    Button,
    Disclosure,
    DisclosureButton,
    DisclosurePanel,
    Input,
} from "@headlessui/react";
import {ArrowPathIcon, Cog6ToothIcon} from "@heroicons/react/24/outline";
import {
    getStoredOption,
    getStoredOptions,
    OPTION_TEMPLATES,
    OptionType,
    Option,
    setStoredOptions,
    StoredOptions,
} from "../lib/options.ts";

export default function App() {
    const [reports, setReports] = useState<DairyReport[]>([]);

    const reportPostCallback = async (message: Msg<DairyReport[]>) => {
        let flag = false;
        if (message.type == "report_force") flag = true;
        if (message.type == "report_post")
            flag = (await getStoredOption("auto_reload")) as boolean;
        if (!flag) return;
        setReports(message.data);
    };

    const sendReportRequest = async () => {
        const tabs = await chrome.tabs.query({
            active: true,
            currentWindow: true,
        });
        const tabId = tabs[0].id;
        if (!tabId) return;
        await chrome.tabs
            .sendMessage<Msg<string>>(tabId, {
                data: "",
                type: "report_request",
            })
            .catch(() => {});
    };

    const onReloadClick = async (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
        const button = event.currentTarget;
        button.disabled = true;
        const classList = ["text-green-500", "duration-500", "rotate-[360deg]"];
        button.classList.add(...classList);
        setTimeout(() => {
            button.classList.remove(...classList);
            button.disabled = false;
        }, 500);
        await sendReportRequest();
    };

    useEffect(() => {
        (async () => {
            // awaitを使うためにasyncで即時関数を使っている
            chrome.runtime.onMessage.addListener(reportPostCallback);
            await sendReportRequest();
        })();
        return () => {
            chrome.runtime.onMessage.removeListener(reportPostCallback);
        };
    }, []); // 第二引数に空配列を渡すことで初回レンダリング時のみ実行される

    return (
        <div className="h-screen bg-stone-50 font-sans text-sm font-medium">
            <div className="mx-auto flex max-w-2xl flex-col gap-2 p-2">
                <HeaderComponent onReloadClick={onReloadClick} />
                {reports.length > 0 && (
                    <CardComponent>
                        <CurrentReportComponent reports={reports} />
                    </CardComponent>
                )}
            </div>
        </div>
    );
}

interface HeaderProps {
    onReloadClick: (event: MouseEvent<HTMLButtonElement>) => void;
}

const HeaderComponent = (props: HeaderProps) => {
    return (
        <Disclosure>
            <div className="flex justify-between text-gray-500">
                <Button onClick={props.onReloadClick} className="rounded-full">
                    <ArrowPathIcon className="size-8 rounded-full transition-colors hover:text-green-500" />
                </Button>
                <DisclosureButton className="group rounded-full">
                    <Cog6ToothIcon
                        className="size-8 rounded-full transition hover:text-green-500 group-data-[open]:rotate-90
                            group-data-[open]:text-green-500"
                    />
                </DisclosureButton>
            </div>
            <DisclosurePanel>
                <CardComponent>
                    <OptionComponent />
                </CardComponent>
            </DisclosurePanel>
        </Disclosure>
    );
};

const OptionComponent = () => {
    const [update, setUpdate] = useState<boolean>(false); // 強制再レンダリングさせる雑State
    const options = useRef<Option[]>([]);

    const OptionChangeCallback = async (
        value: OptionType,
        option: Option,
        index: number,
    ) => {
        const newOptions = [...options.current];
        newOptions.splice(index, 1, {
            ...option,
            value: value,
        });
        const storingData: StoredOptions = {};
        newOptions.forEach((option) => {
            storingData[option.id] = option.value;
        });
        await setStoredOptions(storingData);
        options.current = newOptions;
    };

    useEffect(() => {
        (async () => {
            const currentOptions = await getStoredOptions();
            options.current = OPTION_TEMPLATES.map((option) => {
                const value = currentOptions[option.id] ?? option.default;
                return {...option, value: value};
            });
            setUpdate(!update);
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <>
            {options.current?.map((option, index) => (
                <div key={index}>
                    {option.id}
                    <TooltipComponent tooltip={option.description}>
                        {typeof option.value === "boolean" && (
                            <SwitchComponent
                                checked={option.value}
                                onChange={async (checked) => {
                                    await OptionChangeCallback(
                                        checked,
                                        option,
                                        index,
                                    );
                                }}
                            />
                        )}
                        {typeof option.value === "string" && (
                            <OptionInputComponent
                                initialValue={option.value}
                                onChange={async (input) => {
                                    await OptionChangeCallback(
                                        input,
                                        option,
                                        index,
                                    );
                                }}
                            />
                        )}
                    </TooltipComponent>
                </div>
            ))}
        </>
    );
};

interface OptionInputProps {
    initialValue: string;
    onChange: (value: string) => void;
}

const OptionInputComponent = (props: OptionInputProps) => {
    const [value, setValue] = useState(props.initialValue);

    const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
        const newValue = event.currentTarget.value;
        props.onChange(newValue);
        setValue(newValue);
    };

    return <Input value={value} onChange={handleChange} />;
};

interface CurrentReportProps {
    reports: DairyReport[];
}

const CurrentReportComponent = (props: CurrentReportProps) => {
    return (
        <>
            {props.reports.map((report: DairyReport) => (
                <div key={JSON.stringify(report)} className="px-4 py-5">
                    {report.id.business} / {report.id.service} /{" "}
                    {report.content.major} / {report.content.minor}
                    {report.content.detail !== null &&
                        ` / ${report.content.detail}`}
                </div>
            ))}
        </>
    );
};
