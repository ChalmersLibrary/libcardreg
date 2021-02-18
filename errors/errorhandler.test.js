const ErrorHandler = require("./errorhandler")

test("stack trace not shown to user without debug", async () => {
  let translation = { languageCode: "sv-SE" };
  
  let mailCount = 0;
  let sg = { sendMultiple: (data) => mailCount += 1 };

  let consoleErrorCount = 0;
  global.console = {error: (msg) => consoleErrorCount += 1 };

  let statusCode = 500;
  let debugPageRenderCount = 0;
  let errorPageRenderCount = 0;
  let httpResponse = { 
    render: (page, data) => {
      if (page === "error") {
        if (data.error) {
          debugPageRenderCount += 1;
        } else {
          errorPageRenderCount += 1;
        }
      }
    },
    status: (code) => {
      statusCode = code;
    }
  }

  let errorHandler = new ErrorHandler(false, ["test@test.se"], sg, "")

  let error = new Error("Not found");
  error.status = 404;
  errorHandler.handle(translation, httpResponse, error);

  expect(mailCount).toBe(0);
  expect(consoleErrorCount).toBe(1);
  expect(debugPageRenderCount).toBe(0);
  expect(errorPageRenderCount).toBe(1);
  expect(statusCode).toBe(404);
});

test("stack trace shown to user with debug", async () => {
  let translation = { languageCode: "sv-SE" };
  
  let mailCount = 0;
  let sg = { sendMultiple: (data) => mailCount += 1 };

  let consoleErrorCount = 0;
  global.console = {error: (msg) => consoleErrorCount += 1 };

  let statusCode = 500;
  let debugPageRenderCount = 0;
  let errorPageRenderCount = 0;
  let httpResponse = { 
    render: (page, data) => {
      if (page === "error") {
        if (data.error) {
          debugPageRenderCount += 1;
        } else {
          errorPageRenderCount += 1;
        }
      }
    },
    status: (code) => {
      statusCode = code;
    }
  }

  let errorHandler = new ErrorHandler(true, ["test@test.se"], sg, "")

  let error = new Error("Not found");
  error.status = 404;
  errorHandler.handle(translation, httpResponse, error);

  expect(mailCount).toBe(0);
  expect(consoleErrorCount).toBe(1);
  expect(debugPageRenderCount).toBe(1);
  expect(errorPageRenderCount).toBe(0);
  expect(statusCode).toBe(404);
});

test("Page not found, no mail, custom user text", async () => {
  let translation = { languageCode: "en-GB" };
  
  let mailCount = 0;
  let sg = { sendMultiple: (data) => mailCount += 1 };

  let consoleErrorCount = 0;
  global.console = {error: (msg) => consoleErrorCount += 1 };

  let statusCode = 500;
  let debugPageRenderCount = 0;
  let errorPageRenderCount = 0;
  let renderedTitle = "";
  let renderedBody = "";
  let httpResponse = { 
    render: (page, data) => {
      if (page === "error") {
        renderedTitle = data.title;
        renderedBody = data.body;
        if (data.error) {
          debugPageRenderCount += 1;
        } else {
          errorPageRenderCount += 1;
        }
      }
    },
    status: (code) => {
      statusCode = code;
    }
  }

  let errorHandler = new ErrorHandler(false, ["test@test.se"], sg, "")

  let error = new Error("Not found");
  error.status = 404;
  errorHandler.handle(translation, httpResponse, error);

  expect(mailCount).toBe(0);
  expect(consoleErrorCount).toBe(1);
  expect(debugPageRenderCount).toBe(0);
  expect(errorPageRenderCount).toBe(1);
  expect(statusCode).toBe(404);
  expect(renderedTitle).toBe("Page not found");
});

test("Not authenticated, no mail, custom user text", async () => {
  let translation = { languageCode: "en-GB" };
  
  let mailCount = 0;
  let sg = { sendMultiple: (data) => mailCount += 1 };

  let consoleErrorCount = 0;
  global.console = {error: (msg) => consoleErrorCount += 1 };

  let statusCode = 500;
  let debugPageRenderCount = 0;
  let errorPageRenderCount = 0;
  let renderedTitle = "";
  let renderedBody = "";
  let httpResponse = { 
    render: (page, data) => {
      if (page === "error") {
        renderedTitle = data.title;
        renderedBody = data.body;
        if (data.error) {
          debugPageRenderCount += 1;
        } else {
          errorPageRenderCount += 1;
        }
      }
    },
    status: (code) => {
      statusCode = code;
    }
  }

  let errorHandler = new ErrorHandler(false, ["test@test.se"], sg, "")

  let error = new Error("Failed to build register form for authenticated user: Not authenticated.");
  error.status = 500;
  errorHandler.handle(translation, httpResponse, error);

  expect(mailCount).toBe(0);
  expect(consoleErrorCount).toBe(1);
  expect(debugPageRenderCount).toBe(0);
  expect(errorPageRenderCount).toBe(1);
  expect(statusCode).toBe(500);
  expect(renderedTitle).toBe("We can't see that you are logged in.");
});