const express = require('express');
const authController = require('../controllers/authController'); 
const authMiddleware = require('../middleware/authMiddleware');
const router = express.Router();

// Маршрут для регистрации/создания нового пользователя
// URL: /api/v1/auth/register
router.post('/register', authController.register);

// Маршрут для входа
// URL: /api/v1/auth/login
router.post('/login', authController.login);

// НОВЫЙ ЗАЩИЩЕННЫЙ МАРШРУТ: /api/v1/auth/me
// authMiddleware запустится ПЕРЕД authController.getProfile
router.get('/me', authMiddleware, authController.getProfile);

module.exports = router;