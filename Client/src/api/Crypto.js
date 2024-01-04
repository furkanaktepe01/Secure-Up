const EC = require('elliptic').ec;
const eccrypto = require("eccrypto");
const crypto = require("crypto");
const CryptoJS = require("crypto-js");

const ec = new EC('secp256k1');

export const generateKeyPair = (seed) => { 

    const key = ec.keyFromPrivate(CryptoJS.SHA256(seed).toString());
    
    const publicKey = key.getPublic();
    const privateKey = key.getPrivate();

    return  { privateKey, publicKey };
}

export const getPublicKey = (...seeds) => {                         
    const { publicKey } = generateKeyPair(seeds.join("")); 
    return publicKey.encode("array");
}

export const getPrivateKey = (...seeds) => {
    const { privateKey } = generateKeyPair(seeds.join("")); 
    return privateKey.toArray();
}

export const encrypt = async (publicKey, message) => { 

    return await eccrypto.encrypt(Buffer.from(publicKey, "utf-8"), Buffer.from(message));
}

export const decrypt = async (privateKey, encrypted) => {

    return await eccrypto.decrypt(Buffer.from(privateKey, "utf-8"), encrypted);
}

export const sha256 = (message) => {

    return crypto.createHash("sha256").update(message).digest(); ;
}

export const sign = async (message, privateKey) => {  
      
    return [...(await eccrypto.sign(privateKey, sha256(message)))];
}

export const verify = (publicKey, message, signature) => {
    
    return eccrypto.verify(Buffer.from(publicKey), Buffer.from(message), Buffer.from(signature))
        .then(() => { return true; })
        .catch(() => { return false; });
}

