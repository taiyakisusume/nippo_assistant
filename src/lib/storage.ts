import {StorageType} from "../types";

const storage = {
    get: async function <T>(key: StorageType) {
        const result = await chrome.storage.local.get(key);
        return result[key] as T;
    },
    set: async function <T>(key: StorageType, value: T) {
        await chrome.storage.local.set({[key]: value});
    },
};

export default storage;
