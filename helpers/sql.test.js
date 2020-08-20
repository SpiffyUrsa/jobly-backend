"use strict";
const {sqlForPartialUpdate, sqlForFilteringByCols } = require("./sql")

describe("sqlForPartialUpdate", function () {
  test("check if it returns valid output with valid input", function () {
    const result = sqlForPartialUpdate({"name" : "ABCD", "description" : "changing it"});
    expect(result).toEqual({
      "setCols" : `name=$1, description=$2`, 
      "values" : ["ABCD", "changing it"] 
    });
  });

  test("If the object is empty", function () {
    const result = sqlForPartialUpdate({});
    expect(result).toEqual({
      "setCols" : ``, 
      "values" : [] 
    });
  });
});

describe ("sqlForFilteringByCols", function () {
  test("test the query with inputs-name and min_employees", function () {
    const result = sqlForFilteringByCols("test", 1);

    expect(result).toEqual({
      dbQuery: `SELECT handle, name
                  FROM companies 
                  WHERE name ILIKE $1 AND num_employees >= $2 ORDER BY name`,
      filterValues: ["%test%", 1]
    })
  });

  test("test the query with only input-min_employees", function () {
    const result = sqlForFilteringByCols(undefined, 1);

    expect(result).toEqual({
      dbQuery: `SELECT handle, name
                  FROM companies 
                  WHERE num_employees >= $1 ORDER BY name`,
      filterValues: [1]
    })
  });

  test("test the query with inputs-min_employees and max_employees", function () {
    const result = sqlForFilteringByCols(undefined, 1, 1000);

    expect(result).toEqual({
      dbQuery: `SELECT handle, name
                  FROM companies 
                  WHERE num_employees >= $1 AND num_employees <= $2 ORDER BY name`,
      filterValues: [1, 1000]
    })
  });

  test("test the query with inputs-name, min_employees and max_employees", function () {
    const result = sqlForFilteringByCols("e", 1, 1000);

    expect(result).toEqual({
      dbQuery: `SELECT handle, name
                  FROM companies 
                  WHERE name ILIKE $1 AND num_employees >= $2 AND num_employees <= $3 ORDER BY name`,
      filterValues: ["%e%",1, 1000]
    })
  });

  test("throw error if min_employees is greater than max_employees", function () {

    expect(() => { sqlForFilteringByCols(undefined, 1, 0) })
    .toThrow("Bad Request: minEmployees is greater than maxEmployees.");
    
  });
})
