// src/index.js

// 1. Загрузка переменных окружения должна быть первой
const dotenv = require('dotenv');
dotenv.config(); 

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(require('cors')());
app.use(express.json());

// Подключаем маршруты
const tmaRoutes = require('../routes/tma');
app.use('/api/tma', tmaRoutes);

// --- Маршруты для проверки ---

// Корневой маршрут (Тест CI/CD)
app.get('/', (req, res) => {
  res.json({
    message: '🎉 TMA-ERP CI/CD работает и стабилен!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health Check
app.get('/health', (req, res) => {
  res.json({ status: 'healthy' });
});

// Запуск сервера
app.listen(PORT, () => {
  console.log('✅ Успешное подключение к PostgreSQL'); // Это сообщение оставим, предполагая, что подключение успешно
  console.log(`🎉 TMA-ERP API запущен на порту ${PORT}`);
});
// Final check for Git push