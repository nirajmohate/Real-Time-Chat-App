const jwt = require("jsonwebtoken");

// Protects a route: requires a valid "Authorization: Bearer <token>" header.
// On success, sets req.userId to the authenticated user's id — every
// controller should use req.userId instead of trusting an id from the
// request body/params, otherwise a user could pretend to be someone else.
module.exports.requireAuth = (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;

    if (!token) {
      return res.status(401).json({ msg: "Not authenticated.", status: false });
    }

    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.userId = payload.id;
    next();
  } catch (ex) {
    return res.status(401).json({ msg: "Invalid or expired session.", status: false });
  }
};

// Used by the socket.io connection handler (reads the token from the
// socket handshake instead of an HTTP header).
module.exports.verifySocketToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET); // returns { id, iat, exp }
};
