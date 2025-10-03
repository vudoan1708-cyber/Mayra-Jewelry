export const fetchQRCode = async ({ amount, info }: { amount: string, info: string }) => {
  const url = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api/payment/qr?amount=${amount}&info=${info ?? ''}`;

  try {
    const response = await fetch(url);
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
}
