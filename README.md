# music-skyway

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![JSDocs][jsdocs-src]][jsdocs-href]
[![License][license-src]][license-href]
[![javascript_code style][code-style-image]][code-style-url]

## ⚠️ 免责声明 - 法律风险警告

**本项目仅供学习和研究目的使用。请注意，使用本项目可能违反云音乐的服务条款和相关法律法规。**

- 本项目通过分析和实现云音乐API的加密算法，仅用于技术学习和研究
- 使用本项目可能导致账号被限制或封禁
- 使用本项目产生的任何后果由使用者自行承担
- 项目作者不对因使用本项目而导致的任何问题或法律风险负责

**请负责任地使用本项目，尊重云音乐的服务条款和知识产权。**

### 获取api的原理
云音乐API加密主要使用以下两种算法：

1. **AES加密 + BASE64编码**
2. **RSA加密**

加密流程如下：

1. 将API请求信息转换为JSON字符串，并使用固定密钥进行AES加密和BASE64编码，得到`加密结果A`。
2. 客户端从`abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`随机生成一个16位的密钥，用该密钥对`加密结果A`进行加密，得到`加密结果B`。
3. 为了安全地传输，客户端将随机生成的密钥使用RSA算法加密，得到`加密结果C`。
4. 将`加密结果B`和`加密结果C`发送给服务器，服务器解密后返回数据。

### 加密核心代码
这段代码传入对象后可以直接加密成符合云音乐api加密的结果。
```javascript
/**
 * 生成指定长度的随机字符串
 * @param length 随机字符串长度，默认为16
 */
function generateRandomString(length: number = 16): string {
    const characters = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
    let randomString = "";
    for (let i = 0; i < length; i++) {
        const randomIndex = Math.floor(Math.random() * characters.length);
        randomString += characters.charAt(randomIndex);
    }
    return randomString;
}

/**
 * 使用AES加密并进行BASE64编码
 * @param data 待加密的数据
 * @param secretKey 加密密钥
 */
function aesEncrypt(data: string, secretKey: string): string {
    const key = CryptoJS.enc.Utf8.parse(secretKey); // 将密钥转换为Utf8格式
    const iv = CryptoJS.enc.Utf8.parse(this.AES_VI); // 将偏移量转换为Utf8格式
    const srcs = CryptoJS.enc.Utf8.parse(data);
    const encrypted = CryptoJS.AES.encrypt(srcs, key, { iv, mode: CryptoJS.mode.CBC, padding: CryptoJS.pad.Pkcs7 });
    return encrypted.toString();
}

/**
 * 在字符串左侧填充指定字符，使其达到指定长度
 * @param str 原始字符串
 * @param targetLength 目标长度
 * @param padChar 填充字符，默认为'0'
 */
function leftPad(str: string, targetLength: number, padChar: string = "0"): string {
    while (str.length < targetLength) {
        str = padChar + str;
    }
    return str;
}

/**
 * RSA加密
 * @param text 加密内容
 * @param publicKey RSA公钥
 * @param modulus RSA模数
 */
function rsaEncrypt(text: string, publicKey: string, modulus: string): string {
    const reversedText = text.split("").reverse().join(""); // 反转文本内容
    const biText = bigInt(CryptoJS.enc.Utf8.parse(reversedText).toString(), 16); // 将文本内容转换为BigInt
    const biEx = bigInt(publicKey, 16);
    const biMod = bigInt(modulus, 16);
    const biResult = biText.modPow(biEx, biMod); // 计算RSA加密结果
    return this.leftPad(biResult.toString(16), 256); // 将结果转换为16进制字符串并左侧填充至256位
}

/**
 * 加密算法入口
 * @param obj 待加密对象
 */
function encrypt(obj: any): { params: string; encSecKey: string } {
    const jsonString = JSON.stringify(obj); // 将对象转换为JSON字符串
    const aesSecondKey = this.generateRandomString(16); // 生成AES第二次加密密钥
    const aesFirstEncrypted = this.aesEncrypt(jsonString, this.AES_NONCE); // 使用AES加密（第一次）
    const aesSecondEncrypted = this.aesEncrypt(aesFirstEncrypted, aesSecondKey); // 使用AES加密（第二次）
    const rsaEncryptedSecondKey = this.rsaEncrypt(aesSecondKey, this.RSA_PUBLIC_KEY, this.RSA_MODULUS); // 对AES第二次密钥进行RSA加密
    return {
        params: aesSecondEncrypted,
        encSecKey: rsaEncryptedSecondKey,
    };
}
```

## License

[MIT](./LICENSE) License &copy; 2023-PRESENT [Kirk Lin](https://github.com/kirklin)

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/music-skyway?style=flat&colorA=080f12&colorB=3491fa
[npm-version-href]: https://npmjs.com/package/music-skyway
[npm-downloads-src]: https://img.shields.io/npm/dm/music-skyway?style=flat&colorA=080f12&colorB=3491fa
[npm-downloads-href]: https://npmjs.com/package/music-skyway
[bundle-src]: https://img.shields.io/bundlephobia/minzip/music-skyway?style=flat&colorA=080f12&colorB=3491fa&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=music-skyway
[license-src]: https://img.shields.io/github/license/kirklin/music-skyway.svg?style=flat&colorA=080f12&colorB=3491fa
[license-href]: https://github.com/kirklin/music-skyway/blob/main/LICENSE
[jsdocs-src]: https://img.shields.io/badge/jsdocs-reference-080f12?style=flat&colorA=080f12&colorB=3491fa
[jsdocs-href]: https://www.jsdocs.io/package/music-skyway
[code-style-image]: https://img.shields.io/badge/code__style-%40kirklin%2Feslint--config-3491fa?style=flat&colorA=080f12&colorB=3491fa
[code-style-url]: https://github.com/kirklin/eslint-config/
