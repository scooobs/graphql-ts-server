/**
 * @jest-environment jsdom
 */

import { Connection } from "typeorm";

import { User } from "../../../entity/User";
import { redis } from "../../../redis";
import { createForgotPasswordLink } from "../../../utils/createForgotPasswordLink";
import { createTypeormConn } from "../../../utils/createTypeormConn";
import { forgotPasswordLockAccount } from "../../../utils/forgotPasswordLockAccount";
import { TestClient } from "../../../utils/testClient";
import { forgotPasswordLockedError } from "../login/errorMessages";
import { passwordNotLongEnough } from "../register/errorMessages";
import { expiredKeyError } from "./errorMessages";

let conn: Connection;

let user: User;

const email = "test@test.com";
const password = "testpassword";
const newPassword = "newpassword";

beforeAll(async () => {
  conn = await createTypeormConn();
  user = await User.create({
    email,
    password,
    confirmed: true,
  }).save();
});

afterAll(async () => {
  await conn.close();
});

describe("forgotPassword", () => {
  it("make sure it works", async () => {
    // computer 1
    const client = new TestClient(process.env.TEST_HOST as string);

    // Lock account
    await forgotPasswordLockAccount(user.id, redis);

    const url = await createForgotPasswordLink("", user.id, redis);
    const parts = url.split("/");
    const key = parts[parts.length - 1];

    // Can't login to locked account
    const response = await client.login(email, password);
    expect(response.data.data).toEqual({
      login: [
        {
          path: "email",
          message: forgotPasswordLockedError,
        },
      ],
    });

    // Change to password too short

    const response2 = await client.forgotPasswordChange("f", key);

    expect(response2.data.data).toEqual({
      forgotPasswordChange: [
        {
          path: "newPassword",
          message: passwordNotLongEnough,
        },
      ],
    });

    const response3 = await client.forgotPasswordChange(newPassword, key);

    expect(response3.data.data).toEqual({
      forgotPasswordChange: null,
    });

    // make sure you can't change password again
    const response4 = await client.forgotPasswordChange(password, key);
    expect(response4.data.data).toEqual({
      forgotPasswordChange: [
        {
          path: "key",
          message: expiredKeyError,
        },
      ],
    });

    const response5 = await client.login(email, newPassword);
    expect(response5.data.data).toEqual({
      login: null,
    });
  });
});
