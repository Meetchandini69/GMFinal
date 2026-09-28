export const SEO_FIELDS = ['title','description','canonical','robots','og_title','og_description','og_image','twitter_title','twitter_description','twitter_image'];
export function seoPath(path) {
  if (typeof path !== 'string' || !/^\/[a-zA-Z0-9/_-]*$/.test(path) || path.includes('//')) throw new Error('Use a page path such as /coimbatore.');
  return path.replace(/\/+$/, '') || '/';
}
export function privateSeoPath(path) {
  return /^\/(admin|dashboard|login|member-profile|registration-thank-you)(\/|$)/.test(path);
}
export function resolveSeo(path, page = null, overrides = {}, site = 'https://gigolomeet.in') {
  path = seoPath(path);
  const origin = new URL(site).origin;
  const builtins = { '/coimbatore': 'Coimbatore', '/hyderabad': 'Hyderabad', '/kolkata': 'Kolkata' };
  const city = page?.city || builtins[path];
  const labels = { '/': 'Gigolo Jobs in India', '/free-registration': 'Member Registration', '/login': 'Member Login', '/dashboard': 'Member Panel', '/registration-thank-you': 'Registration Complete' };
  const known = !!city || Object.hasOwn(labels, path) || privateSeoPath(path);
  const title = page?.title || `${city ? `Gigolo Services in ${city}` : labels[path] || (privateSeoPath(path) ? 'Private Member Area' : 'Page Not Found')} | GigoloMeet`;
  const description = page?.meta_description || (city
    ? `Explore GigoloMeet membership and companionship opportunities in ${city}${page?.state ? ', '+page.state : ''}. Choose a joining plan and register your profile. Joining fees apply.`
    : path === '/' ? 'Explore GigoloMeet membership and companionship opportunities across India. Choose a joining plan and create your profile. Joining fees apply.'
    : path === '/free-registration' ? 'Choose your GigoloMeet joining plan, create your login and complete your member profile. Joining fees are required for registration.'
    : privateSeoPath(path) ? 'Sign in to securely manage your GigoloMeet account and profile.' : 'The requested GigoloMeet page could not be found.');
  const seo = { title, description, canonical: origin + (path === '/' ? '/' : path), robots: known && !privateSeoPath(path) ? 'index, follow' : 'noindex, nofollow' };
  for (const field of SEO_FIELDS) if (typeof overrides[field] === 'string' && overrides[field].trim()) seo[field] = overrides[field].trim();
  if (privateSeoPath(path) || !known) seo.robots = 'noindex, nofollow';
  seo.og_title ||= seo.title; seo.og_description ||= seo.description; seo.og_image ||= '';
  seo.twitter_title ||= seo.og_title; seo.twitter_description ||= seo.og_description; seo.twitter_image ||= seo.og_image;
  return { ...seo, path, found: known };
}
export function seoTags(seo) {
  const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]));
  const meta = (key, value, property = false) => `<meta ${property ? 'property' : 'name'}="${key}" content="${escape(value)}" />`;
  return `<title>${escape(seo.title)}</title>\n` + [
    meta('description',seo.description), meta('robots',seo.robots),
    meta('og:title',seo.og_title,true),meta('og:description',seo.og_description,true),meta('og:url',seo.canonical,true),meta('og:type','website',true),
    ...(seo.og_image ? [meta('og:image',seo.og_image,true)] : []),
    meta('twitter:card',seo.twitter_image ? 'summary_large_image' : 'summary'),meta('twitter:title',seo.twitter_title),meta('twitter:description',seo.twitter_description),
    ...(seo.twitter_image ? [meta('twitter:image',seo.twitter_image)] : []),
    `<link rel="canonical" href="${escape(seo.canonical)}" />`,
  ].join('\n');
}
export function renderSeoHtml(html, seo) {
  return html.replace(/<title\b[^>]*>[\s\S]*?<\/title>/gi, '')
    .replace(/<meta\b(?=[^>]*(?:name|property)\s*=\s*["'](?:description|robots|og:[^"']*|twitter:[^"']*)["'])[^>]*>/gi, '')
    .replace(/<link\b(?=[^>]*rel\s*=\s*["']canonical["'])[^>]*>/gi, '')
    .replace(/<\/head>/i, `${seoTags(seo)}\n</head>`);
}
