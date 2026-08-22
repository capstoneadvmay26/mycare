// Protects routes that require a logged-in user.
// Verifies the JWT sent in the Authorizaion header and attaches the user's ID to req.user
// so controllers know WHO is making the request - this is what powers
// every ownership check in profiles and Medications.

const jwt = require("jsonwebtoken");

function requireAuth(req, res, next) {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startWith("Bearer ")) {
        return res.status(401).json({
            success: false,
            message: "No token provided. Please log in",
        });
    }

    const token = authHeader.split(" ")[1];

    try{
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = { id: decoded.userId };
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: "invalid or expired token. Please log in again",
        });
    }
}


module.exports = requireAuth;