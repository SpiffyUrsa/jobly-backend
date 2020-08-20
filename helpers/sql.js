const { BadRequestError } = require("../expressError");

/** This function accepts an object that contains the data that we want to update with
 * takes each key and turn it to sql string equal to its value
 * And return an object with key of 
 *                  setCols (eg "name = $1, description = $2 ... ") 
 *                  and values(contains an array of values of data to be updated)     
*/

function sqlForPartialUpdate(dataToUpdate) {
  const cols = Object.keys(dataToUpdate).map(
    (col, idx) => `${col}=$${idx + 1}`);

  return {
    setCols: cols.join(", "),
    values: Object.values(dataToUpdate),
  };
}

/** 
 * This function accepts query string values that can be optional and returns an object
 *  With a query string containing the filtering parameters and the values of the filters.
 */

function sqlForFilteringByCols(nameLike, minEmployees, maxEmployees) {

  if (minEmployees > maxEmployees) {
    throw new BadRequestError("Bad Request: minEmployees is greater than maxEmployees.");
  }

  let filtersNameAndVals = [
    ["nameLike", nameLike],
    ["minEmployees", minEmployees],
    ["maxEmployees", maxEmployees]
  ];

  filtersNameAndVals = filtersNameAndVals.filter(filter => filter[1] !== undefined);

  let filtersQueries = filtersNameAndVals.map((filter, ind) => {
    let filterName = filter[0];

    if (filterName === "nameLike") {
      return `name ILIKE $${ind + 1}`;
    } else if (filterName === "minEmployees") {
      return `num_employees >= $${ind + 1}`;
    } else if (filterName === "maxEmployees") {
      return `num_employees <= $${ind + 1}`;
    }
  });

  let filterValues = filtersNameAndVals.map(filter => {
    let name = filter[0]
    let value = filter[1]

    if (name === "nameLike") {
      value = "%" + value + "%";
    }
    return value;
  });

  let combinedFiltersQuery = filtersQueries.join(" AND ");

  let dbQuery = `SELECT handle, name
                  FROM companies 
                  WHERE ` + combinedFiltersQuery + " ORDER BY name";
  return { dbQuery, filterValues };
}




module.exports = { sqlForPartialUpdate, sqlForFilteringByCols };


