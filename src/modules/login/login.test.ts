import { Connection } from "typeorm";

import { User } from "../../entity/User";
import { createTypeormConn } from "../../utils/createTypeormConn";
import { TestClient } from "../../utils/testClient";
import { confirmEmailError, invalidLogin } from "./errorMessages";

const email = "test@example.com";
const password = "goodpassword";

const loginExpectError = async (e: string, p: string, errMsg: string) => {
  const client = new TestClient(process.env.TEST_HOST as string);
  const response = await client.login(e, p);
  expect(response.data.data).toEqual({
    login: [
      {
        path: "email",
        message: errMsg,
      },
    ],
  });
};

let conn: Connection;

beforeAll(async () => {
  conn = await createTypeormConn();
});

afterAll(async () => {
  await conn.close();
});

describe("login", () => {
  it("email not found errors", async () => {
    await loginExpectError("bob@bob.com", "notapassword", invalidLogin);
  });

  it("email not confirmed", async () => {
    const client = new TestClient(process.env.TEST_HOST as string);
    await client.register(email, password);

    await loginExpectError(email, password, confirmEmailError);

    await User.update({ email }, { confirmed: true });

    await loginExpectError(email, "notmatching", invalidLogin);

    const response = await client.login(email, password);
    expect(response.data.data).toEqual({ login: null });
  });
});
