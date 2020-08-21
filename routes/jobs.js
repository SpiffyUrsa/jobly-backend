"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn, ensureAdmin } = require("../middleware/auth");
const Job = require("../models/Job");

const companyNewSchema = require("../schemas/companyNew.json");
const companyUpdateSchema = require("../schemas/companyUpdate.json");
const getCompaniesSchema = require("../schemas/getCompanies.json")

const router = new express.Router();

/** GET /  =>  { companies: [{ handle, name }, ...] }
 *
 * Can filter on provided search filters:
 * - minEmployees
 * - maxEmployees
 * - nameLike (will find case-insensitive, partial matches)
 *
 * Authorization required: none
 **/

router.get("/", async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, getCompaniesSchema);

    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }
    
    const { nameLike, minEmployees, maxEmployees } = req.query;

    const companies = await Company.findAll(nameLike, minEmployees, maxEmployees);
    
    return res.json({ companies });
  } catch (err) {
    return next(err);
  }
});

/** GET /[handle]  =>  { company }
 *
 *  Company is { handle, name, num_employees, description, logo_url, jobs }
 *   where jobs is [{ id, title, salary, equity }, ...]
 *
 * Authorization required: none
 **/
//TODO: What about jobs?
router.get("/:handle", async function (req, res, next) {
  try {
    const company = await Company.get(req.params.handle);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** POST / { company } =>  { company }
 *
 * company should be { handle, name, num_employees, description, logo_url }
 *
 * Returns { handle, name, num_employees, description, logo_url }
 *
 * Authorization required: admin
 **/

//TODO: only admin can make create company
router.post("/", ensureAdmin, async function (req, res, next) {
  try {
    console.log("inside create route")
    const validator = jsonschema.validate(req.body, companyNewSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.create(req.body);
    return res.status(201).json({ company });
  } catch (err) {
    return next(err);
  }
});

/** PATCH /[handle] { fld1, fld2, ... } => { company }
 *
 * Patches company data.
 *
 * fields can be: {name, num_employees, description, logo_url}
 *
 * Returns {handle, name, num_employees, description, logo_url}
 *
 * Authorization required: admin
 **/
//TODO: only admin can edit  company

router.patch("/:handle", ensureAdmin, async function (req, res, next) {
  try {
    const validator = jsonschema.validate(req.body, companyUpdateSchema);
    if (!validator.valid) {
      const errs = validator.errors.map(e => e.stack);
      throw new BadRequestError(errs);
    }

    const company = await Company.update(req.params.handle, req.body);
    return res.json({ company });
  } catch (err) {
    return next(err);
  }
});

/** DELETE /[handle]  =>  { deleted: handle }
 *
 * Authorization: admin
 **/
//TODO: only admin can delete company
router.delete("/:handle", ensureAdmin, async function (req, res, next) {
  try {
    await Company.remove(req.params.handle);
    return res.json({ deleted: req.params.handle });
  } catch (err) {
    return next(err);
  }
});

//TODO: ensureLOGGEDIN
module.exports = router;
