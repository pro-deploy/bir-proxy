const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const https = require('https');

const app = express();

// Логирование для отладки
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
    followRedirects: true,
    ws: true,
    xfwd: true, // Передаем original headers
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Encoding': 'gzip, deflate, br',
        'Accept-Language': 'en-US,en;q=0.5',
        'Connection': 'keep-alive'
    },
    pathRewrite: {
        '^/youtube/': '/' // Если нужно убрать префикс из URL
    },
    router: {
        // Можно добавить дополнительные маршруты
        'youtube.com': 'https://www.youtube.com',
        'youtu.be': 'https://youtu.be'
    },
    onProxyReq: (proxyReq, req, res) => {
        console.log('Making request to:', proxyReq.path);
    },
    onProxyRes: (proxyRes, req, res) => {
        console.log('Got response with status:', proxyRes.statusCode);
    },
    onError: (err, req, res) => {
        console.error('Proxy error:', err);
        res.status(500).send('Proxy error occurred');
    }
});

// Применяем прокси ко всем маршрутам
app.use('/', proxy);

// Запускаем сервер
const port = 8080;
app.listen(port, '0.0.0.0', () => {
    console.log(`Proxy server running on port ${port}`);
});