const express = require('express');
const router = express.Router();
const axios = require('axios');
const {
  checkHTTPS, checkSuspiciousTLD, checkTyposquatting,
  checkExcessiveSubdomains, checkSuspiciousKeywords,
  checkURLLength, checkIPAddress
} = require('../utils/checks');

router.post('/analyze', async (req, res) => {
  const { url } = req.body;

  if (!url) return res.status(400).json({ error: 'No URL provided' });

  let parsedURL;
  try {
    parsedURL = new URL(url.startsWith('http') ? url : 'http://' + url);
  } catch {
    return res.status(400).json({ error: 'Invalid URL format' });
  }

  const hostname = parsedURL.hostname;

  const results = [
    checkHTTPS(url),
    checkIPAddress(hostname),
    checkSuspiciousTLD(hostname),
    checkTyposquatting(hostname),
    checkExcessiveSubdomains(hostname),
    checkSuspiciousKeywords(url),
    checkURLLength(url),
  ];

  // Google Safe Browsing check
  let googleFlagged = false;
  try {
    const response = await axios.post(
      `https://safebrowsing.googleapis.com/v4/threatMatches:find?key=${process.env.GOOGLE_API_KEY}`,
      {
        client: { clientId: 'phishguard', clientVersion: '1.0' },
        threatInfo: {
          threatTypes: ['MALWARE', 'SOCIAL_ENGINEERING', 'UNWANTED_SOFTWARE'],
          platformTypes: ['ANY_PLATFORM'],
          threatEntryTypes: ['URL'],
          threatEntries: [{ url }]
        }
      }
    );
    googleFlagged = response.data.matches && response.data.matches.length > 0;
  } catch (e) {
    console.error('Safe Browsing API error:', e.message);
  }

  if (googleFlagged) {
    results.unshift({ pass: false, msg: '🚨 Flagged by Google Safe Browsing' });
  } else {
    results.unshift({ pass: true, msg: '✅ Not flagged by Google Safe Browsing' });
  }

  const failed = results.filter(r => !r.pass).length;
  const score = Math.max(0, 100 - failed * 14);
  const risk = score >= 80 ? 'Low' : score >= 50 ? 'Medium' : 'High';

  res.json({ url, hostname, score, risk, results });
});

module.exports = router;