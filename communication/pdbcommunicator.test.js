const PdbCommunicator = require("./pdbcommunicator");

jest.mock("request-promise");

const rp = require("request-promise");

test("basic auth and token works", async () => {
  let pdb = new PdbCommunicator(
    "https://fejkurl.nu",
    "user",
    "pass");

  let sessionStartCalls = 0;
  let loginCalls = 0;
  let sessionStopCalls = 0;

  rp.mockImplementation(req => {
    let res = { headers: {}, body: {} };
    if (req.json.function === "session_start") {
      res.session = "fejksession";
      sessionStartCalls += 1;
    }
    if (req.json.function === "session_auth_login" && 
      req.json.session === "fejksession" &&
      req.json.params[0] === "user" &&
      req.json.params[1] === "pass") {
      res.result = true;
      loginCalls += 1;
    }
    if (req.json.function === "session_stop" && 
      req.json.session === "fejksession") {
      res.result = true;
      sessionStopCalls += 1;
    }
    if (req.json.function === "person_dig" && 
      req.json.session === "fejksession") {
      res.result = ["fejkperson"];
    }
    return res;
  });


  await pdb.connect();
  let data = await pdb.getByCid("fejkcid");
  await pdb.closeConnection();
  
  expect(sessionStartCalls).toBe(1);
  expect(loginCalls).toBe(1);
  expect(sessionStopCalls).toBe(1);
  expect(data).toBe("fejkperson");
})