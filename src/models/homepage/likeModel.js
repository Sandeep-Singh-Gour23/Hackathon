
// User Model 

const { Model } = require('objection');

class Like extends Model {

  // Table name is the only required property.
  static get tableName() {
    return 'like';
  }

  static get relationMappings(){
      
  }

}

module.exports = Like;