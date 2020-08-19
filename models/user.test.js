"use strict";

const db = require("../db.js");
const User = require("./User.js");
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("authenticate", function () {
  test("ok", async function () {
    const user = await User.authenticate("test", "password");
    expect(user).toEqual({
      username: "test",
      first_name: "Test",
      last_name: "Tester",
      email: "test@test.com",
      is_admin: false,
    });
  });

  test("fails: missing user", async function () {
    expect.assertions(1);
    try {
      await User.authenticate("nope", "password");
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test("fails: wrong password", async function () {
    expect.assertions(1);
    try {
      await User.authenticate("test", "wrong");
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});


describe("register", function () {
  test("succeeds", async function () {
    let user = await User.register({
      username: "new",
      password: "password",
      first_name: "Test",
      last_name: "Tester",
      email: "test@test.com",
      is_admin: false,
    });
    expect(user).toEqual({
      username: "new",
      first_name: "Test",
      last_name: "Tester",
      email: "test@test.com",
      is_admin: false,
    });
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(false);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("succeeds: admin user", async function () {
    let user = await User.register({
      username: "new",
      password: "password",
      first_name: "Test",
      last_name: "Tester",
      email: "test@test.com",
      is_admin: true,
    });
    expect(user).toEqual({
      username: "new",
      first_name: "Test",
      last_name: "Tester",
      email: "test@test.com",
      is_admin: true,
    });
    const found = await db.query("SELECT * FROM users WHERE username = 'new'");
    expect(found.rows.length).toEqual(1);
    expect(found.rows[0].is_admin).toEqual(true);
    expect(found.rows[0].password.startsWith("$2b$")).toEqual(true);
  });

  test("fails with missing data", async function () {
    expect.assertions(1);
    try {
      await User.register({
        username: "new",
        password: "password",
        first_name: "Test",
        last_name: "Tester",
      });
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });

  test("fails with dup data", async function () {
    expect.assertions(1);
    try {
      await User.register({
        username: "test",
        password: "password2",
        first_name: "Test2",
        last_name: "Tester2",
        email: "test2@test.com",
        is_admin: false,
      });
    } catch (err) {
      expect(err).toBeTruthy();
    }
  });
});

