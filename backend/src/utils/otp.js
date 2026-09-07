const crypto = require("crypto");

/**
 * Generate a cryptographically secure six-digit OTP.
 *
 * @returns {string}
 */
const generateOtp = () => {
    return crypto.randomInt(100000, 1000000).toString();
};

/**
 * Hash an OTP before persistence.
 *
 * @param {string} otp
 * @returns {string}
 */
const hashOtp = (otp) => {
    return crypto
        .createHash("sha256")
        .update(otp)
        .digest("hex");
};

/**
 * Compare an OTP against its stored SHA-256 hash.
 *
 * @param {string} otp
 * @param {string} storedHash
 * @returns {boolean}
 */
const verifyOtp = (otp, storedHash) => {
    if (
        typeof otp !== "string" ||
        typeof storedHash !== "string"
    ) {
        return false;
    }

    const calculatedHash = hashOtp(otp);

    const calculatedBuffer = Buffer.from(
        calculatedHash,
        "utf8"
    );

    const storedBuffer = Buffer.from(
        storedHash,
        "utf8"
    );

    if (calculatedBuffer.length !== storedBuffer.length) {
        return false;
    }

    return crypto.timingSafeEqual(
        calculatedBuffer,
        storedBuffer
    );
};

module.exports = {
    generateOtp,
    hashOtp,
    verifyOtp,
};
