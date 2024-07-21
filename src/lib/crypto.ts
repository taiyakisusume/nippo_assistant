import {AES, enc, SHA256} from "crypto-js";
import {AES_KEY} from "../const";

export const encryptSha256 = (str: string) => {
    const hash = SHA256(str);
    return hash.toString();
};

export const encryptAes = (str: string) => {
    const encrypted = AES.encrypt(enc.Utf8.parse(str), AES_KEY);
    return encrypted.toString();
};

export const decryptAes = (str: string) => {
    const decrypted = AES.decrypt(str, AES_KEY);
    return decrypted.toString(enc.Utf8);
};
