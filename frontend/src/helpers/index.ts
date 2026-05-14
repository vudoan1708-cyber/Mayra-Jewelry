import type { Session } from "next-auth";
import type { JewelryItemInfo, Prices } from "../../types";

export const slugifyCollection = (name: string) =>
  name
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/Đ/g, 'D')
    .replace(/đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');

export const groupByCollection = (items: JewelryItemInfo[]): Map<string, JewelryItemInfo[]> => {
  const map = new Map<string, JewelryItemInfo[]>();
  items.forEach((item) => {
    const key = item.featureCollection?.trim();
    if (!key) return;
    const bucket = map.get(key);
    if (bucket) bucket.push(item);
    else map.set(key, [item]);
  });
  return map;
};

export const pickHeroItem = (items: JewelryItemInfo[]): JewelryItemInfo | undefined => {
  if (items.length === 0) return undefined;
  return [...items].sort((a, b) => {
    if (a.bestSeller !== b.bestSeller) return a.bestSeller ? -1 : 1;
    if ((b.purchases ?? 0) !== (a.purchases ?? 0)) return (b.purchases ?? 0) - (a.purchases ?? 0);
    return (b.views ?? 0) - (a.views ?? 0);
  })[0];
};

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

export const isMobile = () => window.matchMedia('(pointer: coarse)');

export const userIdOrBase64Email = (user: Session['user']) => user?.id ?? Buffer.from(user?.email ?? '', 'utf8').toString('base64');

type FileLike = { fileName: string; url: string };

export const isBrowseThumbnailKey = (fileName: string) =>
  fileName.endsWith('thumbnail-browse') || fileName.endsWith('file-thumbnail');
export const isDetailThumbnailKey = (fileName: string) => fileName.endsWith('thumbnail-detail');
export const isThumbnailKey = (fileName: string) =>
  isBrowseThumbnailKey(fileName) || isDetailThumbnailKey(fileName);

export const browseThumbnailOf = (media: FileLike[]) =>
  media.find((m) => isBrowseThumbnailKey(m.fileName))?.url;

export const detailHeroOf = (media: FileLike[]) =>
  media.find((m) => isDetailThumbnailKey(m.fileName))?.url ?? browseThumbnailOf(media);

export type VariationName = 'Silver' | 'Gold' | 'White Gold';

export const variationSlug = (v: VariationName): string => v.toLowerCase().replace(/\s+/g, '-');

const SLUG_TO_VARIATION: Record<string, VariationName> = {
  silver: 'Silver',
  gold: 'Gold',
  'white-gold': 'White Gold',
};

const extraFieldRegex = /^extra__([a-z-]+)__(.+)$/;

export const parseExtraField = (
  fileName: string,
): { variation: VariationName; key: string } | null => {
  const tail = fileName.split('/').pop() ?? '';
  const m = extraFieldRegex.exec(tail);
  if (!m) return null;
  const variation = SLUG_TO_VARIATION[m[1]];
  if (!variation) return null;
  return { variation, key: m[2] };
};

export const extraFieldName = (variation: VariationName, key: string) =>
  `extra__${variationSlug(variation)}__${key}`;

export const extrasForVariation = (
  media: FileLike[],
  variation: VariationName,
  fallbackVariation?: VariationName,
): FileLike[] =>
  media.filter((m) => {
    if (isThumbnailKey(m.fileName)) return false;
    const parsed = parseExtraField(m.fileName);
    if (parsed) return parsed.variation === variation;
    return fallbackVariation === variation;
  });

export const legacyExtras = (media: FileLike[]): FileLike[] =>
  media.filter((m) => !isThumbnailKey(m.fileName) && !parseExtraField(m.fileName));

export const minPrice = (prices: Prices[]) => {
  let currentPrice = prices[0].amount;
  prices.forEach((item) => {
    currentPrice = Math.min(item.amount, currentPrice);
  });
  return currentPrice;
};

export const lowestPriceEntry = (prices: Prices[]): Prices =>
  prices.reduce((cheapest, candidate) =>
    candidate.amount < cheapest.amount ? candidate : cheapest, prices[0]);

export const applyDiscount = (amount: number, discount: number | undefined | null): number => {
  if (!discount || discount <= 0) return amount;
  const clamped = Math.min(discount, 1);
  return amount * (1 - clamped);
};

const BuyerTier = {
  SilverTier: 'silver',
  GoldTier: 'gold',
  PlatinumTier: 'platinum',
  DiamondTier: 'diamond',
};
export const convertTierToTextColour = (tier: string) => {
  if (tier === BuyerTier.SilverTier) {
    return 'text-gray-500';
  }
  if (tier === BuyerTier.GoldTier) {
    return 'text-yellow-500';
  }
  if (tier === BuyerTier.PlatinumTier) {
    return 'text-gray-400';
  }
  return 'text-blue-500';
};

export const convertMayraPointToTier = (mayraPoint: number) => {
  switch (true) {
	case mayraPoint < 100:
		return BuyerTier.SilverTier;
	case mayraPoint < 600:
		return BuyerTier.GoldTier
	case mayraPoint < 1200:
		return BuyerTier.PlatinumTier
	case mayraPoint >= 1200:
		return BuyerTier.DiamondTier
	default:
		return ""
	}
};

export const ORDER_STATUS = {
  PENDING_VERIFICATION: 'pending-verification',
  FAILED_VERIFICATION: 'failed-verification',
  VERIFIED: 'verified',
  SHIPPED: 'shipped',
};

export const ENGLISH_TO_VIETNAMESE = {
  Silver: 'Bạc',
  Gold: 'Vàng',
  'White Gold': 'Vàng trắng',
  [ORDER_STATUS.PENDING_VERIFICATION]: 'Đang xác thực thanh toán',
  [ORDER_STATUS.FAILED_VERIFICATION]: 'Lỗi xác thực thanh toán',
  [ORDER_STATUS.VERIFIED]: 'Thành công xác thực thanh toán',
  [ORDER_STATUS.SHIPPED]: 'Đã giao hàng',
};

export const LOGO_SCROLLED_PASSED_EVENT = 'logo_scrolled_passed';
export const SAVE_TO_CART = 'save_to_cart';
export const PAYMENT_INFO = 'CK tiền trang sức Mayra';
export const WAIT = 750;
export const DEFAULT_LOCALE = navigator.language ?? 'vi-VN';
