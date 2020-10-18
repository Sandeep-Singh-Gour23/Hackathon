const UserAuthController = require("./user/UserAuthController");
const UserProfileController = require("./user/UserProfile");
const HomepagePostController = require("./homepage/HomepagePostController");
const UserProfileDetailsController = require("./user/UserProfileDetails");
const taskController = require("./taskSchedule/taskController")

module.exports = {
  UserAuthController,
  HomepagePostController,
  UserProfileController,
  UserProfileDetailsController,
  taskController

};
