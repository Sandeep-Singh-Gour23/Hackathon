
exports.up = function(knex) {
    return knex.schema.alterTable("post",function(table){
        table.boolean("isAnonymous").notNullable().defaultTo(false);
    })
};

exports.down = function(knex) {
  
};
