const { okResponse, badRequestError, to } = require("../../global_functions");

const User = require("../../models/user/userModel");

const ProfileDetails = async (req, res) => {

    const user_id = req.body.user_id;
     console.log("userId",user_id);
  
    const [error, profiledetails] = await to(User.query()
      .where("id", user_id)
      .first()
      .select("id", "userProfileImage", "fullName", "userName", "bio")
      .withGraphFetched("[posts(Select)]")
      .modifiers({
        Select(builder){
          builder.select("id","postContent","created_at")
          .where("isAnonymous","false")
          .orderBy("created_at","desc")
        }
      })
      ); 
      if(error){
        return badRequestError(res, "unable to fetch user details");
      }
    // console.log(profiledetails)
    return okResponse(res, profiledetails, "user profile details");
  
  }

  module.exports = { ProfileDetails };