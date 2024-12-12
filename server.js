const express = require('express');
const { createProxyMiddleware } = require('http-proxy-middleware');
const https = require('https');
const compression = require('compression'); // Добавляем сжатие
const cache = require('memory-cache'); // Добавляем кэширование

const app = express();

// Включаем сжатие
app.use(compression());

// Middleware для кэширования
const cacheMiddleware = (duration) => {
    return (req, res, next) => {
        const key = '__express__' + req.originalUrl || req.url;
        const cachedBody = cache.get(key);

        if (cachedBody) {
            res.send(cachedBody);
            return;
        } else {
            res.sendResponse = res.send;
            res.send = (body) => {
                cache.put(key, body, duration * 1000);
                res.sendResponse(body);
            }
            next();
        }
    }
};

// Настройка прокси с оптимизацией
const proxy = createProxyMiddleware({
    target: 'https://www.youtube.com',
    changeOrigin: true,
    secure: false,
    ws: true,
    agent: new https.Agent({
        keepAlive: true, // Держим соединение активным
        maxSockets: 100, // Увеличиваем количество одновременных соединений
        rejectUnauthorized: false
    }),
    headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept-Encoding': 'gzip, deflate, br' // Поддержка сжатия
    },
    buffer: Buffer.from(50 * 1024 * 1024), // Увеличиваем буфер
    proxyTimeout: 60000, // Таймаут в миллисекундах
    timeout: 60000,
    followRedirects: true,
    onProxyReq: (proxyReq, req, res) => {
        // Оптимизация заголовков
        proxyReq.setHeader('Connection', 'keep-alive');
        console.log('Proxying:', req.method, req.url);
    }
});

app.use('/', proxy);

// Увеличиваем лимиты
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Запуск с оптимизированными настройками
const server = app.listen(8080, '0.0.0.0', () => {
    console.log('Proxy running on 0.0.0.0:8080');
});

// Оптимизация сервера
server.keepAliveTimeout = 120000;
server.headersTimeout = 120000;