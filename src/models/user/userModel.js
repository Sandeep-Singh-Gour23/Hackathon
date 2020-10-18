
// User Model 

const { Model } = require('objection');

class User extends Model {

  // Table name is the only required property.
  static get tableName() {
    return 'user';
  }
  static get relationMappings() {
    const Task = require("../homepage/task")
    return {
      tasks :{
        relation: Model.HasManyRelation,
        modelClass:Task,
        join : {
          from : "user.id",
          to : "task.userId"
        }
      }
    }
  }

}

module.exports = User;