'use client'

import { use, useEffect, useState } from 'react';
import { base64ToArrayBuffer, subtleCrypto } from '../../../helpers';

const dec = new TextDecoder();

export default function Product({ params }: { params: Promise<{ id: Array<string> }> }) {
  const { id } = use(params);
  const encryptedId = decodeURIComponent(id.join('/'));
  const arrayBufferData = base64ToArrayBuffer(encryptedId);
  const [imgUrl, setImgUrl] = useState<string>('');

  useEffect(() => {
    const getKeys = async () => {
      const keyPair = await subtleCrypto.importKeysFromSessionStorage({ encryptedId });
      return keyPair;
    };
    const getImgUrl = async () => {
      const cryptoKeyPair = await getKeys();
      const buffer = await subtleCrypto.decrypt({ key: cryptoKeyPair, data: arrayBufferData });
      const result = dec.decode(buffer);
      setImgUrl(result);
    };
    getImgUrl();
  }, [arrayBufferData, encryptedId]);

  useEffect(() => {
    if (!imgUrl && !encryptedId) return;
    subtleCrypto.clearItemsFromSessionStorage({ encryptedId });
  }, [imgUrl, encryptedId]);

  return (
    <>
      <img src={`/images/jewelry/${imgUrl}`} loading="lazy" />
      <p>Some item description here...</p>
    </>
  );
}
