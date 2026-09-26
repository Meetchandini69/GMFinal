// One canonical link for bot notifications and the member's Telegram message.
export function memberProfileUrl(userId, siteUrl = process.env.SITE_URL || 'https://gigolomeet.in') {
  return `${siteUrl.replace(/\/+$/, '')}/member-profile/${userId}`;
}
