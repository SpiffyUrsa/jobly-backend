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
  test("check if it returns valid output with valid input", function () {
    const result = sqlForFilteringByCols("test", "1");

    expect(result).toEqual({
      dbQuery: `SELECT handle, name
                  FROM companies 
                  WHERE name ILIKE $1 AND num_employees >= $2 ORDER BY name`,
      filterValues: ["%test%", "1"]
    })
  });
})
