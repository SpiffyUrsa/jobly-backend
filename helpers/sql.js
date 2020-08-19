// THIS NEEDS SOME GREAT DOCUMENTATION.

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

module.exports = { sqlForPartialUpdate };
// col(name) $1