const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const axios = require('axios'); // Используем axios для прямого запроса к API Telegram
const dotenv = require('dotenv');

dotenv.config();

const TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const WEBHOOK_URL = process.env.WEBHOOK_URL; 
const MINI_APP_URL = process.env.MINI_APP_URL; // Ваш HTTPS Ngrok URL

// Создаем инстанс бота без опций, используя его только для логики сообщений.
const bot = new TelegramBot(TOKEN); 
const botRouter = express.Router(); 

// ------------------------------------------
// ФУНКЦИЯ НАСТРОЙКИ (РУЧНАЯ УСТАНОВКА WEBHOOK)
// ------------------------------------------

/**
 * Устанавливает Webhook для бота, используя прямой HTTP-запрос к Telegram API.
 * Это решает проблему "bot.setWebhook is not a function".
 */
async function setupWebhook() {
    if (!WEBHOOK_URL || !TOKEN) {
        console.error('❌ Не установлены переменные WEBHOOK_URL или TELEGRAM_BOT_TOKEN в .env! Webhook не будет настроен.');
        return;
    }
    
    // Прямой URL для установки Webhook в API Telegram
    const telegramApiUrl = `https://api.telegram.org/bot${TOKEN}/setWebhook`;
    const fullWebhookUrl = `${WEBHOOK_URL}/webhook`; 
    
    console.log('Попытка ручной установки Webhook...');

    try {
        // Выполняем POST-запрос к API Telegram
        const response = await axios.post(telegramApiUrl, {
            url: fullWebhookUrl,
            drop_pending_updates: true 
        });

        if (response.data.ok) {
            console.log(`✅ Telegram Webhook установлен на: ${fullWebhookUrl}`);
            console.log(`Telegram API ответ: ${response.data.description}`);
        } else {
            console.error('❌ Не удалось установить Webhook. Ответ Telegram:', response.data);
        }
    } catch (error) {
        console.error('❌ Ошибка при выполнении HTTP-запроса для установки Webhook:', error.message);
    }
}

// ------------------------------------------
// EXPRESS ROUTE ДЛЯ WEBHOOK
// ------------------------------------------

botRouter.post('/webhook', (req, res) => {
    // Передаем тело запроса инстансу бота
    bot.processUpdate(req.body); 
    res.sendStatus(200); 
});

// ------------------------------------------
// ЛОГИКА БОТА
// ------------------------------------------

bot.onText(/\/start/, (msg) => {
    // *** ИСПРАВЛЕНИЕ: Используем ТОЛЬКО MINI_APP_URL (который является HTTPS) ***
    const appUrl = MINI_APP_URL; 

    if (!appUrl) {
        return bot.sendMessage(msg.chat.id, 'Ошибка: URL Mini App не настроен (MINI_APP_URL отсутствует в .env).');
    }

    const opts = {
        reply_markup: {
            inline_keyboard: [
                [{ text: 'Открыть Mini App', web_app: { url: appUrl } }]
            ]
        }
    };
    bot.sendMessage(msg.chat.id, 'Добро пожаловать в TMA-ERP! Используйте Mini App для входа:', opts);
});

// ------------------------------------------
// ЭКСПОРТ
// ------------------------------------------

module.exports = {
    bot,
    botRouter,
    setupWebhook
};