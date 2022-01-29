import { startServer } from "../startServer";
import { Server as HttpServer } from "http";
import { Server as HttpsServer } from "https";
import { AddressInfo } from "net";

let app: HttpServer | HttpsServer;

module.exports = async () => {
  app = await startServer();
  const { port } = app.address() as AddressInfo;
  process.env.TEST_HOST = `http://127.0.0.1:${port}`;
};
