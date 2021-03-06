"use strict";

const db = require("../db.js");
const User = require("../models/User");
const Company = require("../models/Company");
const Job = require("../models/Job");
const { createToken } = require("../helpers/tokens");

let jobs = [];

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");

  await Company.create(
    { handle: "c1", name: "C1", num_employees: 1, description: "Desc1" });
  await Company.create(
    { handle: "c2", name: "C2", num_employees: 2, description: "Desc2" });
  await Company.create(
    { handle: "c3", name: "C3", num_employees: 3, description: "Desc3" });


  jobs[0] = await Job.create(
    { title: "job1", salary: 10000, equity: 0.5, company_handle: "c1" });
  jobs[1] = await Job.create(
    { title: "job2", salary: 11000, equity: 0.4, company_handle: "c2" });
  jobs[2] = await Job.create(
    { title: "job3", salary: 12000, equity: 0.3, company_handle: "c3" });

  await User.register({
    username: "u1",
    first_name: "UF1",
    last_name: "UL1",
    email: "user1@user.com",
    password: "password1",
    is_admin: false,
  });
  await User.register({
    username: "u2",
    first_name: "UF2",
    last_name: "UL2",
    email: "user2@user.com",
    password: "password2",
    is_admin: false,
  });
  await User.register({
    username: "u3",
    first_name: "UF3",
    last_name: "UL3",
    email: "user3@user.com",
    password: "password3",
    is_admin: false,
  });
  await User.register({
    username: "admin",
    first_name: "ADMIN",
    last_name: "admin",
    email: "admin@user.com",
    password: "password4",
    is_admin: true,
  })
}

async function commonBeforeEach() {
  await db.query("BEGIN");
}

async function commonAfterEach() {
  await db.query("ROLLBACK");
}

async function commonAfterAll() {
  await db.end();
}


const u1Token = createToken({ username: "u1", is_admin: false });
const adminToken = createToken({ username: "admin", is_admin: true });

module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  u1Token,
  adminToken,
  jobs
};
