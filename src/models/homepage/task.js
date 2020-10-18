
// User Model 

const { Model } = require('objection');

class Task extends Model {

  // Table name is the only required property.
  static get tableName() {
    return 'task';
  }
  /*static get relationMappings(){
    const User=require("../user/userModel");
    const Like=require("./likeModel");
    const Comment=require("./commentModel");
    

    return{
        user:{
            relation:Model.HasOneRelation,
            modelClass:User,
            join:{
                from:"post.userId",
                to:"user.id"
            }


        },
        like:{


            relation:Model.HasManyRelation,
            modelClass:Like,
            join:{
                from:"post.id",
                to:"like.postId"
            }
        },
        comment:{

            relation:Model.HasManyRelation,
            modelClass:Comment,
            join:{
                from:"post.id",
                to:"comment.postId"
            }

        }

    }
    

  }*/

}

module.exports = Task;