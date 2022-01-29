import { User } from "../entity/User";
import { createConfirmEmailLink } from "./createConfirmEmailLink";
import { createTypeormConn } from "./createTypeormConn";

import fetch from "node-fetch";

import { redis } from "../redis";

let userId: string;

beforeAll(async () => {
  await createTypeormConn();
  const user = await User.create({
    email: "test@test.com",
    password: "testpassword",
  }).save();
  userId = user.id;
});

it("Make sure it confirms user and clears key in redis", async () => {
  const link = await createConfirmEmailLink(
    process.env.TEST_HOST as string,
    userId,
    redis
  );

  const response = await fetch(link);
  const text = await response.text();
  expect(text).toEqual("ok");
  const user = await User.findOne({ where: { id: userId } });
  expect((user as User).confirmed).toBeTruthy();
  const chunks = link.split("/");
  const key = chunks[chunks.length - 1];
  const value = await redis.get(key);
  expect(value).toBeNull();
});
