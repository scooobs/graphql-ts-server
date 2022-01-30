import { ResolverMap } from "../../types/graphql-utils";

export const resolvers: ResolverMap = {
  Query: {
    dummy: () => "dummy",
  },
  Mutation: {
    logout: (_, __, { session }) =>
      new Promise((resolve) =>
        session.destroy((err) => {
          if (err) {
            console.log("logout error: ", err);
          }
          resolve(true);
        })
      ),
  },
};
