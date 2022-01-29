import fetch from "node-fetch";

it("Sends invalid back if bad id sent", async () => {
  const response = await fetch(`${process.env.TEST_HOST}/confirm/12324`);
  const text = await response.text();
  expect(text).toEqual("invalid");
});
