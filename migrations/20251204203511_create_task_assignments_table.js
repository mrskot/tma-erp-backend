/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function(knex) {
  return knex.schema.createTable('task_assignments', (table) => {
    // 1. Идентификация и PK
    table.bigIncrements('id').primary(); 
    
    // 2. Связи
    
    // Ссылка на план производства (production_plans)
    table.bigInteger('plan_id')
         .unsigned()
         .notNullable()
         .references('id')
         .inTable('production_plans')
         .onDelete('CASCADE'); // Если план удален, задача тоже удаляется
         
    // Ссылка на рабочего (users.role = 'worker')
    table.bigInteger('worker_id')
         .unsigned()
         .notNullable()
         .references('id')
         .inTable('users');
         
    // 3. Детали выполнения задачи
    table.integer('assigned_quantity').notNullable(); // Количество, назначенное этому рабочему
    table.integer('completed_quantity').notNullable().defaultTo(0); // Количество, выполненное рабочим
    
    // 4. Статус и сроки
    // Статус: ASSIGNED, IN_PROGRESS, PAUSED, DONE
    table.enum('status', ['ASSIGNED', 'IN_PROGRESS', 'PAUSED', 'DONE']).notNullable().defaultTo('ASSIGNED');
    
    table.timestamp('started_at'); // Время, когда рабочий взял задачу
    table.timestamp('finished_at'); // Время завершения
    
    // 5. Уникальный индекс: Рабочий может быть назначен на один план только один раз
    table.unique(['plan_id', 'worker_id']);
  });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function(knex) {
  return knex.schema.dropTable('task_assignments');
};