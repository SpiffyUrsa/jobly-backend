"use strict";

const request = require("supertest");

const app = require("../app");
const db = require("../db");

const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("POST /companies", function () {
  test("ok for users", async function () {
    const resp = await request(app)
        .post("/companies")
        .send({
          handle: "cnew",
          name: "CNew",
          logo_url: "http://cnew.img",
          description: "DescNew",
          num_employees: 10,
          _token: u1Token,
        });
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      company: {
        handle: "cnew",
        name: "CNew",
        logo_url: "http://cnew.img",
        description: "DescNew",
        num_employees: 10,
      },
    });
  });

  test("unauth for anon", async function () {
    const resp = await request(app)
        .post("/companies")
        .send({
          handle: "cnew",
          name: "CNew",
          logo_url: "http://cnew.img",
          description: "DescNew",
          num_employees: 10,
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("fails with missing data", async function () {
    const resp = await request(app)
        .post("/companies")
        .send({
          handle: "cnew",
          num_employees: 10,
          _token: u1Token,
        });
    expect(resp.statusCode).toEqual(400);
  });

  test("fails with invalid data", async function () {
    const resp = await request(app)
        .post("/companies")
        .send({
          handle: "cnew",
          name: "CNew",
          logo_url: "not-a-url",
          description: "DescNew",
          num_employees: 10,
          _token: u1Token,
        });
    expect(resp.statusCode).toEqual(400);
  });
});


describe("GET /companies", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/companies");
    expect(resp.body).toEqual({
      companies:
          [
            { handle: "c1", name: "C1" },
            { handle: "c2", name: "C2" },
            { handle: "c3", name: "C3" },
          ],
    });
  });

  test("test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE companies CASCADE");
    const resp = await request(app)
        .get("/companies")
        .send({ _token: u1Token });
    expect(resp.statusCode).toEqual(500);
  });
});


describe("GET /companies/:handle", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get(`/companies/c1`);
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "C1",
        description: "Desc1",
        num_employees: 1,
        logo_url: null,
      },
    });
  });

  test("fails for company missing", async function () {
    const resp = await request(app).get(`/companies/nope`);
    expect(resp.statusCode).toEqual(404);
  });
});


describe("PATCH /companies/:handle", function () {
  test("ok for user", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          name: "C1-new",
          _token: u1Token,
        });
    expect(resp.body).toEqual({
      company: {
        handle: "c1",
        name: "C1-new",
        description: "Desc1",
        num_employees: 1,
        logo_url: null,
      },
    });
  });

  test("fails for anon", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          name: "C1-new",
        });
    expect(resp.statusCode).toEqual(401);
  });

  test("fails on handle change attempt", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          handle: "c1-new",
          _token: u1Token,
        });
    expect(resp.statusCode).toEqual(400);
  });

  test("fails on invalid data", async function () {
    const resp = await request(app)
        .patch(`/companies/c1`)
        .send({
          logo_url: "not-a-url",
          _token: u1Token,
        });
    expect(resp.statusCode).toEqual(400);
  });
});


describe("DELETE /companies/:handle", function () {
  test("ok for user", async function () {
    const resp = await request(app)
        .delete(`/companies/c1`)
        .send({
          _token: u1Token,
        });
    expect(resp.body).toEqual({ deleted: "c1" });
  });

  test("fails for anon", async function () {
    const resp = await request(app)
        .delete(`/companies/c1`);
    expect(resp.statusCode).toEqual(401);
  });

  test("fails for missing company", async function () {
    const resp = await request(app)
        .delete(`/companies/nope`)
        .send({
          _token: u1Token,
        });
    expect(resp.statusCode).toEqual(404);
  });
});
