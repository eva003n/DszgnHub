"use strict";
// import Redis from "ioredis";
// import logger from "../../../logger/logger.winston.js";
// async function connectToRedis() {
//   try {
//     const redis = new Redis(process.env.REDIS_URL);
//     logger.info("Succesfully connected to redis");
//     return redis;
//   } catch (e) {
//     logger.error(`Error! redis database ${e.message}`);
//   }
// }
// const storeRefreshTokenToRedisDb = async (userId, refreshToken) => {
//   const redis = await connectToRedis();
//   await redis.set(userId, refreshToken, "EX", 24 * 60 * 60);
// }
// const deleteRefreshTokenFromRedis = async (decodeToken) => {
//   const redis = await connectToRedis(decodeToken);
//    await redis.del(`refresh token:${decodeToken}`);
// }
// export { 
//   storeRefreshTokenToRedisDb,
//   deleteRefreshTokenFromRedis,
// connectToRedis
// };
