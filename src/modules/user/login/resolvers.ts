import * as bcrypt from "bcryptjs";
import { userIdSessionPrefix } from "../../../constants";
import { User } from "../../../entity/User";
import { ResolverMap } from "../../../types/graphql-utils";
import { MutationLoginArgs } from "../../../types/schema";

import {
  confirmEmailError,
  forgotPasswordLockedError,
  invalidLogin,
  noPasswordError,
} from "./errorMessages";

const errorResponse = [
  {
    path: "email",
    message: invalidLogin,
  },
];

export const resolvers: ResolverMap = {
  Query: {
    bye2: () => "bye",
  },
  Mutation: {
    login: async (
      _,
      { email, password }: MutationLoginArgs,
      { session, redis, req }
    ) => {
      const user = await User.findOne({ where: { email } });

      if (!user) {
        return errorResponse;
      }

      if (!user.confirmed) {
        return [
          {
            path: "email",
            message: confirmEmailError,
          },
        ];
      }

      if (user.forgotPasswordLocked) {
        return [
          {
            path: "email",
            message: forgotPasswordLockedError,
          },
        ];
      }

      if (!user.password) {
        return [
          {
            path: "password",
            message: noPasswordError,
          },
        ];
      }

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return errorResponse;
      }

      // login successful
      session.userId = user.id;
      if (req.sessionID) {
        await redis.lpush(`${userIdSessionPrefix}${user.id}`, req.sessionID);
      }

      return null;
    },
  },
};
