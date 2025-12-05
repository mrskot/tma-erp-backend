/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('tokens', (table) => {
    // 1. Идентификация
    table.bigIncrements('id').primary(); // Внутренний PK
    table.string('token', 255).notNullable().unique(); // Сам токен (UUID или длинная строка)
    
    // 2. Связь с пользователем
    table.bigInteger('user_id')
         .unsigned() // Указываем, что FK ссылается на положительное число
         .notNullable()
         .references('id')
         .inTable('users') // Ссылка на таблицу users
         .onDelete('CASCADE'); // При удалении пользователя удаляются и его токены
    
    // 3. Метаданные
    table.timestamp('expires_at').notNullable(); // Когда токен перестанет действовать
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('tokens');
};
