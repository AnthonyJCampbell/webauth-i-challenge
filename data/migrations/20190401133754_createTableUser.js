
exports.up = function(knex, Promise) {
  knex.schema.createTable('users', table => {
    table.increments('user_id');

    users
      .string('username', 128)
      .notNullable()
      .unique();
    users.string('password', 128).notNullable(); 
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTableIfExists('users');
};
