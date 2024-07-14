import {SHA256} from "crypto-js";

export const encryptSha256 = (str: string) => {
    const hash = SHA256(str);
    return hash.toString();
};
