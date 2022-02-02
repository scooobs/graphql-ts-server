import { mergeTypeDefs, mergeResolvers } from "@graphql-tools/merge";
import { makeExecutableSchema } from "@graphql-tools/schema";

import { join } from "path";
import * as fs from "fs";
import * as glob from "glob";

export const generateSchema = () => {
  const pathToModules = join(__dirname, "../modules");
  const graphQLTypes = glob
    .sync(`${pathToModules}/**/*.graphql`)
    .map((x) => fs.readFileSync(x, { encoding: "utf-8" }));

  const resolvers = glob
    .sync(`${pathToModules}/**/resolvers.?s`)
    .map((resolver) => {
      return require(resolver).resolvers;
    });

  return makeExecutableSchema({
    typeDefs: mergeTypeDefs(graphQLTypes),
    resolvers: mergeResolvers(resolvers),
  });
};
