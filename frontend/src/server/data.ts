import { type Buyer, type JewelryItemInfo, type Order, type VeriyingOrderPayload } from '../../types';

export type UseFetchRequest = {
  url: string | URL | Request;
  method?: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  body?: BodyInit | undefined;
}

export const doFetch = async ({ url, method = 'GET', body }: UseFetchRequest) => {
  try {
    const options: RequestInit = {
      method,
      body: body instanceof FormData ? body : JSON.stringify(body) || undefined,
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
  }
};

export const fetchQRCode = async ({ amount, info }: { amount: string | number, info: string }) => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/qr?amount=${amount}&info=${info ?? ''}`;
  return doFetch({
    url,
    method: 'GET',
  });
};

export const getJewelryItem = (id: string): Promise<JewelryItemInfo> => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jewelry/${id}`;
  return doFetch({
    url,
    method: 'GET',
  });
};
export const getBestSellers = (): Promise<Array<JewelryItemInfo>> => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jewelry/collection/best`;
  return doFetch({
    url,
    method: 'GET',
  });
};
export const getFeatureCollectionThumbnails = (): Promise<Array<JewelryItemInfo>> => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jewelry/collection/feature`;
  return doFetch({
    url,
    method: 'GET',
  });
};
export const getMostViewedJewelryItems = (id: string): Promise<Array<JewelryItemInfo>> => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/jewelry/${id}/collection/most-views`;
  return doFetch({
    url,
    method: 'GET',
  });
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

// Produce Order
export const requestVerifyingOrder = (payload: VeriyingOrderPayload): Promise<void> => {
  const formData = new FormData();
  formData.append('buyerId', payload.buyerId);
  formData.append('buyerEmail', payload.buyerEmail);
  formData.append('buyerName', payload.buyerName);
  formData.append('digits', payload.digits);
  formData.append('jewelryItems', JSON.stringify(payload.jewelryItems));
  formData.append('totalAmount', payload.totalAmount);
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/buyer/payment/pending-verification`;
  return doFetch({
    url,
    method: 'POST',
    body: formData,
  });
};
export const verifyOrder = (payload: { id: string }): Promise<void> => {
  const formData = new FormData();
  formData.append('id', payload.id);
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/confirm-payment`;
  return doFetch({
    url,
    method: 'POST',
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
export const getBuyerWishlist = (buyerId: string): Promise<Array<JewelryItemInfo>> => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/buyer/${buyerId}/wishlist`;
  return doFetch({
    url,
    method: 'GET',
  });
};
export const addToWishlist = (payload: { buyerId: string, wishlistItems: Array<Partial<JewelryItemInfo>> }): Promise<Buyer> => {
  const formData = new FormData();
  formData.append('buyerId', payload.buyerId);
  formData.append('wishlistItems', JSON.stringify(payload.wishlistItems));
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/buyer/wishlist`;
  return doFetch({
    url,
    method: 'POST',
    body: formData,
  });
};
export const checkIfItemInWishlist = (buyerId: string, directoryId: string): Promise<{found: boolean}> => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/buyer/${buyerId}/wishlist/${directoryId}`;
  return doFetch({
    url,
    method: 'GET',
  });
};
export const deleteFromWishlist = (payload: { buyerId: string; wishlistItems: Array<Partial<JewelryItemInfo>> }): Promise<void> => {
  const formData = new FormData();
  formData.append('buyerId', payload.buyerId);
  formData.append('wishlistItems', JSON.stringify(payload.wishlistItems));
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/user/buyer/wishlist`;
  return doFetch({
    url,
    method: 'DELETE',
    body: formData,
  });
};
