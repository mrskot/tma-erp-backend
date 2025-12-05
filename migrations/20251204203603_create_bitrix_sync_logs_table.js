/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('bitrix_sync_logs', (table) => {
    // 1. Идентификация и PK
    table.bigIncrements('id').primary(); 
    
    // 2. Детали операции
    
    // Тип операции: IN (из Bitrix) или OUT (в Bitrix)
    table.enum('direction', ['IN', 'OUT']).notNullable(); 
    
    // Сущность, с которой работаем: DEAL, PRODUCT, USER, etc.
    table.string('entity_type', 50).notNullable(); 
    table.integer('bitrix_entity_id'); // ID сущности в Bitrix24
    
    // 3. Статус и сообщения
    
    // Статус: SUCCESS, FAILED, PENDING
    table.enum('status', ['SUCCESS', 'FAILED', 'PENDING']).notNullable();
    
    table.text('request_payload'); // Отправленные данные (JSON)
    table.text('response_data'); // Полученные данные или ответ об ошибке (JSON)
    table.text('error_message'); // Краткое описание ошибки (если status=FAILED)
    
    // 4. Связь
    // Пользователь, который инициировал синхронизацию (если применимо)
    table.bigInteger('user_id')
         .unsigned()
         .references('id')
         .inTable('users');
         
    // 5. Метаданные
    table.timestamp('created_at').defaultTo(knex.fn.now());
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('bitrix_sync_logs');
};