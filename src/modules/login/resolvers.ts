import * as bcrypt from "bcryptjs";
import { User } from "../../entity/User";
import { ResolverMap } from "../../types/graphql-utils";
import { MutationLoginArgs } from "../../types/schema";
import { confirmEmailError, invalidLogin } from "./errorMessages";

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
    login: async (_, { email, password }: MutationLoginArgs, { session }) => {
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

      const match = await bcrypt.compare(password, user.password);

      if (!match) {
        return errorResponse;
      }

      // login successful

      session.userId = user.id;

      return null;
    },
  },
};
