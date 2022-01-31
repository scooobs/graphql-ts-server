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
  it("multiple sessions", async () => {
    // computer 1
    const session1 = new TestClient(process.env.TEST_HOST as string);

    // computer 2
    const session2 = new TestClient(process.env.TEST_HOST as string);

    await session1.login(email, password);
    await session2.login(email, password);

    expect(await (await session1.login(email, password)).data.data).toEqual(
      await (
        await session2.login(email, password)
      ).data.data
    );

    await session1.logout();
    expect(await (await session1.login(email, password)).data.data).toEqual(
      await (
        await session2.login(email, password)
      ).data.data
    );
  });

  it("single sessions", async () => {
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
