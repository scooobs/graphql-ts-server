import { Redis } from "ioredis";
import { redisSessionPrefix, userIdSessionPrefix } from "../constants";

export const removeAllUsersSessions = async (userId: string, redis: Redis) => {
  const sessionIds = await redis.lrange(
    `${userIdSessionPrefix}${userId}`,
    0,
    -1
  );

  const promises = [];
  // tslint:disable-next-line: prefer-for-of
  for (let i = 0; i < sessionIds.length; i += 1) {
    promises.push(redis.del(`${redisSessionPrefix}${sessionIds[i]}`));
  }
  await Promise.all(promises);
  return true;
};
