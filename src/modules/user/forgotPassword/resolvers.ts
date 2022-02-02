import { forgotPasswordPrefix } from "../../../constants";
import { User } from "../../../entity/User";
import { ResolverMap } from "../../../types/graphql-utils";
import {
  MutationForgotPasswordChangeArgs,
  MutationSendForgotPasswordEmailArgs,
} from "../../../types/schema";
import { createForgotPasswordLink } from "../../../utils/createForgotPasswordLink";
import { forgotPasswordLockAccount } from "../../../utils/forgotPasswordLockAccount";
import { registerPasswordValidation } from "../../../yupSchemas";
import { expiredKeyError, userNotFound } from "./errorMessages";

import * as yup from "yup";
import * as bcrypt from "bcryptjs";
import { formatYupError } from "../../../utils/formatYupErorr";

const schema = yup.object().shape({
  newPassword: registerPasswordValidation,
});

export const resolvers: ResolverMap = {
  Query: {
    dummy2: () => "dummy2",
  },
  Mutation: {
    sendForgotPasswordEmail: async (
      _,
      { email }: MutationSendForgotPasswordEmailArgs,
      { redis }
    ) => {
      const user = await User.findOne({ where: { email } });
      if (!user) {
        return [{ path: "email", message: userNotFound }];
      }

      await forgotPasswordLockAccount(user.id, redis);
      // TODO: Add front-end URL
      await createForgotPasswordLink("", user.id, redis);
      // TODO: send email with the URL
      return true;
    },
    forgotPasswordChange: async (
      _,
      { key, newPassword }: MutationForgotPasswordChangeArgs,
      { redis }
    ) => {
      const redisKey = `${forgotPasswordPrefix}${key}`;
      const userId = await redis.get(redisKey);
      if (!userId) {
        return [
          {
            path: "key",
            message: expiredKeyError,
          },
        ];
      }

      try {
        await schema.validate({ newPassword }, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);

      const updateUserPromise = User.update(
        { id: userId },
        {
          forgotPasswordLocked: false,
          password: hashedPassword,
        }
      );

      const deleteKeyPromise = redis.del(redisKey);

      await Promise.all([updateUserPromise, deleteKeyPromise]);

      return null;
    },
  },
};
