const express = require('express');
const dotenv = require('dotenv');
const knex = require('knex');
const knexfile = require('./knexfile');
const path = require('path');
const authRouter = require('./routes/authRouter');
// *** ИМПОРТИРУЕМ РОУТЕР И ФУНКЦИЮ НАСТРОЙКИ ИЗ TELEGRAM-МОДУЛЯ ***
const { botRouter, setupWebhook } = require('./telegramBot'); 

// Загрузка переменных окружения из .env
dotenv.config();

const app = express();
// Используем порт из .env или по умолчанию 3000
const PORT = process.env.PORT || 3000;

// ------------------------------------------
// 1. НАСТРОЙКА MIDDLEWARE
// ------------------------------------------

// Парсинг тела запроса в формате JSON. Должен быть в начале!
app.use(express.json()); 

// Обслуживание статических файлов для Mini App (index.html, app.js, styles.css)
app.use(express.static(path.join(__dirname, 'public'))); 

// ------------------------------------------
// 2. МАРШРУТЫ API И WEBHOOK
// ------------------------------------------

// Маршруты аутентификации (например, /api/v1/auth/login)
app.use('/api/v1/auth', authRouter);

// *** МАРШРУТ ДЛЯ TELEGRAM WEBHOOK ***
// Обрабатывает POST-запросы от Telegram на адрес /webhook
app.use(botRouter); 

// ------------------------------------------
// 3. ЗАПУСК СЕРВЕРА И ПОДКЛЮЧЕНИЕ К БД
// ------------------------------------------

const db = knex(knexfile.development);

// Проверка подключения к базе данных
db.raw('SELECT 1')
  .then(() => {
    console.log('✅ Connected successfully to PostgreSQL.');
    
    // Запуск сервера Express. Используем async/await для настройки Webhook.
    app.listen(PORT, async () => { 
      console.log(`🚀 Server is running on port ${PORT}`);
      console.log(`API URL Base: http://localhost:${PORT}/api/v1`);
      
      // *** ВЫЗЫВАЕМ НАСТРОЙКУ WEBHOOK ПРИ ЗАПУСКЕ ***
      // Это регистрирует ваш Ngrok URL в Telegram.
      await setupWebhook(); 
    });
  })
  .catch((error) => {
    console.error('❌ Failed to connect to PostgreSQL:', error.message);
    // Завершаем процесс, если нет подключения к БД
    process.exit(1);
  });