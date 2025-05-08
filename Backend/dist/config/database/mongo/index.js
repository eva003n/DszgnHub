import mongoose from "mongoose";
import { DB_NAME } from "../../../constants";
import logger from "../../../logger/logger.winston";
import { config } from "dotenv";
config();
const MONGO_URI = process.env.MONGO_URI || "";
const connectMongoDb = async () => {
    try {
        await mongoose.connect(MONGO_URI, {
            dbName: DB_NAME,
        });
        if (mongoose.connection.readyState)
            logger.info("Mongoose successfully connected to Mongodb server");
        //error after initial connection to server
        mongoose.connection.on("error", (e) => {
            logger.error(`Mongoose error after initial connection to MongoDB server${e.message}`);
        });
        //disconnectiing from mongodb server
        mongoose.connection.on("disconnecting", () => {
            logger.warn(`Mongoose disconnecting from MongoDB server...`);
        });
        //disconnection from mongodb server
        mongoose.connection.on("disconnected", () => {
            logger.error("Mongoose disconnected from Mongodb server");
        });
        //reconnected to mongo db server
        mongoose.connection.on("reconnected", () => {
            logger.info("Mongoose reconnected to MongoDB server successfully");
        });
    }
    catch (e) {
        logger.error(`Mongoose failed to connect to mongodb server ${e.message}`);
        //exits the process to prevent the server running without a database connection
        process.exit(1);
    }
};
export default connectMongoDb;
