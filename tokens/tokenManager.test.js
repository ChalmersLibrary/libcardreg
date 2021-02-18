const TokenManager = require("./tokenManager");

jest.mock("fs");

const fs = require("fs");

test("1000 generated tokens are not the same", async () => {
  let tokenManager = new TokenManager("", 30);

  let generatedTokens = [];
  for (let i=0; i<1000; i++) {
    let token = await tokenManager.generateUniqueToken();
    if (generatedTokens.indexOf(token) > -1) {
      throw new Error("Token was not unique");
    }
    generatedTokens.push(token);
  }
});

test("token data is valid", async () => {
  let tokenManager = new TokenManager("", 30);
  let data = {
    created: Date.now() - 28 * 60 * 1000 // 28 minutes ago
  }
  expect(tokenManager.isTokenDataValid(data)).toBe(true);
});

test("token data is not valid", async () => {
  let tokenManager = new TokenManager("", 30);
  let data = {
    created: Date.now() - 32 * 60 * 1000 // 32 minutes ago
  }
  expect(tokenManager.isTokenDataValid(data)).toBe(false);
});

test("expired tokens are removed", async () => {
  let tokenManager = new TokenManager("", 30);
  let tokens = {
    "token1": {
      username: "user1",
      created: Date.now() - 32 * 60 * 1000 // 32 minutes ago
    },
    "token2": {
      username: "user2",
      created: Date.now() - 70 * 60 * 1000 // 70 minutes ago
    },
    "token3": {
      username: "user3",
      created: Date.now() - 28 * 60 * 1000 // 28 minutes ago
    }
  }

  fs.__setMockedData(tokens);

  await tokenManager.removeExpiredTokens();

  const data = fs.__getMockedData();

  expect(Object.keys(data).length).toBe(1);
  expect(data.token3.username).toBe("user3");
});