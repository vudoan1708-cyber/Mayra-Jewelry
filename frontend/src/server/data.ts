import { type JewelryItemInfo } from '../../types';

export type UseFetchRequest = {
  url: string | URL | Request;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: BodyInit | undefined;
}

export const useFetch = async ({ url, method = 'GET', body }: UseFetchRequest) => {
  try {
    const options: RequestInit = {
      method,
      body,
    };
    if (method === 'GET') {
      delete options.body;
    }
    const response = await fetch(url, options);
    if (!response.ok) {
      const err = await response.json()
      throw new Error(err.message || 'Unknown error')
    }
    const json = await response.json();
    return json;
  } catch (e) {
    console.error(e);
    throw e;
  }
};

export const fetchQRCode = async ({ amount, info }: { amount: string | number, info: string }) => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/qr?amount=${amount}&info=${info ?? ''}`;
  return useFetch({
    url,
    method: 'GET',
  });
};

export const getJewelryItem = (id: string): Promise<JewelryItemInfo> => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jewelry/${id}`;
  return useFetch({
    url,
    method: 'GET',
  });
};
export const getBestSellers = (): Promise<Array<JewelryItemInfo>> => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jewelry/collection/best`;
  return useFetch({
    url,
    method: 'GET',
  });
};
export const getFeatureCollectionThumbnails = (): Promise<Array<JewelryItemInfo>> => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jewelry/collection/feature`;
  return useFetch({
    url,
    method: 'GET',
  });
};
