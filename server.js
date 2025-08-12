import express from 'express';
import fetch from 'node-fetch';  // npm install node-fetch@2
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for your frontend domain or all (adjust for security)
app.use(cors({
  origin: '*'  // Replace '*' with your frontend URL in production for security
}));

// Timeout helper for fetch requests
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

// Proxy endpoint to fetch any URL (use with caution, or limit allowed URLs)
app.get('/proxy', async (req, res) => {
  try {
    const targetUrl = req.query.url;
    if (!targetUrl) {
      return res.status(400).json({ error: "Missing 'url' query parameter" });
    }
    console.log(`Proxying request to: ${targetUrl}`);
    const data = await fetchWithTimeout(targetUrl);
    // Return raw HTML content to frontend
    res.set('Content-Type', 'text/html');
    res.send(data);
  } catch (error) {
    console.error('Proxy fetch error:', error.message);
    res.status(500).json({ error: 'Failed to fetch the requested URL' });
  }
});

app.listen(PORT, () => {
  console.log(`Proxy server listening on port ${PORT}`);
});
