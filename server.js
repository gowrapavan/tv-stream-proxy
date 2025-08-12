const express = require('express');
const fetch = require('node-fetch'); // make sure it's v2, not v3
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());

const fetchWithTimeout = async (url, options = {}, timeout = 7000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    clearTimeout(id);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (err) {
    clearTimeout(id);
    throw err;
  }
};

app.get('/proxy', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) return res.status(400).json({ error: "Missing 'url' parameter" });
    const data = await fetchWithTimeout(targetUrl);
    res.set('Content-Type', 'text/html');
    res.send(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch the requested URL' });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
