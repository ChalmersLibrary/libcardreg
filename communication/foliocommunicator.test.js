const FolioCommunicator = require("./foliocommunicator");

jest.mock("request-promise");

const rp = require("request-promise");

test("basic auth and token works", async () => {
  let folio = new FolioCommunicator(
    "https://fejkurl.nu",
    "user",
    "pass",
    "fejktenant");

  let loginCalls = 0;

  rp.mockImplementation(req => {
    let res = { headers: {}, body: {} };
    if (req.uri.indexOf("/authn/login") > -1 &&
      req.body.username === "user" &&
      req.body.password === "pass") {
      loginCalls += 1;
      res.headers["x-okapi-token"] = "fejktoken123";
    }
    if (req.uri.indexOf("/users?limit=0&query=(username=\"fejkusername\")") > -1 &&
      req.headers["x-okapi-token"] === "fejktoken123" &&
      req.headers["x-okapi-tenant"] === "fejktenant") {
      res.body.totalRecords = 1;
    }
    return res;
  });

  let usernameExists = await folio.usernameExists("fejkusername");
  
  expect(loginCalls).toBe(1);
  expect(usernameExists).toBe(true);
})