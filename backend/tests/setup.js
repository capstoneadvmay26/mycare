require("dotenv").config({ path: ".env.test" });

const mongoose = require("mongoose");
const { MongoMemoryServer } = require("mongodb-memory-server");

jest.setTimeout(180000);

let mongoServer;

async function connectTestDB() {
    mongoServer = await MongoMemoryServer.create({
        instance: {
            launchTimeout: 60000,
        },
    });

    await mongoose.connect(mongoServer.getUri());
}

async function closeTestDB() {
    if (mongoose.connection.readyState !== 0) {
        try {
            await mongoose.connection.dropDatabase();
        } catch (error) {
            // Connection may never have opened.
        }

        await mongoose.connection.close();
    }

    if (mongoServer) {
        await mongoServer.stop();
    }
}

async function clearTestDB() {
    if (mongoose.connection.readyState !== 1) {
        return;
    }

    const collections = mongoose.connection.collections;

    for (const key in collections) {
        await collections[key].deleteMany({});
    }
}

module.exports = {
    connectTestDB,
    closeTestDB,
    clearTestDB,
};