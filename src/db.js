// src/db.js
const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT || 5432,
});

pool.query('SELECT NOW()')
  .then(res => console.log('✅ Успешное подключение к PostgreSQL'))
  .catch(err => console.error('❌ Ошибка подключения к PostgreSQL:', err.stack));

module.exports = {
  query: (text, params) => pool.query(text, params),
  pool,
};