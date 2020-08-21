const bcrypt = require("bcrypt");

const db = require("../db.js");
const { BCRYPT_WORK_FACTOR, SECRET_KEY } = require("../config");
const {createToken} = require("../helpers/tokens")

let testAdminToken
let testUserToken

async function commonBeforeAll() {
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM companies");
  await db.query("DELETE FROM jobs");
  // noinspection SqlWithoutWhere
  await db.query("DELETE FROM users");

  await db.query(`
    INSERT INTO companies(handle, name, num_employees, description, logo_url)
    VALUES ('c1', 'C1', 1, 'Desc1', 'http://c1.img'),
           ('c2', 'C2', 2, 'Desc2', 'http://c2.img'),
           ('c3', 'C3', 3, 'Desc3', 'http://c3.img')`);
  
  await db.query(`
    INSERT INTO jobs (id, title, salary, equity, company_handle)
    VALUES (1, 'job1', 10000, 0.5, 'c1'),
           (2, 'job2', 11000, 0.3141592653, 'c2'),
           (3, 'job3', 12000, 0.99, 'c3')`);
  
  

  let testPasswords = [
    await bcrypt.hash("password", BCRYPT_WORK_FACTOR),
    await bcrypt.hash("password2", BCRYPT_WORK_FACTOR),
    await bcrypt.hash("password3", BCRYPT_WORK_FACTOR)
  ];

  await db.query(`
    INSERT INTO users(username,
                      password,
                      first_name,
                      last_name,
                      email,
                      is_admin)
    VALUES ('test', $1, 'Test', 'Tester', 'test@test.com', false),
           ('test2', $2, 'Test2', 'Tester2', 'test2@test.com', false),
           ('admin', $3, 'admin', 'admin', 'admin@test.com', true)
  `, [...testPasswords]);

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


module.exports = {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
  testAdminToken,
  testUserToken
};