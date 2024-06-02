const request = require("supertest");
const { app, startServer, stopServer } = require("../app");

beforeAll((done) => {
  startServer();
  done();
});

afterAll((done) => {
  stopServer();
  done();
});

describe("GET /", () => {
  it('should respond with a status of 200 and message "App up"', async () => {
    const response = await request(app).get("/");
    expect(response.status).toBe(200);
    expect(response.text).toBe("app up");
  });
});
