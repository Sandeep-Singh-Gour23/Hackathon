
// User Model 

const { Model } = require('objection');

class Reply extends Model {

  // Table name is the only required property.
  static get tableName() {
    return 'reply';
  }

  static get relationMappings(){
      const User=require("../user/userModel");
    return{
     
      user:{
        relation:Model.HasOneRelation,
        modelClass:User,
        join:{
            from:"reply.userId",
            to:"user.id"
        }


    }

    }
  }

}

module.exports = Reply;