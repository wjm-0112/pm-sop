/**
 * 端到端加密模块 — Web Crypto API 实现，零外部依赖。
 *
 * 加密流程：
 *   密码 ──PBKDF2─SHA256(密码, 随机salt, 150000次)──▶ AES-GCM 256-bit key
 *   明文 ──AES──GCM.encrypt(明文, key, 随机iv)──────▶ 密文
 *
 * 密文包格式（JSON）：
 *   { v: 1, kdf: "PBKDF2-SHA256", iterations: 150000,
 *     salt: "<base64>", iv: "<base64>", ciphertext: "<base64>" }
 *
 * salt / iv 每次加密重新生成，随密文存储（不需要保密）。
 */

const ALGORITHM = { name: 'PBKDF2' } as const;
const HASH = 'SHA-256';
const ITERATIONS = 150000;
const KEY_LENGTH = 256; // bits
const AES_ALGORITHM = { name: 'AES-GCM', length: 256 } as const;

// ---- helpers ----

function bufToBase64(buf: ArrayBuffer): string {
  const bytes = new Uint8Array(buf);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

function base64ToBuf(b64: string): ArrayBuffer {
  const binary = atob(b64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}

// ---- public API ----

export function generateSalt(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(16));
}

export function generateIV(): Uint8Array {
  return crypto.getRandomValues(new Uint8Array(12)); // AES-GCM 推荐 12 字节
}

/** 从密码 + salt 派生 AES-GCM 密钥 */
export async function deriveKey(
  password: string,
  salt: ArrayBuffer,
): Promise<CryptoKey> {
  const enc = new TextEncoder();
  const baseKey = await crypto.subtle.importKey(
    'raw',
    enc.encode(password),
    ALGORITHM,
    false,
    ['deriveKey'],
  );
  return crypto.subtle.deriveKey(
    { name: ALGORITHM.name, hash: HASH, salt, iterations: ITERATIONS },
    baseKey,
    AES_ALGORITHM,
    false,
    ['encrypt', 'decrypt'],
  );
}

/** 加密明文 → 返回密文包 JSON 字符串 */
export async function encryptPayload(
  plaintext: string,
  password: string,
): Promise<string> {
  const salt = generateSalt();
  const iv = generateIV();
  const key = await deriveKey(password, salt.buffer);

  const enc = new TextEncoder();
  const ciphertext = await crypto.subtle.encrypt(
    { name: AES_ALGORITHM.name, iv },
    key,
    enc.encode(plaintext),
  );

  const bundle = {
    v: 1,
    kdf: 'PBKDF2-SHA256',
    iterations: ITERATIONS,
    salt: bufToBase64(salt.buffer),
    iv: bufToBase64(iv.buffer),
    ciphertext: bufToBase64(ciphertext),
  };

  return JSON.stringify(bundle);
}

/** 解密密文包 → 返回明文字符串 */
export async function decryptPayload(
  bundleJson: string,
  password: string,
): Promise<string> {
  let bundle: {
    v: number;
    salt: string;
    iv: string;
    ciphertext: string;
  };
  try {
    bundle = JSON.parse(bundleJson);
  } catch {
    throw new Error('密文格式无效，无法解析');
  }

  const { salt, iv, ciphertext } = bundle;
  const key = await deriveKey(password, base64ToBuf(salt));

  try {
    const decrypted = await crypto.subtle.decrypt(
      { name: AES_ALGORITHM.name, iv: base64ToBuf(iv) },
      key,
      base64ToBuf(ciphertext),
    );
    return new TextDecoder().decode(decrypted);
  } catch {
    throw new Error('解密失败 — 密码可能不正确');
  }
}
