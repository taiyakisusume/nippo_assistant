import storage from "./storage.ts";
import {decryptAes, encryptAes} from "./crypto.ts";
import {PickOptionValueProps} from "../types";

type OptionId = "auto_reload" | "notification_filter";

export type OptionType = boolean | string;

interface _OptionData<T> {
    id: OptionId;
    title: string;
    description?: string;
    default: T;
}
export interface OptionBase extends _OptionData<OptionType> {}

interface _Option<T> extends _OptionData<T> {
    value: T;
}
export interface Option extends _Option<OptionType> {}

export type StoredOptions = PickOptionValueProps<Option, "value">;

export const OPTION_TEMPLATES: OptionBase[] = [
    {
        id: "auto_reload",
        title: "自動更新",
        description: "自動で入力済み日報を読み込みます",
        default: true,
    },
    {
        id: "notification_filter",
        title: "通知フィルター",
        description: "正規表現にマッチするLIMEの通知を非表示にします",
        default: "",
    },
];

export const getStoredOptions = async () => {
    const encryptedOptions = await storage.get<string>("options");
    if (!encryptedOptions) {
        const options: StoredOptions = {};
        for (const option of OPTION_TEMPLATES) {
            options[option.id] = option.default;
        }
        await setStoredOptions(options);
        return options;
    }
    return JSON.parse(decryptAes(encryptedOptions)) as StoredOptions;
};

export const getStoredOption = async (id: OptionId) => {
    const options = await getStoredOptions();
    return options[id];
};

export const setStoredOptions = async (options: StoredOptions) => {
    const encryptedOptions = encryptAes(JSON.stringify(options));
    await storage.set<string>("options", encryptedOptions);
};
