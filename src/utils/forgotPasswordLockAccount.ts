import { Redis } from "ioredis";
import { User } from "../entity/User";
import { removeAllUsersSessions } from "./removeAllUsersSessions";

export const forgotPasswordLockAccount = async (
  userId: string,
  redis: Redis
) => {
  await User.update({ id: userId }, { forgotPasswordLocked: true });
  await removeAllUsersSessions(userId, redis);
};
