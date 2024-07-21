import storage from "./storage.ts";
import {decryptAes, encryptAes} from "./crypto.ts";
import {OptionTitle, StoredOptions} from "../types";

export const getStoredOptions = async () => {
    const encryptedOptions = await storage.get<string>("options");
    if (!encryptedOptions) {
        const options: StoredOptions = {};
        for (const option of OPTION_TEMPLATES) {
            options[option.title] = option.default;
        }
        await setStoredOptions(options);
        return options;
    }
    return JSON.parse(decryptAes(encryptedOptions)) as StoredOptions;
};

export const getStoredOption = async (title: OptionTitle) => {
    const options = await getStoredOptions();
    return options[title];
};

export const setStoredOptions = async (options: StoredOptions) => {
    const encryptedOptions = encryptAes(JSON.stringify(options));
    await storage.set<string>("options", encryptedOptions);
};

interface OptionData {
    title: OptionTitle;
    default: boolean;
}

export const OPTION_TEMPLATES: OptionData[] = [
    {
        title: "autoReload",
        default: true,
    },
];
