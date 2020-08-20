"use strict";

const jwt = require("jsonwebtoken");
const {
  authenticateJWT,
  _ensureLoggedIn,
  ensureAdmin,
} = require("./auth");


const { SECRET_KEY } = require("../config");
const testJwt = jwt.sign({ username: "test", is_admin: false }, SECRET_KEY);
const adminJwt = jwt.sign({ username: "admin", is_admin: true }, SECRET_KEY);
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

describe("ensureAdmin", function () {
  test("success", function () {
    const req = { body: { _token: adminJwt } };
    
    const res = { locals: { user: { username: "admin", is_admin: true } } };
    const next = function () {
       };
    ensureAdmin(req, res, next);
  });

  test("failure with user", function () {
    expect.assertions = 1;
    const req = {body: { _token: testJwt }};
    const res = { locals: {user : { username: "test", is_admin: false }} };
    try {
      ensureAdmin(req, res);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test("failure with empty locals", function () {
    expect.assertions = 1;
    const req = {};
    const res = { locals: {} };
    try {
      ensureAdmin(req, res);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test("failure with invalid value for is_admin", function () {
    expect.assertions = 1;
    const req = {};
    const res = { locals: {user : { username: "test", is_admin: "no" }} };
    try {
      ensureAdmin(req, res);
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

});
