import axios from "axios";
import { wrapper } from "axios-cookiejar-support";
import { CookieJar } from "tough-cookie";

wrapper(axios);

const registerMutation = (e: string, p: string) => `
mutation {
  register(email: "${e}", password: "${p}") {
    path
    message
  }
}
`;

const loginMutation = (e: string, p: string) => `
mutation {
  login(email: "${e}", password: "${p}") {
    path
    message
  }
}
`;

const meQuery = `
{
    me {
        id
        email
    }
}
`;

const logoutMutation = `
mutation {
  logout
}`;

export class TestClient {
  url: string;
  jar: CookieJar;
  options: {
    withCredentials: boolean;
    jar: CookieJar;
  };
  constructor(url: string) {
    this.url = url;
    this.jar = new CookieJar();
    this.options = { withCredentials: true, jar: this.jar };
  }

  async register(email: string, password: string) {
    return axios.post(
      this.url,
      { query: registerMutation(email, password) },
      this.options
    );
  }

  async login(email: string, password: string) {
    return axios.post(
      this.url,
      { query: loginMutation(email, password) },
      this.options
    );
  }

  async me() {
    return axios.post(this.url, { query: meQuery }, this.options);
  }

  async logout() {
    return axios.post(this.url, { query: logoutMutation }, this.options);
  }
}
