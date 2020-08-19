"use strict";

const jwt = require("jsonwebtoken");
const {
  authenticateJWT,
  _ensureLoggedIn,
} = require("./auth");


const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", is_admin: false }, SECRET_KEY);
const badJwt = jwt.sign({ username: "test", is_admin: false }, "wrong");

describe("authenticateJWT", function () {
  test("success via body", async function () {
    const req = { body: { _token: testJwt } };
    const res = { locals: {} };
    const next = function () {
    };
    await authenticateJWT(req, res, next);
    expect(res.locals).toEqual({
      user: {
        iat: expect.any(Number),
        username: "test",
        is_admin: false,
      },
    });
  });

  test("no token", async function () {
    const req = { body: {} };
    const res = { locals: {} };
    const next = function () {
    };
    await authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });

  test("invalid token", async function () {
    const req = { body: { _token: badJwt } };
    const res = { locals: {} };
    const next = function () {
    };
    await authenticateJWT(req, res, next);
    expect(res.locals).toEqual({});
  });
});


describe("_ensureLoggedIn", function () {
  test("success", function () {
    const req = {};
    const res = { locals: { user: { username: "test", is_admin: false } } };
    _ensureLoggedIn(req, res);
  });

  test("failure", function () {
    expect.assertions = 1;
    const req = {};
    const res = { locals: {} };
    try {
      _ensureLoggedIn(req, res);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});
