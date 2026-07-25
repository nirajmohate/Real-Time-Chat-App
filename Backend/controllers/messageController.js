const Messages = require("../models/messageModel");
const User = require("../models/userModel");

// Confirms the two users are actually connected before letting any
// message be read or sent between them. This is the core fix for
// "any user can message/read any other user".
const assertFriends = async (userA, userB) => {
  const me = await User.findById(userA).select("friends");
  if (!me || !me.friends.some((f) => f.toString() === userB)) {
    const err = new Error("You are not connected with this user.");
    err.status = 403;
    throw err;
  }
};

module.exports.getMessages = async (req, res, next) => {
  try {
    const from = req.userId; // never trust a "from" sent by the client
    const { to } = req.body;

    if (!to) return res.status(400).json({ msg: "'to' is required." });
    await assertFriends(from, to);

    const messages = await Messages.find({
      users: { $all: [from, to] },
    }).sort({ updatedAt: 1 });

    const projectedMessages = messages.map((msg) => ({
      fromSelf: msg.sender.toString() === from,
      message: msg.message.text,
    }));
    res.json(projectedMessages);
  } catch (ex) {
    if (ex.status) return res.status(ex.status).json({ msg: ex.message });
    next(ex);
  }
};

module.exports.addMessage = async (req, res, next) => {
  try {
    const from = req.userId; // never trust a "from" sent by the client
    const { to, message } = req.body;

    if (!to || !message) {
      return res.status(400).json({ msg: "'to' and 'message' are required." });
    }
    await assertFriends(from, to);

    const data = await Messages.create({
      message: { text: message },
      users: [from, to],
      sender: from,
    });

    if (data) return res.json({ msg: "Message added successfully." });
    else return res.json({ msg: "Failed to add message to the database" });
  } catch (ex) {
    if (ex.status) return res.status(ex.status).json({ msg: ex.message });
    next(ex);
  }
};
