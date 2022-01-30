import * as yup from "yup";
// import { v4 } from "uuid";
import { User } from "../../entity/User";
import { ResolverMap } from "../../types/graphql-utils";
import { MutationRegisterArgs } from "../../types/schema";
// import { createConfirmEmailLink } from "../../utils/createConfirmEmailLink";
import { formatYupError } from "../../utils/formatYupErorr";
// import { sendEmail } from "../../utils/sendEmail";
import {
  duplicateEmail,
  emailNotLongEnough,
  emailNotValid,
  passwordNotLongEnough,
} from "./errorMessages";

const schema = yup.object().shape({
  email: yup
    .string()
    .min(3, emailNotLongEnough)
    .max(255)
    .email(emailNotValid)
    .required(),
  password: yup.string().min(5, passwordNotLongEnough).max(255).required(),
});

export const resolvers: ResolverMap = {
  Query: {
    bye: () => "bye",
  },
  Mutation: {
    register: async (_, args: MutationRegisterArgs, {}) => {
      try {
        await schema.validate(args, { abortEarly: false });
      } catch (err) {
        return formatYupError(err);
      }

      const { email, password } = args;
      const userAlreadyExists = await User.findOne({
        where: { email },
        select: ["id"],
      });

      if (userAlreadyExists) {
        return [
          {
            path: "email",
            message: duplicateEmail,
          },
        ];
      }

      const user = User.create({
        email,
        password,
      });

      await user.save();

      if (process.env.NODE_ENV !== "test") {
        // await sendEmail(
        //   email,
        //   await createConfirmEmailLink(url, user.id, redis)
        // );
      }

      return null;
    },
  },
};
