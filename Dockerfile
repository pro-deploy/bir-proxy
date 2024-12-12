FROM node:16-alpine

# Устанавливаем дополнительные зависимости
RUN apk add --no-cache curl

WORKDIR /app

# Копируем зависимости
COPY package*.json ./
RUN npm install

# Копируем код
COPY . .

# Увеличиваем лимиты Node.js
ENV NODE_OPTIONS="--max-old-space-size=4096"

# Оптимизируем DNS
RUN echo "nameserver 8.8.8.8" > /etc/resolv.conf
RUN echo "nameserver 8.8.4.4" >> /etc/resolv.conf

EXPOSE 8080

CMD ["node", "server.js"]