/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('production_plans', (table) => {
    // 1. Идентификация и PK
    table.bigIncrements('id').primary(); 
    table.string('plan_code', 50).notNullable().unique(); // Внутренний код плана
    
    // 2. Детали плана
    table.string('product_sku', 100).notNullable(); // Артикул продукта для производства
    table.integer('target_quantity').notNullable(); // Плановое количество
    table.integer('completed_quantity').notNullable().defaultTo(0); // Фактически произведенное количество
    
    // 3. Сроки и статус
    table.date('start_date').notNullable();
    table.date('due_date').notNullable();
    
    // Статус: PLANNED, IN_PROGRESS, COMPLETED, CANCELED
    table.enum('status', ['PLANNED', 'IN_PROGRESS', 'COMPLETED', 'CANCELED']).notNullable().defaultTo('PLANNED');
    
    // 4. Метаданные (Кто создал/обновил)
    table.bigInteger('created_by_user_id')
         .unsigned()
         .references('id')
         .inTable('users');
         
    table.timestamp('created_at').defaultTo(knex.fn.now());
    table.timestamp('updated_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('production_plans');
};