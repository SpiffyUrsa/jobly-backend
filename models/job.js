"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate, sqlForFilteringJobs } = require("../helpers/sql");

/** Related functions for companies. */

class Job {
    /** Find all jobs. Allows for jobs to be filtered by specific conditions.
     *
     * Returns [{ id, title, salary, equity }, ...] (empty list if none found)
     * */

    static async findAll(title, minSalary, hasEquity) {
        let jobsRes;
        if (title || minSalary || hasEquity) {
            // TODO: Change the sql function to work with title, minSalary, and hasEquity.
            const { dbQuery, filterValues } = sqlForFilteringJobs(title, minSalary, hasEquity);
            jobsRes = await db.query(dbQuery, filterValues);

        } else {
            jobsRes = await db.query(
                `SELECT id, title, salary, equity, company_handle
             FROM jobs
             ORDER BY title`);
        }
        return jobsRes.rows;
    }

    /** Given a job id, return data on a job.
     *
     * Returns { id, title, salary, equity, company_handle }
     *
     * Throws NotFoundError if not found.
     **/

    static async get(id) {
        const jobRes = await db.query(
            `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = $1`,
            [id]);

        const job = jobRes.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);

        return job;
    }

    /** Create a job (from data), update db, return new job data.
     *
     * data should be { id, title, salary, equity, company_handle }
     *
     * Returns { id, title, salary, equity, company_handle }
     *
     * Throws BadRequestError if job already in database.
     * Throws BadRequestError if company_handle does not exist in the database.
     * */

    static async create({ title, salary, equity, company_handle }) {
        // const duplicateCheck = await db.query(
        //   `SELECT id
        //        FROM jobs
        //        WHERE id = $1`,
        //   [id]);

        const companyHandleCheck = await db.query(
            `SELECT handle
            FROM companies
            WHERE handle = $1`,
            [company_handle]);

        // if (duplicateCheck.rows[0])
        //   throw new BadRequestError(`Duplicate job: ${id}`);

        if (!companyHandleCheck.rows[0]) {
            throw new BadRequestError(`Bad Request: Company handle ${company_handle} is unknown.`)
        }

        const result = await db.query(
            `INSERT INTO jobs
           (title, salary, equity, company_handle)
           VALUES ($1, $2, $3, $4)
           RETURNING id, title, salary, equity, company_handle`,
            [title, salary, equity, company_handle]
        );
        const job = result.rows[0];

        return job;
    }

    /** Update job data with `data`.
     *
     * This is a "partial update" --- it's fine if data doesn't contain all the
     * fields; this only changes provided ones.
     *
     * Data can include: { id, title, salary, equity } 
     *
     * Returns { id, title, salary, equity, company_handle }
     *
     * Throws NotFoundError if not found.
     */

    static async update(id, data) {
        if (Object.keys(data).length === 0)
            throw new BadRequestError("No data");
        if (Object.keys(data).includes("company_handle"))
            throw new BadRequestError("Cannot change company handle.");
        if (Object.keys(data).includes("id"))
            throw new BadRequestError("Cannot change job id.");

        const { setCols, values } = sqlForPartialUpdate(data);
        const handleVarIdx = "$" + (values.length + 1);

        const querySql = `UPDATE jobs 
                      SET ${setCols} 
                      WHERE id = ${handleVarIdx} 
                      RETURNING id, 
                                title, 
                                salary, 
                                equity, 
                                company_handle`;
        const result = await db.query(querySql, [...values, id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);

        return job;
    }

    /** Delete given job from database; returns undefined.
     *
     * Throws NotFoundError if job not found.
     **/

    static async remove(id) {
        const result = await db.query(
            `DELETE
           FROM jobs
           WHERE id = $1
           RETURNING id`,
            [id]);
        const job = result.rows[0];

        if (!job) throw new NotFoundError(`No job: ${id}`);
    }
}


module.exports = Job;
