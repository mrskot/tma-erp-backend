exports.up = function(knex) {
  return knex.schema.table('users', (table) => {
    table.integer('section_id').nullable(); // Добавляем новый столбец section_id
    
    // Опционально: Добавляем внешний ключ, если у вас уже есть таблица sections
    // table.foreign('section_id').references('sections.id'); 
  });
};

exports.down = function(knex) {
  return knex.schema.table('users', (table) => {
    // Удаляем внешний ключ (если он был)
    // table.dropForeign('section_id'); 
    
    // Удаляем сам столбец
    table.dropColumn('section_id'); 
  });
};