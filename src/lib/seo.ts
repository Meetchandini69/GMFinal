export function setCanonical(url: string) {
  if (typeof document === 'undefined') return;
  let link = document.querySelector("link[rel='canonical']") as HTMLLinkElement | null;
  if (!link) {
    link = document.createElement('link');
    link.setAttribute('rel', 'canonical');
    document.head.appendChild(link);
  }
  link.href = url;
}

export function setCanonicalToCurrent() {
  if (typeof window === 'undefined') return;
  setCanonical(window.location.origin + window.location.pathname + window.location.search);
}
