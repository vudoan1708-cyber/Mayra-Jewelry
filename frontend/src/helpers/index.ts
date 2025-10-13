export const subtleCrypto = {
  identifier: 'scrypto_key',
  algorithmName: 'RSA-OAEP',
  exportKeysToSessionStorage: async ({ key, encryptedId }: { key: CryptoKeyPair, encryptedId: string }) => {
    const pubSpki = await crypto.subtle.exportKey('spki', key.publicKey);
    const privPkcs8 = await crypto.subtle.exportKey('pkcs8', key.privateKey);
    sessionStorage.setItem(`rsa_pub_spki_${encryptedId}`, arrayBufferToBase64(pubSpki));
    sessionStorage.setItem(`rsa_priv_pkcs8_${encryptedId}`, arrayBufferToBase64(privPkcs8));
  },
  importKeysFromSessionStorage: async ({ encryptedId }: { encryptedId: string }) => {
    const pubB64 = sessionStorage.getItem(`rsa_pub_spki_${encryptedId}`);
    const privB64 = sessionStorage.getItem(`rsa_priv_pkcs8_${encryptedId}`);

    if (!pubB64 || !privB64) return null;

    const pubAb = base64ToArrayBuffer(pubB64);
    const privAb = base64ToArrayBuffer(privB64);

    const publicKey = await crypto.subtle.importKey(
      'spki',
      pubAb,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      true,
      ['encrypt']
    );

    const privateKey = await crypto.subtle.importKey(
      'pkcs8',
      privAb,
      { name: 'RSA-OAEP', hash: 'SHA-256' },
      true,
      ['decrypt']
    );

    return { publicKey, privateKey };
  },
  clearItemsFromSessionStorage: ({ encryptedId }: { encryptedId: string }) => {
    sessionStorage.removeItem(`rsa_pub_spki_${encryptedId}`);
    sessionStorage.removeItem(`rsa_priv_pkcs8_${encryptedId}`);
  },
  generateEncryptionKey: async () => {
    return await window.crypto.subtle.generateKey(
      {
        name: subtleCrypto.algorithmName,
        modulusLength: 2048,           // key size
        publicExponent: new Uint8Array([1, 0, 1]), // 65537
        hash: 'SHA-256',
      },
      true, // extractable
      ['encrypt', 'decrypt']
    );
  },
  encrypt: async ({ key, data }: { key: CryptoKeyPair, data: BufferSource }) => {
    return await window.crypto.subtle.encrypt(
      {
        name: subtleCrypto.algorithmName,
      },
      key.publicKey,
      data, // Array buffer data of the original data
    );
  },
  decrypt: async ({ key, data }: { key: CryptoKeyPair, data: BufferSource }) => {
    return await window.crypto.subtle.decrypt(
      {
        name: subtleCrypto.algorithmName,
      },
      key.privateKey,
      data, // the encryption data
    );
  },
};

// Convert ArrayBuffer -> Base64 string
export const arrayBufferToBase64 = (buffer: ArrayBuffer) => {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

// Convert Base64 string -> ArrayBuffer
export const base64ToArrayBuffer = (base64: string) => {
  const binary = atob(base64);
  const len = binary.length;
  const buffer = new ArrayBuffer(len);
  const bytes = new Uint8Array(buffer);
  for (let i = 0; i < len; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return buffer;
};

export const ENGLISH_TO_VIETNAMESE = {
  Silver: 'Bạc',
  Gold: 'Vàng',
  'White Gold': 'Vàng trắng',
};

export const LOGO_SCROLLED_PASSED_EVENT = 'logo_scrolled_passed';
export const SAVE_TO_CART = 'save_to_cart';
export const PAYMENT_INFO = '[Mayra Jewelry] Nhận chuyển khoản tiền trang sức';
export const WAIT = 750;
export const DEFAULT_LOCALE = navigator.language ?? 'vi-VN';
