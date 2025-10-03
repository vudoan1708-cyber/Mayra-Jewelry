export const fetchQRCode = async () => {
  const url = 'http://localhost:8080/api/payment/qr';

  try {
    const response = await fetch(url);
    const json = await response.json();
    return json;
  } catch (e) {
    console.error(e);
    throw e;
  }
}
