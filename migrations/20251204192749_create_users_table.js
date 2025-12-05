/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  // Определяем ENUM для ролей согласно нашим договоренностям
  const roles = ['super_admin', 'admin', 'otk_inspector', 'manager', 'worker'];

  return knex.schema.createTable('users', (table) => {
    // 1. Идентификация и Первичный ключ
    table.bigIncrements('id').primary(); // Внутренний PK (Sequential integer)
    
    // Используем telegram_id как основной уникальный идентификатор для авторизации
    table.string('telegram_id', 50).unique().notNullable(); 
    table.integer('bitrix24_id').unique(); // ID Bitrix24
    
    // 2. Аутентификация и Роли
    table.string('username').notNullable();
    table.string('password_hash'); // Для хеширования Pin-кода (или будущего пароля)
    table.string('pin_code', 4); // Pin-код для первого входа
    
    // Роли
    table.enum('role', roles).notNullable();
    
    // 3. Статус
    table.boolean('is_active').defaultTo(true); // По умолчанию - активен
    
    // 4. Метаданные 
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());

    // FK для отслеживания, кто создал запись (самоссылка)
    table.bigInteger('created_by_user_id')
         .references('id')
         .inTable('users');
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('users');
};
