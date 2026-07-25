const User = require("../models/userModel");
const ChatRequest = require("../models/chatRequestModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const signToken = (userId) =>
  jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

const sanitizeUser = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  isAvatarImageSet: user.isAvatarImageSet,
  avatarImage: user.avatarImage,
});

module.exports.login = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user)
      return res.json({ msg: "Incorrect Username or Password", status: false });
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid)
      return res.json({ msg: "Incorrect Username or Password", status: false });

    const token = signToken(user._id);
    return res.json({ status: true, token, user: sanitizeUser(user) });
  } catch (ex) {
    next(ex);
  }
};

module.exports.register = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;
    const usernameCheck = await User.findOne({ username });
    if (usernameCheck)
      return res.json({ msg: "Username already used", status: false });
    const emailCheck = await User.findOne({ email });
    if (emailCheck)
      return res.json({ msg: "Email already used", status: false });
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email,
      username,
      password: hashedPassword,
    });

    const token = signToken(user._id);
    return res.json({ status: true, token, user: sanitizeUser(user) });
  } catch (ex) {
    next(ex);
  }
};

// Directory of everyone on the platform, each tagged with the current
// user's relationship to them so the UI can show the right button
// (Send Request / Pending / Accept / Chat) — but this list alone does
// NOT let you message anyone; that only happens after "friends" status.
module.exports.getAllUsers = async (req, res, next) => {
  try {
    const me = req.userId;
    const users = await User.find({ _id: { $ne: me } }).select([
      "email",
      "username",
      "avatarImage",
      "friends",
      "_id",
    ]);

    const requests = await ChatRequest.find({
      $or: [{ sender: me }, { receiver: me }],
      status: "pending",
    });

    const meDoc = await User.findById(me).select("friends");
    const friendIds = new Set((meDoc?.friends || []).map((f) => f.toString()));

    const pendingSentTo = new Set(
      requests.filter((r) => r.sender.toString() === me).map((r) => r.receiver.toString())
    );
    const pendingReceivedFrom = new Map(
      requests
        .filter((r) => r.receiver.toString() === me)
        .map((r) => [r.sender.toString(), r._id])
    );

    const result = users.map((u) => {
      const id = u._id.toString();
      let relation = "none";
      let requestId = undefined;
      if (friendIds.has(id)) {
        relation = "friends";
      } else if (pendingSentTo.has(id)) {
        relation = "pending_sent";
      } else if (pendingReceivedFrom.has(id)) {
        relation = "pending_received";
        requestId = pendingReceivedFrom.get(id);
      }
      return {
        _id: u._id,
        username: u.username,
        email: u.email,
        avatarImage: u.avatarImage,
        relation,
        requestId,
      };
    });

    return res.json(result);
  } catch (ex) {
    next(ex);
  }
};

// Only the people you've actually connected with — this is the list
// used to populate the chat sidebar.
module.exports.getContacts = async (req, res, next) => {
  try {
    const me = await User.findById(req.userId).populate(
      "friends",
      "username email avatarImage"
    );
    if (!me) return res.status(404).json({ msg: "User not found" });
    return res.json(me.friends);
  } catch (ex) {
    next(ex);
  }
};

// Pending requests other people have sent to me, awaiting my decision.
module.exports.getIncomingRequests = async (req, res, next) => {
  try {
    const requests = await ChatRequest.find({
      receiver: req.userId,
      status: "pending",
    }).populate("sender", "username email avatarImage");
    return res.json(requests);
  } catch (ex) {
    next(ex);
  }
};

module.exports.sendChatRequest = async (req, res, next) => {
  try {
    const me = req.userId;
    const targetId = req.params.id;

    if (targetId === me) {
      return res.status(400).json({ msg: "You can't send a request to yourself.", status: false });
    }

    const target = await User.findById(targetId);
    if (!target) {
      return res.status(404).json({ msg: "User not found.", status: false });
    }

    const meDoc = await User.findById(me);
    if (meDoc.friends.some((f) => f.toString() === targetId)) {
      return res.json({ msg: "You are already connected with this user.", status: false });
    }

    // If the other person already sent *us* a request, accept it instead
    // of creating a duplicate/opposite one.
    const reverse = await ChatRequest.findOne({
      sender: targetId,
      receiver: me,
      status: "pending",
    });
    if (reverse) {
      reverse.status = "accepted";
      await reverse.save();
      await User.findByIdAndUpdate(me, { $addToSet: { friends: targetId } });
      await User.findByIdAndUpdate(targetId, { $addToSet: { friends: me } });
      return res.json({ msg: "Request accepted. You're now connected.", status: true, relation: "friends" });
    }

    const existing = await ChatRequest.findOne({ sender: me, receiver: targetId });
    if (existing) {
      if (existing.status === "pending") {
        return res.json({ msg: "Request already sent.", status: false });
      }
      existing.status = "pending";
      await existing.save();
    } else {
      await ChatRequest.create({ sender: me, receiver: targetId });
    }

    return res.json({ msg: "Chat request sent.", status: true, relation: "pending_sent" });
  } catch (ex) {
    next(ex);
  }
};

module.exports.respondChatRequest = async (req, res, next) => {
  try {
    const me = req.userId;
    const { requestId } = req.params;
    const { accept } = req.body; // boolean

    const request = await ChatRequest.findById(requestId);
    if (!request || request.receiver.toString() !== me) {
      return res.status(404).json({ msg: "Request not found.", status: false });
    }
    if (request.status !== "pending") {
      return res.json({ msg: "Request already handled.", status: false });
    }

    if (accept) {
      request.status = "accepted";
      await request.save();
      await User.findByIdAndUpdate(me, { $addToSet: { friends: request.sender } });
      await User.findByIdAndUpdate(request.sender, { $addToSet: { friends: me } });
      return res.json({ msg: "Request accepted.", status: true });
    } else {
      request.status = "rejected";
      await request.save();
      return res.json({ msg: "Request rejected.", status: true });
    }
  } catch (ex) {
    next(ex);
  }
};

module.exports.setAvatar = async (req, res, next) => {
  try {
    const userId = req.userId;
    const avatarImage = req.body.image;

    const userData = await User.findByIdAndUpdate(
      userId,
      {
        isAvatarImageSet: true,
        avatarImage,
      },
      { new: true }
    );

    if (!userData) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({
      isSet: userData.isAvatarImageSet,
      image: userData.avatarImage,
    });
  } catch (ex) {
    console.error("Error setting avatar:", ex);
    return res.status(500).json({ error: "Internal Server Error" });
  }
};

module.exports.logOut = (req, res, next) => {
  try {
    global.onlineUsers?.delete(req.userId);
    return res.status(200).send();
  } catch (ex) {
    next(ex);
  }
};
