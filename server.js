const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const cors = require('cors');

const app = express();
app.use(cors());

// Change this base URL to match the stream origin
const target = 'https://sportzonline.si';

// Proxy rule
app.use('/channels', createProxyMiddleware({
  target,
  changeOrigin: true,
  pathRewrite: {
    '^/channels': '/channels', // keep the path as-is
  },
  onProxyReq: (proxyReq, req, res) => {
    // Optional: modify headers if needed
    proxyReq.setHeader('referer', target);
    proxyReq.setHeader('origin', target);
    proxyReq.setHeader('user-agent', 'Mozilla/5.0');
  }
}));

// Health check
app.get('/', (req, res) => {
  res.send('✅ Proxy server is running!');
});

const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Proxy server listening at http://localhost:${PORT}`);
});
