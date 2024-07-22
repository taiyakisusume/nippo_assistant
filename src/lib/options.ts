import storage from "./storage.ts";
import {decryptAes, encryptAes} from "./crypto.ts";
import {StoredOptions} from "../types";

type OptionId = "auto_reload";

export interface OptionData {
    id: OptionId;
    default: boolean;
}

export const OPTION_TEMPLATES: OptionData[] = [
    {
        id: "auto_reload",
        default: true,
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
