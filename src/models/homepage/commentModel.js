
// User Model 

const { Model } = require('objection');

class Comment extends Model {

  // Table name is the only required property.
  static get tableName() {
    return 'comment';
  }

  static get relationMappings(){
    const Reply=require("./replyModel");
    const User=require('../user/userModel');
    return{
        reply:{
            relation:Model.HasManyRelation,
            modelClass:Reply,
            join:{
                from:"comment.id",
                to:"reply.commentId"
            }


        },
        
            user:{
              relation:Model.HasOneRelation,
              modelClass:User,
              join:{
                  from:"comment.userId",
                  to:"user.id"
              }
  
  
          }
    }
}


}

module.exports = Comment;