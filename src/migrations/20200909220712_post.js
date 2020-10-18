exports.up = function(knex) {
    return knex.schema.createTable("task",function(table){
        table.increments("userid").references("id").inTable("user").onDelete("CASCADE");
        table.string("takedate");
        table.string("taskname");
        table.string("status").defaultTo("no");
        table.text("reward");


        table.timestamps(false, true);

    })
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists("task");
};