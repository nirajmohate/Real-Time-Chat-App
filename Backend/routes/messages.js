const { addMessage, getMessages } = require("../controllers/messageController");
const { requireAuth } = require("../middleware/auth");
const router = require("express").Router();

router.post("/addmsg", requireAuth, addMessage);
router.post("/getmsg", requireAuth, getMessages);

module.exports = router;
