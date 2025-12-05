// Используем dotenv для загрузки переменных окружения
require('dotenv').config({ path: './.env' });

module.exports = {
  // === 1. ЛОКАЛЬНАЯ СРЕДА (DEVELOPMENT) ===
  // Если у вас есть локальный PostgreSQL, можно использовать его.
  // Мы будем использовать те же настройки, что и для Production,
  // чтобы сразу тестировать подключение к VPS.
  development: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,      // 212.193.27.144
      user: process.env.DB_USER,      // tma_erp_user
      password: process.env.DB_PASSWORD, // Ваш пароль
      database: process.env.DB_NAME,    // tma_erp
      port: 5432,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations', // Папка, где будут храниться миграции
    },
    seeds: {
      directory: './seeds', // Папка для заполнения БД тестовыми данными
    }
  },

  // === 2. PRODUCTION СРЕДА (VPS) ===
  // Knex будет использовать эти настройки, чтобы применить миграции на боевом сервере.
  production: {
    client: 'pg',
    connection: {
      host: process.env.DB_HOST,
      user: process.env.DB_USER,
      password: process.env.DB_PASSWORD,
      database: process.env.DB_NAME,
      port: 5432,
    },
    migrations: {
      tableName: 'knex_migrations',
      directory: './migrations',
    }
  }
};