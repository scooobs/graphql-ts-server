/**
 * @jest-environment jsdom
 */

import { Connection } from "typeorm";

import { User } from "../../entity/User";
import { createTypeormConn } from "../../utils/createTypeormConn";
import { TestClient } from "../../utils/testClient";

let conn: Connection;
let user: User;

const email = "test@test.com";
const password = "testpassword";

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

describe("logout", () => {
  it("test logging out a user", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await client.login(email, password);

    const response = await client.me();

    expect(response.data.data).toEqual({
      me: {
        id: user.id,
        email,
      },
    });

    await client.logout();

    const response2 = await client.me();

    expect(response2.data.data.me).toBeNull();
  });
});
