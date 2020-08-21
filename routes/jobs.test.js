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
  adminToken,
  jobs
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("POST /jobs", function () {
  test("users cannot create a new job if they are not admin", async function () {

    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "job3",
        salary: 10000,
        equity: 0.1,
        company_handle: "c1",
        _token: u1Token,
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("Only admin can create job", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "job4",
        salary: 10000,
        equity: 0.1,
        company_handle: "c1",
        _token: adminToken,
      });
    expect(resp.statusCode).toEqual(201);
    expect(resp.body).toEqual({
      job: {
        id: expect.any(Number),
        title: "job4",
        salary: 10000,
        equity: "0.1",
        company_handle: "c1"
      },
    });
  })

  test("unauth for anon", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "job3",
        salary: 10000,
        equity: 0.1,
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("fails with missing data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        salary: 10000,
        equity: 0.1,
        _token: adminToken,
      });
    expect(resp.statusCode).toEqual(400);
  });

  // Test to see if we get certain error messages. 

  test("fails with invalid data", async function () {
    const resp = await request(app)
      .post("/jobs")
      .send({
        title: "job3",
        salary: "10000",
        equity: 0.1,
        _token: adminToken,
      });
    expect(resp.statusCode).toEqual(400);
  });

});


describe("GET /jobs", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get("/jobs");
    expect(resp.body).toEqual({
      jobs:
        [
          { id: expect.any(Number), title: "job1", salary: 10000, equity: "0.5", company_handle: "c1" },
          { id: expect.any(Number), title: "job2", salary: 11000, equity: "0.4", company_handle: "c2" },
          { id: expect.any(Number), title: "job3", salary: 12000, equity: "0.3", company_handle: "c3" }
        ],
    });
  });

  test("test next() handler", async function () {
    // there's no normal failure event which will cause this route to fail ---
    // thus making it hard to test that the error-handler works with it. This
    // should cause an error, all right :)
    await db.query("DROP TABLE jobs CASCADE");
    const resp = await request(app)
      .get("/jobs")
      .send({ _token: u1Token });
    expect(resp.statusCode).toEqual(500);
  });
});


describe("GET /jobs/:id", function () {
  test("ok for anon", async function () {
    const resp = await request(app).get(`/jobs/${jobs[0].id}`);
    
    expect(resp.body).toEqual({
      job: {
        id: jobs[0].id,
        title: "job1",
        salary: 10000,
        equity: "0.5",
        company_handle: "c1"
      },
    });
  });

  test("fails for job missing", async function () {
    const resp = await request(app).get(`/jobs/101`);
    expect(resp.statusCode).toEqual(404);
  });
});


describe("PATCH /jobs/:id", function () {
  test("user cannot update job if not admin", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobs[1].id}`)
      .send({
        title: "newJob",
        salary: 10000,
        equity: 0.1,
        _token: u1Token,
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("admin update job", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobs[0].id}`)
      .send({
        title: "newJob1",
        salary: 10100,
        equity: 0.7,
        _token: adminToken,
      });
    expect(resp.body).toEqual({
      job: {
        id: jobs[0].id,
        title: "newJob1",
        salary: 10100,
        equity: "0.7",
        company_handle: "c1"
      },
    });
  });

  test("fails for anon", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobs[1].id}`)
      .send({
        title: "newJob2"
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("fails on handle change attempt", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobs[1].id}`)
      .send({
        company_handle: "newComp",
        _token: adminToken,
      });
    expect(resp.statusCode).toEqual(400);
  });

  test("fails on invalid data", async function () {
    const resp = await request(app)
      .patch(`/jobs/${jobs[0].id}`)
      .send({
        title: 5,
        _token: adminToken,
      });
    expect(resp.statusCode).toEqual(400);
  });
});


describe("DELETE /jobs/:id", function () {
  test("user can't delete job if not admin", async function () {
    const resp = await request(app)
      .delete(`/jobs/${jobs[0].id}`)
      .send({
        _token: u1Token,
      });
    expect(resp.statusCode).toEqual(401);
  });

  test("Admin can delete job", async function () {
    const resp = await request(app)
      .delete(`/jobs/${jobs[0].id}`)
      .send({
        _token: adminToken,
      });
    expect(resp.body).toEqual({ deleted: `${jobs[0].id}` });
  });

  test("fails for anon", async function () {
    const resp = await request(app)
      .delete(`/jobs/${jobs[0].id}`);
    expect(resp.statusCode).toEqual(401);
  });

  test("fails for missing job", async function () {
    const resp = await request(app)
      .delete(`/companies/911`)
      .send({
        _token: adminToken,
      });
    expect(resp.statusCode).toEqual(404);
  });
});
