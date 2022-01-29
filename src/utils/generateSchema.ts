import { GraphQLFileLoader } from "@graphql-tools/graphql-file-loader";
import { loadSchemaSync } from "@graphql-tools/load";
import { makeExecutableSchema, mergeSchemas } from "@graphql-tools/schema";
import { GraphQLSchema } from "graphql/type";
import { join } from "path";
import * as fs from "fs";

export const generateSchema = () => {
  const schemas: GraphQLSchema[] = [];
  const folders = fs.readdirSync(join(__dirname, "../modules"));
  folders.forEach((folder) => {
    const { resolvers } = require(`../modules/${folder}/resolvers`);
    const typeDefs = loadSchemaSync(
      join(__dirname, `../modules/${folder}/schema.graphql`),
      {
        loaders: [new GraphQLFileLoader()],
      }
    );

    schemas.push(makeExecutableSchema({ typeDefs, resolvers }));
  });
  return mergeSchemas({ schemas });
};
