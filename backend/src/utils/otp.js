const crypto = require("crypto");

/**
 * Generates a random 6-digit OTP.
 */
const generateOtp = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Creates a SHA-256 hash of the OTP.
 */
const hashOtp = (otp) => {
    return crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");
};

/**
 * Checks whether an OTP matches its stored hash.
 */
const verifyOtp = (otp, storedHash) => {
    const otpHash = hashOtp(otp);

    return crypto.timingSafeEqual(
        Buffer.from(otpHash),
        Buffer.from(storedHash)
    );
};

module.exports = {
    generateOtp,
    hashOtp,
    verifyOtp,
};