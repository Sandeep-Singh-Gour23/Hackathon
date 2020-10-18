const { okResponse, badRequestError, to } = require("../../global_functions");
const Post = require("../../models/homepage/postModel");
const Like = require("../../models/homepage/likeModel");
const Comment = require("../../models/homepage/commentModel");
const Reply = require("../../models/homepage/replyModel");
const User = require("../../models/user/userModel");

//Adding Post from Homepage

const AddPost = async (req, res) => {
  let { userId, postContent } = req.body;
  console.log(userId);

  const [unsaved, saved] = await to(
    Post.query()
      .insert({ userId, postContent })
      .returning("*")
      .withGraphFetched("user(Select)")
      .modifiers({
        Select(builder) {
          builder.select("userName", "userProfileImage");
        },
      })
  );
  console.log(unsaved);
  if (unsaved) return badRequestError(res, "unable to save post");
  return okResponse(res, saved, "post saved successfully");
};

//adds or removes LIKE on a post

const UpVote = async (req, res) => {
  let { postId, userId, userName } = req.body;

  //If user clicks on Already Liked post
  //then removing it from post table

  const [not_exists, deleted] = await to(
    Like.query()
      .where("postId", postId)
      .andWhere("userId", userId)
      .first()
      .delete()
      .throwIfNotFound()
  );
  if (deleted) {
    return okResponse(res, deleted, "Like removed");
  }
  //if user clicks on a new post for Liking it

  const [error, like_inserted] = await to(
    Like.query()
      .where("postId", postId)
      .andWhere("userId", userId)
      .insert({ postId, userId, userName, isLike: true })
      .returning("userId")
  );
  if (error) {
    console.log(error);
    return badRequestError(res, "like not stored");
  }
  return okResponse(res, like_inserted, "Liked by user");
};

//Adds a comment on a post
const AddComment = async (req, res) => {
  let { postId, userId, commentText, userName } = req.body;

  // let [error, userProfileImage] = await to(
  //   User.query().select('userProfileImage')
  //     .where("id", userId)
  //     .first()

  // );
  // if (error) return badRequestError(res,"user id not exists");

  const [unsaved, saved] = await to(
    Comment.query()
      .insert({ userId, postId, commentText, userName })
      .returning("*")
      .withGraphFetched("user")
      .modifiers({
        Select(builder) {
          builder.select("userProfileImage");
        },
      })
  );

  if (unsaved) return badRequestError(res, "unable to save comment");

  saved.userProfileImage = userProfileImage.userProfileImage;
  return okResponse(res, saved, "comment saved successfully");
};

//Adds a replies on a comment

const AddReply = async (req, res) => {
  let { postId, commentId, userId, userName, replyText } = req.body;

  // let [error, userProfileImage] = await to(
  //   User.query()
  //     .where("id", userId)
  //     .first()
  //     .returning("userProfileImage")
  //     .throwIfNotFound()
  // );
  // if (error) return badRequestError(res,"user id not exists");

  const [unsaved, saved] = await to(
    Reply.query()
      .insert({ postId, userId, userName, commentId, replyText })
      .returning("*")
      .withGraphFetched("user")
      .modifiers({
        Select(builder) {
          builder.select("userProfileImage");
        },
      })
  );

  if (unsaved) return badRequestError(res, "unable to save reply");

  saved.userProfileImage = userProfileImage.userProfileImage;

  return okResponse(res, saved, "reply saved successfully");
};

//deleting comment from a post
const DeleteComment = async (req, res) => {
  let { id, userId } = req.body;

  const [error, deleted] = await to(
    Comment.query()
      .where("id", id)
      .andWhere("userId", userId)
      .first()
      .delete()
      .throwIfNotFound()
  );

  if (error) return badRequestError(res, "comment id not found");
  return okResponse(res, deleted, "comment deleted successfully");
};

//deleting a reply

const DeleteReply = async (req, res) => {
  let { id, userId } = req.body;

  const [error, deleted] = await to(
    Reply.query()
      .where("id", id)
      .andWhere("userId", userId)
      .first()
      .delete()
      .throwIfNotFound()
  );

  if (error) {
    console.log(error);
    return badRequestError(res, "reply id not found");
  }
  return okResponse(res, deleted, "reply deleted successfully");
};
//Deleting a Post

const DeletePost = async (req, res) => {
  let { userId, id } = req.body;

  let [not_found, deleted] = await to(
    Post.query()
      .where("id", id)
      .andWhere("userId", userId)
      .first()
      .delete()
      .throwIfNotFound()
  );

  if (not_found) return badRequestError(not_found, "Post id not found");
  return okResponse(res, deleted, "Post deleted");
};

//Fetching posts
const GetPost = async (req, res) => {
  let userId = req.body.userId;
  let userName = req.body.userName;
  console.log("user name is ", userName);
  let [error, posts] = await to(
    Post.query()
      .withGraphFetched(
        "[user(SelectUserName),like(SelectUser) as currentUserLike,like(LikeCount) as like,comment(Select).[reply(SelectReply).user(UserDetails),user(UserDetails)]]"
      )
      .modifiers({
        SelectUserName(builder) {
          builder.select("userName", "userProfileImage");
        },
        SelectUser(builder) {
          builder.select("userName").where("userId", userId);
        },
        LikeCount(builder) {
          builder.groupBy("postId").count("isLike");
        },

        Select(builder) {
          builder.select("id", "commentText").orderBy("created_at", "desc");
        },
        UserDetails(builder) {
          builder.select("userProfileImage", "userName");
        },
        SelectReply(builder) {
          builder
            .select("id", "postId", "commentId", "replyText")
            .orderBy("created_at", "desc");
        },
      })

      .throwIfNotFound()
  );

  if (error) {
    console.log(error);
    return badRequestError(res, "unable to get posts");
  }

  return okResponse(res, posts, "get succeed !!");
};

module.exports = {
  AddPost,
  AddComment,
  AddReply,
  UpVote,
  DeleteReply,
  DeleteComment,
  DeletePost,
  GetPost,
};
