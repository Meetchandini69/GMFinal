import React, { useEffect } from 'react';
import { useLocation } from 'wouter';
import { setCanonical } from '../lib/seo';

export default function SeoUpdater() {
  const [location] = useLocation();

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const canonical = `${window.location.origin}${location}`;
    setCanonical(canonical);
  }, [location]);

  return null;
}
