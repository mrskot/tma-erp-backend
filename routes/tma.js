// routes/tma.js
const express = require('express');
const router = express.Router();
const db = require('../src/db'); // Модуль подключения к БД

// Проверка Суперадмина
router.post('/auth/telegram', async (req, res) => {
  // Здесь будет реальная проверка initData, пока заглушка:
  const telegramUserId = 123456789; 

  try {
    // Ищем пользователя с ролью 'superadmin'
    const userQuery = 'SELECT id, name, role FROM users WHERE telegram_id = $1 AND role = $2';
    const result = await db.query(userQuery, [telegramUserId, 'superadmin']);
    const user = result.rows[0];

    if (user) {
      res.json({ success: true, message: 'SuperAdmin access granted', user: user });
    } else {
      res.status(401).json({ success: false, error: 'Access denied: not SuperAdmin or User not found' });
    }

  } catch (error) {
    console.error('Ошибка БД при авторизации:', error);
    res.status(500).json({ success: false, error: 'Database error' });
  }
});

// Маршрут для Заявок (заглушка с БД)
router.get('/requests', async (req, res) => {
  try {
    const result = await db.query('SELECT request_id, product_name, status, quantity FROM requests ORDER BY request_id DESC');
    res.json({ success: true, requests: result.rows });
  } catch (error) {
    console.error('Ошибка БД при получении заявок:', error);
    res.status(500).json({ success: false, error: 'Database error fetching requests' });
  }
});

module.exports = router;