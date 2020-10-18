const express = require("express");
const { UserProfileController } = require("../controllers");
const UserAuthController = require("../controllers/index").UserAuthController;
const HomepagePostController=require("../controllers/index").HomepagePostController;
const UserProfileDetailsController=require("../controllers/index").UserProfileDetailsController;
const taskController = require("../controllers/index").taskController;
const VerifyJWT = require("../middleware/jwt");
const router  = express.Router();



// API Routes for User

router.post("/signup",UserAuthController.SignUp);
router.delete("/delete",UserAuthController.Delete);
router.post("/verify",UserAuthController.VerifyUser);
router.post("/login",UserAuthController.Login);
router.post("/forgotpassword",UserAuthController.ForgotPassword);
router.get("/verifyresetlink",UserAuthController.ResetLink);
router.post("/resetpassword",UserAuthController.ResetPassword);
router.post("/changepassword",VerifyJWT,UserAuthController.ChangePassword);


router.post("/profileupload",VerifyJWT,UserProfileController.UploadProfilePicture);
router.delete("/profiledelete",VerifyJWT,UserProfileController.DeleteProfilePicture);

router.post("/profiledetails",VerifyJWT,UserProfileDetailsController.ProfileDetails);

//Homepage Routing

router.post("/addpost",VerifyJWT,HomepagePostController.AddPost);
router.post("/addcomment",VerifyJWT,HomepagePostController.AddComment);
router.post("/addreply",VerifyJWT,HomepagePostController.AddReply);
router.post("/upvote",VerifyJWT,HomepagePostController.UpVote);
router.delete("/deletecomment",VerifyJWT,HomepagePostController.DeleteComment);
router.delete("/deletereply",VerifyJWT,HomepagePostController.DeleteReply);
router.delete("/deletepost",VerifyJWT,HomepagePostController.DeletePost);




router.get("/getpost",VerifyJWT,HomepagePostController.GetPost);

//task router

router.post("/createtask",taskController.Createtask);
router.get("/gettaskinfo/:id",taskController.GetTaskInfo);
router.put("/updatestatus",taskController.Updatestatus);

// export router;
module.exports = router;