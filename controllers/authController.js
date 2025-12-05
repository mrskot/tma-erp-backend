const knex = require('knex');
const knexfile = require('../knexfile');
const jwt = require('jsonwebtoken');

// Инициализируем базу данных
const db = knex(knexfile.development);
const JWT_SECRET = process.env.JWT_SECRET;

// =========================================================
// Вспомогательные функции
// =========================================================

/**
 * Надежно извлекает Telegram ID из строки InitData.
 * @param {string} initData - полная строка, полученная от Telegram WebApp.
 * @returns {string|null} Telegram ID в виде строки или null.
 */
function extractTelegramIdFromInitData(initData) {
    try {
        const urlParams = new URLSearchParams(initData);
        const userParam = urlParams.get('user');
        
        if (userParam) {
            // Telegram передает user как URI-закодированную JSON-строку
            const user = JSON.parse(decodeURIComponent(userParam));
            // Возвращаем ID как строку, чтобы соответствовать типу в БД
            return user.id.toString(); 
        }
    } catch (e) {
        console.error("Error parsing or decoding initData:", e);
        return null;
    }
    return null;
}

/**
 * Создает JWT для пользователя.
 * @param {object} user - объект пользователя из БД.
 * @returns {string} Токен.
 */
function generateToken(user) {
    return jwt.sign(
        { id: user.id, telegram_id: user.telegram_id, role: user.role },
        JWT_SECRET,
        { expiresIn: '7d' } // Токен действует 7 дней
    );
}


// =========================================================
// КОНТРОЛЛЕРЫ АУТЕНТИФИКАЦИИ
// =========================================================

/**
 * @route POST /api/v1/auth/register
 */
const register = async (req, res) => {
    const { telegram_id, role, pin_code, section_id } = req.body;

    if (!telegram_id || !role) {
        return res.status(400).json({ message: 'Missing required fields: telegram_id and role.' });
    }

    try {
        const existingUser = await db('users').where({ telegram_id }).first();

        if (existingUser) {
            await db('users')
                .where({ telegram_id })
                .update({
                    role,
                    pin_code: pin_code || null,
                    section_id: section_id || null,
                    updated_at: new Date()
                });
            return res.status(200).json({ message: 'User updated successfully.', user: existingUser });
        }

        const [newUserId] = await db('users').insert({
            telegram_id,
            role,
            pin_code: pin_code || null,
            section_id: section_id || null
        }).returning('id');

        const newUser = await db('users').where('id', newUserId).first();
        
        return res.status(201).json({ 
            message: 'User registered successfully.', 
            user: { id: newUser.id, telegram_id: newUser.telegram_id, role: newUser.role }
        });

    } catch (error) {
        console.error('Registration error:', error);
        return res.status(500).json({ message: 'Internal server error during registration.' });
    }
};

/**
 * @route POST /api/v1/auth/login
 * Вход в Mini App по PIN-коду и InitData ИЛИ ручному ID.
 */
const login = async (req, res) => {
    // Получаем все возможные поля
    const { pin_code, initData, telegram_id: direct_telegram_id } = req.body; 

    if (!pin_code) {
        return res.status(400).json({ message: 'Missing required field: pin_code.' });
    }
    // Проверяем, что хотя бы один идентификатор присутствует
    if (!initData && !direct_telegram_id) {
        return res.status(400).json({ message: 'Authentication requires either initData or direct telegram_id.' });
    }

    let final_telegram_id = null;
    
    // 1. Если есть InitData, используем его (приоритет)
    if (initData) {
        final_telegram_id = extractTelegramIdFromInitData(initData);
        if (!final_telegram_id) {
            return res.status(400).json({ message: 'Telegram ID could not be extracted from InitData.' });
        }
    } 
    // 2. Иначе используем ID, введенный вручную
    else if (direct_telegram_id) {
        final_telegram_id = direct_telegram_id;
    }

    // Финальная проверка
    if (!final_telegram_id) {
        return res.status(400).json({ message: 'Final Telegram ID is not available.' });
    }
    
    // 3. Поиск пользователя по final_telegram_id и pin_code
    try {
        const user = await db('users')
            .where({ telegram_id: final_telegram_id, pin_code }) 
            .first();

        if (!user) {
            return res.status(401).json({ message: 'Invalid credentials or user not found. Check your PIN or ID.' });
        }
        
        // 4. Обновляем PIN-код, чтобы он не был NULL
        if (!user.pin_code) {
            await db('users').where({ telegram_id: final_telegram_id }).update({ pin_code });
        }
        
        // 5. Генерируем токен и отправляем
        const token = generateToken(user);
        
        return res.status(200).json({ 
            token, 
            user: { 
                telegram_id: user.telegram_id, 
                role: user.role, 
                section_id: user.section_id 
            } 
        });

    } catch (error) {
        console.error('Login error:', error);
        return res.status(500).json({ message: 'Internal server error during login.' });
    }
};

/**
 * @route GET /api/v1/auth/me
 */
const getProfile = async (req, res) => {
    const { id } = req.user;

    try {
        const profile = await db('users')
            .where({ id })
            .select('id', 'telegram_id', 'role', 'section_id', 'created_at')
            .first();
            
        if (!profile) {
            return res.status(404).json({ message: 'User not found.' });
        }

        return res.status(200).json({ profile });
        
    } catch (error) {
        console.error('Get profile error:', error);
        return res.status(500).json({ message: 'Internal server error when fetching profile.' });
    }
};


module.exports = {
    register,
    login,
    getProfile
};