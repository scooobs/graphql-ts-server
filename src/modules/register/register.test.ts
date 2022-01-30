import { Connection } from "typeorm";

import { User } from "../../entity/User";
import { createTypeormConn } from "../../utils/createTypeormConn";
import { TestClient } from "../../utils/testClient";

import {
  duplicateEmail,
  emailNotLongEnough,
  emailNotValid,
  passwordNotLongEnough,
} from "./errorMessages";

const email = "test@example.com";
const password = "goodpassword";

let conn: Connection;

beforeAll(async () => {
  conn = await createTypeormConn();
});

afterAll(async () => {
  await conn.close();
});

describe("Register user", () => {
  it("Check for duplicate emails", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    // Make sure we can register a user
    const response = await client.register(email, password);
    expect(response.data.data).toEqual({ register: null });

    const users = await User.find({ where: { email } });
    expect(users).toHaveLength(1);

    const user = users[0];
    expect(user.email).toEqual(email);
    expect(user.password).not.toEqual(password);

    const response2 = await client.register(email, password);
    expect(response2.data.data.register).toHaveLength(1);
    expect(response2.data.data.register[0]).toEqual({
      path: "email",
      message: duplicateEmail,
    });
  });

  it("check bad email", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response3 = await client.register("b", password);
    expect(response3.data.data).toEqual({
      register: [
        {
          path: "email",
          message: emailNotLongEnough,
        },
        {
          path: "email",
          message: emailNotValid,
        },
      ],
    });
  });

  it("check bad password", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response4 = await client.register(email, "ad");
    expect(response4.data.data).toEqual({
      register: [
        {
          path: "password",
          message: passwordNotLongEnough,
        },
      ],
    });
  });

  it("check bad password and email", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    const response5 = await client.register("b", "ad");
    expect(response5.data.data).toEqual({
      register: [
        {
          path: "email",
          message: emailNotLongEnough,
        },
        {
          path: "email",
          message: emailNotValid,
        },
        {
          path: "password",
          message: passwordNotLongEnough,
        },
      ],
    });
  });
});
