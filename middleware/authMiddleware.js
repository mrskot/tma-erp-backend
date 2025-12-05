const jwt = require('jsonwebtoken');
const JWT_SECRET = process.env.JWT_SECRET;

const authMiddleware = (req, res, next) => {
    // 1. Проверяем наличие токена в заголовке Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
        // Если токена нет или он в неверном формате
        return res.status(401).json({ message: 'Access denied. No token provided.' });
    }

    // Извлекаем токен из строки 'Bearer <token>'
    const token = authHeader.split(' ')[1];

    try {
        // 2. Верифицируем (расшифровываем) токен
        const decoded = jwt.verify(token, JWT_SECRET);
        
        // 3. Добавляем данные пользователя (id, role) в объект запроса (req)
        // Это позволяет контроллерам знать, кто именно делает запрос.
        req.user = decoded; 
        
        // 4. Переходим к следующему обработчику (к контроллеру)
        next(); 

    } catch (error) {
        // Если токен невалиден или истёк срок действия
        return res.status(403).json({ message: 'Invalid or expired token.' });
    }
};

module.exports = authMiddleware;