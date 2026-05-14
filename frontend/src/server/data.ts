import { type Buyer, type JewelryItemInfo, type Order } from '../../types';
import { cacheRead } from './cache';

export type UseFetchRequest = {
  url: string | URL | Request;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: BodyInit | undefined;
  next?: NextFetchRequestConfig;
  timeoutMs?: number;
}

const CATALOGUE_FETCH_TIMEOUT_MS = 3000;

export const doFetch = async ({ url, method = 'GET', body, next, timeoutMs }: UseFetchRequest) => {
  const controller = timeoutMs ? new AbortController() : null;
  const timer = controller ? setTimeout(() => controller.abort(), timeoutMs) : null;
  try {
    const options: RequestInit = {
      method,
      body: body instanceof FormData ? body : JSON.stringify(body) || undefined,
      ...(next ? { next } : {}),
      ...(controller ? { signal: controller.signal } : {}),
    };
    if (method === 'GET') {
      delete options.body;
    }
    const response = await fetch(url, options);
    if (response.status === 204 || response.status === 201) return;
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.message || 'Unknown error')
    }
    const json = await response.json();
    return json;
  } catch (e) {
    console.error(e);
    throw e;
  } finally {
    if (timer) clearTimeout(timer);
  }
};

const CATALOGUE_REVALIDATE = 60;
const CATALOGUE_TAG = 'catalogue';

export const fetchQRCode = async ({ amount, info }: { amount: string | number, info: string }) => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/qr?amount=${amount}&info=${info ?? ''}`;
  return doFetch({
    url,
    method: 'GET',
  });
};

export const getJewelryItem = (id: string): Promise<JewelryItemInfo | null> => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jewelry/${id}`;
  return cacheRead<JewelryItemInfo>(`item:${id}`, () =>
    doFetch({
      url,
      method: 'GET',
      next: { revalidate: CATALOGUE_REVALIDATE, tags: [CATALOGUE_TAG, `item:${id}`] },
      timeoutMs: CATALOGUE_FETCH_TIMEOUT_MS,
    }),
  );
};
export const getBestSellers = async (): Promise<Array<JewelryItemInfo>> => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jewelry/collection/best`;
  const result = await cacheRead<Array<JewelryItemInfo>>('best-sellers', () =>
    doFetch({
      url,
      method: 'GET',
      next: { revalidate: CATALOGUE_REVALIDATE, tags: [CATALOGUE_TAG, 'best-sellers'] },
      timeoutMs: CATALOGUE_FETCH_TIMEOUT_MS,
    }),
  );
  return result ?? [];
};
export const getAllJewelry = async (): Promise<Array<JewelryItemInfo>> => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jewelry`;
  const result = await cacheRead<Array<JewelryItemInfo>>('all', async () => {
    const response = await doFetch({
      url,
      method: 'GET',
      next: { revalidate: CATALOGUE_REVALIDATE, tags: [CATALOGUE_TAG, 'all'] },
      timeoutMs: CATALOGUE_FETCH_TIMEOUT_MS,
    });
    if (!response) return [];
    return Object.values(response as Record<string, JewelryItemInfo>);
  });
  return result ?? [];
};

export type SiteBanner = {
  id: number;
  enText: string;
  viText: string;
  active: boolean;
  updatedAt: string;
};

export const getSiteBanner = async (): Promise<SiteBanner | null> => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/site/banner`;
  return cacheRead<SiteBanner>('banner', async () => {
    const response = await doFetch({
      url,
      method: 'GET',
      next: { revalidate: CATALOGUE_REVALIDATE, tags: [CATALOGUE_TAG, 'banner'] },
      timeoutMs: CATALOGUE_FETCH_TIMEOUT_MS,
    });
    if (!response) return null as unknown as SiteBanner;
    return response as SiteBanner;
  });
};
export const getFeatureCollectionThumbnails = async (): Promise<Array<JewelryItemInfo>> => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jewelry/collection/feature`;
  const result = await cacheRead<Array<JewelryItemInfo>>('featured', () =>
    doFetch({
      url,
      method: 'GET',
      next: { revalidate: CATALOGUE_REVALIDATE, tags: [CATALOGUE_TAG, 'featured'] },
      timeoutMs: CATALOGUE_FETCH_TIMEOUT_MS,
    }),
  );
  return result ?? [];
};
export const getMostViewedJewelryItems = async (id: string): Promise<Array<JewelryItemInfo>> => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jewelry/${id}/collection/most-views`;
  const result = await cacheRead<Array<JewelryItemInfo>>(`most-viewed:${id}`, () =>
    doFetch({
      url,
      method: 'GET',
      next: { revalidate: CATALOGUE_REVALIDATE, tags: [CATALOGUE_TAG, `most-viewed:${id}`] },
      timeoutMs: CATALOGUE_FETCH_TIMEOUT_MS,
    }),
  );
  return result ?? [];
};

export const updateJewelry = (jewelryInfo: Partial<JewelryItemInfo>): Promise<void> => {
  const formData = new FormData();
  formData.append('directoryId', jewelryInfo.directoryId ?? '');
  formData.append('views', `${(jewelryInfo.views ?? 0)}`);

  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jewelry`;
  return doFetch({
    url,
    method: 'PATCH',
    body: formData,
  });
};

// Orders
export const getOrdersByBuyerId = (buyerId: string): Promise<Array<Order>> => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/order/buyer/${buyerId}`;
  return doFetch({
    url,
    method: 'GET',
  });
};

// Buyers
export const getBuyer = (buyerId: string, filters: Array<string> = []): Promise<Buyer> => {
  const stringFilters = filters.length > 0 ? `?filters=${filters.join(',')}` : '';
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/buyer/${buyerId}${stringFilters}`;
  return doFetch({
    url,
    method: 'GET',
  });
};
