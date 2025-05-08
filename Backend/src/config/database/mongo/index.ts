import mongoose, { MongooseError } from "mongoose";
import { APP_NAME } from "../../../constants.js";
import logger from "../../../logger/logger.winston.js";
import { MONGO_URI, NODE_ENV } from "../../env.js";


const connectMongoDb = async (_dbName: string) =>  {
  try {
    const conn = await mongoose.createConnection(MONGO_URI || "", {
       dbName: _dbName,
      autoIndex: NODE_ENV === "development",
      socketTimeoutMS: 30000,
      minPoolSize: 5,
      maxPoolSize: 10
    }).asPromise();


    if (mongoose.connection.readyState)
      logger.info(`Mongoose successfully connected to Mongodb server ${conn.name} `);

  conn.on("connected", () => {
      logger.info(`Mongoose successfully connected to Mongodb server `);
   
    });
    //error after initial connection to server
  conn.on("error", (e: MongooseError) => {
      logger.error(
        `Mongoose error after initial connection to MongoDB server${e.message}`
      );
    });
    //disconnectiing from mongodb server
  conn.on("disconnecting", () => {
      logger.warn(`Mongoose disconnecting from MongoDB server...`);
    });
    //disconnection from mongodb server
  conn.on("disconnected", () => {
      logger.error("Mongoose disconnected from Mongodb server");
    });
    //reconnected to mongo db server
  conn.on("reconnected", () => {
      logger.info("Mongoose reconnected to MongoDB server successfully");
    });

    
    return conn
  } catch (e) {
   if(e instanceof Error) {
    logger.error(`Mongoose failed to connect to mongodb server ${e.message}`);
    //exits the process to prevent the server running without a database connection

   }
   process.exit(1);

  }

};

// process.on("SIGINT", () => {
//   mongoose.connection.close(() => {
//     logger.info("Mongoose default connection disconnected through app termination");
//     process.exit(0);
//   })
// })

export {connectMongoDb};
