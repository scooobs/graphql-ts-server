export type Query = {
  where: [{ twitterId: string }] | [{ twitterId: string }, { email: string }];
};
