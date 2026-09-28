import { useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

type Seo = { title: string; description: string; canonical: string; robots: string; og_title: string; og_description: string; og_image: string; twitter_title: string; twitter_description: string; twitter_image: string };
function applySeo(seo: Seo) {
  document.title = seo.title;
  const values: [string, string, boolean?][] = [
    ['description', seo.description], ['robots', seo.robots],
    ['og:title', seo.og_title, true], ['og:description', seo.og_description, true], ['og:url', seo.canonical, true], ['og:type', 'website', true], ['og:image', seo.og_image, true],
    ['twitter:card', seo.twitter_image ? 'summary_large_image' : 'summary'], ['twitter:title', seo.twitter_title], ['twitter:description', seo.twitter_description], ['twitter:image', seo.twitter_image],
  ];
  for (const [key, value, property] of values) {
    const attribute = property ? 'property' : 'name';
    const found = [...document.head.querySelectorAll<HTMLMetaElement>(`meta[${attribute}="${key}"]`)];
    const tag = found.shift(); found.forEach(node => node.remove());
    if (!value) { tag?.remove(); continue; }
    const node = tag || document.createElement('meta'); node.setAttribute(attribute, key); node.content = value;
    if (!tag) document.head.appendChild(node);
  }
  const links = [...document.head.querySelectorAll<HTMLLinkElement>('link[rel="canonical"]')];
  const existing = links.shift(); links.forEach(node => node.remove());
  const link = existing || document.createElement('link'); link.rel = 'canonical'; link.href = seo.canonical;
  if (!existing) document.head.appendChild(link);
}
export default function SeoUpdater() {
  const [location] = useLocation();
  useEffect(() => {
    const controller = new AbortController();
    apiFetch(`/api/page-seo?path=${encodeURIComponent(location)}`, { signal: controller.signal })
      .then(async response => { if (!response.ok) throw new Error(); const seo = await response.json(); if (!controller.signal.aborted) applySeo(seo); })
      .catch(() => { /* Retain server-rendered metadata if the API is temporarily unavailable. */ });
    return () => controller.abort();
  }, [location]);
  return null;
}
