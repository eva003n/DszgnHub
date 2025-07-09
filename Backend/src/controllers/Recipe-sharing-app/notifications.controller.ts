import type { Request, Response, NextFunction } from "express";

/**
 * pubsub system
 *
 * https://www.digitalocean.com/community/tutorials/publish-subscribe-pattern-in-node-js
 * https://github.com/jialihan/pubsub-example
 * https://medium.com/@ignatovich.dm/implementing-the-pub-sub-pattern-in-javascript-a-guide-for-beginners-44714a76d8c7
 * https://betterjavacode.com/programming/how-to-use-pub-sub-with-nodejs
 */

import asyncHandler from "../../utils/asyncHandler.js";
import User from "../../models/Recipe-sharing-app/user.model.js";
import ApiError from "../../utils/ApiError.js";
import Notification from "../../models/Recipe-sharing-app/notification.model.js";
import ApiResponse from "../../utils/ApiResponse.js";
import { NODE_ENV } from "../../config/env.js";
import type { ProtectedRequest } from "../../interfaces/Recipe-sharing-app/request.interface.js";
import logger from "../../logger/logger.winston.js";




const getNofications = asyncHandler(
  async (req: ProtectedRequest, res: Response, next: NextFunction) => {
    const { user_id } = req.query;


    //track open SSE connections
    manageClientConnetion(req.user._id.toString(), res)

    const isExistingUser = await User.findById(user_id || req.user._id);
    if (!isExistingUser)
      return next(
        ApiError.notFound(404, req.originalUrl, "User doesn't exist")
      );

    //change stream to listed for ne notifications
    

    const notifications = await Notification.find({ receiver: req.user._id });

    //keep the connection alive
    const interval = setInterval(() => {
      res.write(`:ping\n\n`);
    }, 15000);
    req.on("close", () => {
      clearInterval(interval);
      res.end();
      //remove the client 
      logger.info(`Server sent events connection closed by ${req.user._id.toString()}`);
    });


     res
      .status(200)
      .set({
        "Content-Type": "text/event-stream",
        "Cache-control": "no-cache",
        "Connection": "keep-alive",
      })
      res.flushHeaders()

      return res.write(
        `event: notify\n` +
        `data: ${JSON.stringify(notifications)}\n` +
        `id: ${req.user._id}\n` +
        `retry: 5000\n\n`
      );
  }
);

//key-value store for all live connetions per user
const connectedClients = new Map();

const manageClientConnetion = (userId: string, res: Response) => {
  //make sure that unique users are added to the map and prevent overwriting
  if(!connectedClients.has(userId)) {
    //new client create a store
    connectedClients.set(userId, new Set());
  }
  //if existing connected client and the user has opened another tab or using another device
    connectedClients.get(userId).add(res)

    //client disconnect remove the response stream
  res.on("close", () => {
    connectedClients.get(userId).delete(res)
    if(connectedClients.get(userId).size === 0) {
      //free up memory, by deletion a user who has no open connections
      connectedClients.delete(userId)
    }
  })
  
}
const sendNotification = async (
  receiver: string,
  message: string,
  type: string,
  recipe?: string,
) => {
  if (NODE_ENV === "production") {
    //ensures indexes are built
    Notification.createIndexes();
  }
  const notification = await Notification.create({
    message,
    receiver,
    notifyType: type,
    recipe,
  });

  const receivers = connectedClients.get(receiver);

  if(receivers) {
    receivers.forEach((res: Response) => {
      res.write(
        `event: notify\n` +
        `id: ${receiver}\n` +
        `data: ${JSON.stringify(notification)}\n` +
        `retry: 5000\n\n`)

    })
  }
};

export { getNofications, sendNotification };
