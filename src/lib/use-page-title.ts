import { useEffect } from 'react';

export function usePageTitle(title: string, brand = 'KFZ Werk') {
  useEffect(() => {
    const prev = document.title;
    document.title = `${title} · ${brand}`;
    return () => {
      document.title = prev;
    };
  }, [title, brand]);
}
