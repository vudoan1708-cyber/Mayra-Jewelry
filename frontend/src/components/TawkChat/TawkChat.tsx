import { useEffect } from 'react';

export default function TawkChat() {
  useEffect(() => {
    const s1 = document.createElement('script');
    s1.async = true;
    s1.src = `https://embed.tawk.to/${process.env.NEXT_PUBLIC_TAWK_PROPERTY_ID}/${process.env.NEXT_PUBLIC_TAWK_WIDGET_ID}`;
    s1.setAttribute('crossorigin', '*');
    document.body.appendChild(s1);

    return () => {
      document.body.removeChild(s1);
    };
  }, []);

  return null;
}
