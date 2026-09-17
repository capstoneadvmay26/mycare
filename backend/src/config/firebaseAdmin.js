const {
    initializeApp,
    applicationDefault,
    getApps,
} = require("firebase-admin/app");

const {
    getMessaging,
} = require("firebase-admin/messaging");

function initializeFirebaseAdmin() {
    if (getApps().length > 0) {
        return getApps()[0];
    }

    return initializeApp({
        credential: applicationDefault(),
    });
}

const firebaseApp = initializeFirebaseAdmin();
const messaging = getMessaging(firebaseApp);

module.exports = {
    firebaseApp,
    messaging,
};