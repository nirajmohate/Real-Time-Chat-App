const {
  login,
  register,
  getAllUsers,
  getContacts,
  getIncomingRequests,
  sendChatRequest,
  respondChatRequest,
  setAvatar,
  logOut,
} = require("../controllers/userController");
const { requireAuth } = require("../middleware/auth");

const router = require("express").Router();

// Public
router.post("/login", login);
router.post("/register", register);

// Everything below requires a valid login token.
router.get("/allusers", requireAuth, getAllUsers);
router.get("/contacts", requireAuth, getContacts);
router.get("/requests", requireAuth, getIncomingRequests);
router.post("/requests/:id", requireAuth, sendChatRequest); // send a chat request to user :id
router.post("/requests/:requestId/respond", requireAuth, respondChatRequest); // { accept: true|false }
router.post("/setavatar", requireAuth, setAvatar);
router.get("/logout", requireAuth, logOut);

module.exports = router;
