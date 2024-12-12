const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const https = require('https');

const app = express();

// Логирование
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Тестовый маршрут
app.get('/test', (req, res) => {
    res.send('Proxy server is working!');
});

// Настройка прокси
const proxy = createProxyMiddleware({
    target: 'https://www.youtube.com',
    changeOrigin: true,
    secure: false,
    ws: true,
    agent: new https.Agent({
        rejectUnauthorized: false
    }),
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log('Proxying:', req.method, req.url);
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log('Response:', proxyRes.statusCode);
    },
    onError: (err, req, res) => {
        console.error('Proxy Error:', err);
        res.status(500).send('Proxy Error');
    }
});

app.use('/', proxy);

// Запуск сервера
app.listen(8080, '0.0.0.0', () => {
    console.log('Proxy running on 0.0.0.0:8080');
});