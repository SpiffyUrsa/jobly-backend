"use strict";
const { sqlForPartialUpdate, sqlForFilteringCompanies, sqlForFilteringJobs } = require("./sql")

describe("sqlForPartialUpdate", function () {
  test("check if it returns valid output with valid input", function () {
    const result = sqlForPartialUpdate({ "name": "ABCD", "description": "changing it" });
    expect(result).toEqual({
      "setCols": `name=$1, description=$2`,
      "values": ["ABCD", "changing it"]
    });
  });

  test("If the object is empty", function () {
    const result = sqlForPartialUpdate({});
    expect(result).toEqual({
      "setCols": ``,
      "values": []
    });
  });
});


describe("sqlForFilteringCompanies", function () {
  test("test the query with inputs-name and min_employees", function () {
    const result = sqlForFilteringCompanies("test", 1);

    expect(result).toEqual({
      dbQuery: `SELECT handle, name
                  FROM companies 
                  WHERE name ILIKE $1 AND num_employees >= $2 ORDER BY name`,
      filterValues: ["%test%", 1]
    })
  });

  test("test the query with only input-min_employees", function () {
    const result = sqlForFilteringCompanies(undefined, 1);

    expect(result).toEqual({
      dbQuery: `SELECT handle, name
                  FROM companies 
                  WHERE num_employees >= $1 ORDER BY name`,
      filterValues: [1]
    })
  });

  test("test the query with inputs-min_employees and max_employees", function () {
    const result = sqlForFilteringCompanies(undefined, 1, 1000);

    expect(result).toEqual({
      dbQuery: `SELECT handle, name
                  FROM companies 
                  WHERE num_employees >= $1 AND num_employees <= $2 ORDER BY name`,
      filterValues: [1, 1000]
    })
  });

  test("test the query with inputs-name, min_employees and max_employees", function () {
    const result = sqlForFilteringCompanies("e", 1, 1000);

    expect(result).toEqual({
      dbQuery: `SELECT handle, name
                  FROM companies 
                  WHERE name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3 ORDER BY name`,
      filterValues: ["%e%", 1, 1000]
    })
  });

  test("throw error if min_employees is greater than max_employees", function () {

    expect(() => { sqlForFilteringCompanies(undefined, 1, 0) })
      .toThrow("Bad Request: minEmployees is greater than maxEmployees.");

  });
})


describe("sqlForFilteringJobs", function () {
  test("test the query with inputs-title and minSalary", function () {
    const result = sqlForFilteringJobs("test", 100000);

    expect(result).toEqual({
      dbQuery: `SELECT id, title, salary, equity, company_handle 
                  FROM jobs 
                  WHERE title ILIKE $1 AND salary >= $2 ORDER BY title`,
      filterValues: ["%test%", 100000]
    })
  });

  test("test the query with only input-minSalary and hasEquity as false.", function () {
    const result = sqlForFilteringJobs(undefined, 100000, false);

    expect(result).toEqual({
      dbQuery: `SELECT id, title, salary, equity, company_handle 
                  FROM jobs 
                  WHERE salary >= $1 ORDER BY title`,
      filterValues: [100000]
    })
  });

  test("test the query with inputs-minSalary and hasEquity as true.", function () {
    const result = sqlForFilteringJobs(undefined, 100000, true);

    expect(result).toEqual({
      dbQuery: `SELECT id, title, salary, equity, company_handle 
                  FROM jobs 
                  WHERE salary >= $1 AND equity > 0 ORDER BY title`,
      filterValues: [100000]
    })
  });

  test("test the query with inputs-title, minSalary, and hasEquity as true.", function () {
    const result = sqlForFilteringJobs("test", 100000, true);

    expect(result).toEqual({
      dbQuery: `SELECT id, title, salary, equity, company_handle 
                  FROM jobs 
                  WHERE title ILIKE $1 AND salary >= $2 AND equity > 0 ORDER BY title`,
      filterValues: ["%test%", 100000]
    })
  });
})
