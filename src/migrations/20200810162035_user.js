exports.up = function(knex) {
return knex.schema.createTable("user",function(table){
    table.increments("id").primary();
    table.string("name");
    table.string("email").notNullable().unique();
    table.string("password").notNullable();
    table.string("pic").defaultTo("https://www.securityindustry.org/wp-content/uploads/sites/3/2018/05/noimage.png");
    table.integer("age");
    table.string("gender");
    table.integer("height");
    table.integer("weight")
    table.timestamps(false, true);
})
};

exports.down = function(knex) {
    return knex.schema.dropTableIfExists("user");
};
