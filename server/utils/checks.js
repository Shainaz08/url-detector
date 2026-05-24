const SUSPICIOUS_TLDS = ['.xyz', '.tk', '.ml', '.ga', '.cf', '.gq', '.top', '.click', '.loan'];
const TRUSTED_BRANDS = ['paypal', 'amazon', 'google', 'facebook', 'apple', 'microsoft', 'netflix', 'instagram'];

function checkHTTPS(url) {
  return url.startsWith('https://') 
    ? { pass: true, msg: 'Uses HTTPS' } 
    : { pass: false, msg: 'No HTTPS — connection is not secure' };
}

function checkSuspiciousTLD(hostname) {
  const found = SUSPICIOUS_TLDS.find(tld => hostname.endsWith(tld));
  return found 
    ? { pass: false, msg: `Suspicious TLD: ${found}` } 
    : { pass: true, msg: 'TLD looks normal' };
}

function checkTyposquatting(hostname) {
  // Detects brand names misspelled with numbers or extra chars
  const leet = hostname.replace(/0/g,'o').replace(/1/g,'i').replace(/3/g,'e').replace(/4/g,'a').replace(/5/g,'s');
  const stripped = leet.replace(/^www\./, '').split('.')[0];

  for (const brand of TRUSTED_BRANDS) {
    if (stripped !== brand && levenshtein(stripped, brand) <= 2) {
      return { pass: false, msg: `Possible typosquat of "${brand}"` };
    }
  }
  return { pass: true, msg: 'No brand spoofing detected' };
}

function checkExcessiveSubdomains(hostname) {
  const parts = hostname.split('.');
  return parts.length > 4 
    ? { pass: false, msg: `Suspicious: ${parts.length} subdomains` } 
    : { pass: true, msg: 'Subdomain count looks normal' };
}

function checkSuspiciousKeywords(url) {
  const keywords = ['login', 'verify', 'secure', 'account', 'update', 'banking', 'confirm', 'free', 'winner'];
  const found = keywords.filter(k => url.toLowerCase().includes(k));
  return found.length > 1
    ? { pass: false, msg: `Suspicious keywords: ${found.join(', ')}` }
    : { pass: true, msg: 'No suspicious keywords' };
}

function checkURLLength(url) {
  return url.length > 100 
    ? { pass: false, msg: `URL is very long (${url.length} chars)` } 
    : { pass: true, msg: 'URL length is normal' };
}

function checkIPAddress(hostname) {
  const ipRegex = /^(\d{1,3}\.){3}\d{1,3}$/;
  return ipRegex.test(hostname) 
    ? { pass: false, msg: 'URL uses an IP address instead of a domain' } 
    : { pass: true, msg: 'Uses a proper domain name' };
}

// Simple Levenshtein distance
function levenshtein(a, b) {
  const dp = Array.from({ length: a.length + 1 }, (_, i) => [i]);
  for (let j = 0; j <= b.length; j++) dp[0][j] = j;
  for (let i = 1; i <= a.length; i++)
    for (let j = 1; j <= b.length; j++)
      dp[i][j] = a[i-1] === b[j-1] ? dp[i-1][j-1] : 1 + Math.min(dp[i-1][j], dp[i][j-1], dp[i-1][j-1]);
  return dp[a.length][b.length];
}

module.exports = { checkHTTPS, checkSuspiciousTLD, checkTyposquatting, checkExcessiveSubdomains, checkSuspiciousKeywords, checkURLLength, checkIPAddress };