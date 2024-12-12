const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const app = express();

const proxy = createProxyMiddleware({
    target: 'https://www.youtube.com',
    changeOrigin: true,
    secure: false,
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
});

app.use('/', proxy);

app.listen(3000, () => {
    console.log('Proxy running on port 3000');
});