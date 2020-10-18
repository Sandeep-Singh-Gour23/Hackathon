const { okResponse, badRequestError, to } = require("../../global_functions");

const User = require("../../models/user/userModel");
const cloudinary = require("../../../config/Cloudinary").cloudinary;

const UploadProfilePicture = async (req, res) => {
  const image_path = req.files.picture.tempFilePath;
  const userId = req.body.userId;

  cloudinary.uploader.upload(
    image_path,
    { public_id: userId },
    async (failed, uploaded) => {
      if (failed)
        return badRequestError(res, "unable to upload profile picture");

      console.log(uploaded);
      let [error, profile_url_stored] = await to(
        User.query()
          .update({ userProfileImage: uploaded.url })
          .where("id", userId)
          .first()
          .returning("userProfileImage")
          .throwIfNotFound()
      );
      if (error) {
        console.log(error);
        return badRequestError(res, "unable to save profile_url");
      }

      return okResponse(res, profile_url_stored, "profile_url saved");
    }
  );
};

const DeleteProfilePicture = async (req, res) => {
  const userId = req.body.userId;

  const default_url =
    "https://res.cloudinary.com/hmwv9zdrw/image/upload/v1600970783/user_vopbzk.png";

  cloudinary.uploader.destroy(userId, async (error, result) => {
    if (error) {
      console.log(error)
      return badRequestError(res, "unable to remove profile picture");
    }
    console.log(result)

    let [not_set, profile_picture_Set_Default] = await to(
      User.query()
        .update({ userProfileImage: default_url })
        .where("id", userId)
        .first()
        .returning("userProfileImage")
        .throwIfNotFound()
    );
    if (not_set) {
      return badRequestError(res, "unable to remove profile picture");
    }
    return okResponse(res, profile_picture_Set_Default, "profile removed");
  });
};

module.exports = { UploadProfilePicture, DeleteProfilePicture };
