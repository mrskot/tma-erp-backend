/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('otk_results', (table) => {
    // 1. Идентификация и PK
    table.bigIncrements('id').primary(); 
    
    // 2. Связь с инспектором (FK)
    // ID пользователя, который провел проверку (роль: otk_inspector)
    table.bigInteger('inspector_id')
         .unsigned()
         .notNullable()
         .references('id')
         .inTable('users');
    
    // 3. Данные проверки
    table.string('product_sku', 100).notNullable(); // Артикул продукта
    table.integer('quantity_checked').notNullable(); // Проверенное количество
    table.integer('quantity_defective').notNullable().defaultTo(0); // Количество брака
    
    // Статус: OK, NEEDS_REWORK, REJECTED
    table.enum('status', ['OK', 'NEEDS_REWORK', 'REJECTED']).notNullable();
    table.text('notes'); // Комментарии инспектора
    
    // 4. Метаданные
    table.timestamp('checked_at').defaultTo(knex.fn.now()); // Дата и время проверки
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('otk_results');
};