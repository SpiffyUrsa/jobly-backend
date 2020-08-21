"use strict";

const db = require("../db.js");
const Job = require("./Job.js");
const {
	commonBeforeAll,
	commonBeforeEach,
	commonAfterEach,
	commonAfterAll
} = require("./_testCommon");
const { findAll } = require("./Job.js");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);


describe("findAll", function () {

	test("all", async function () {
		let jobs = await Job.findAll();

		expect(jobs).toEqual([
			{ id: 1, title: "job1", salary: 10000, equity: "0.5", company_handle: "c1" },
			{ id: 2, title: "job2", salary: 11000, equity: "0.3141592653", company_handle: "c2" },
			{ id: 3, title: "job3", salary: 12000, equity: "0.99", company_handle: "c3" },
		]);
	});


	test("filter by the title containing 1 inside of it.", async function () {
		let jobs = await Job.findAll({title: "1"});

		expect(jobs).toEqual([
			{ id: 1, title: "job1", salary: 10000, equity: "0.5", company_handle: "c1" }
		])
	});

	test("filter by name containing job and having minSalary of 11000.", async function () {
		let jobs = await Job.findAll({title: "job",minSalary: 11000});

		expect(jobs).toEqual([
			{ id: 2, title: "job2", salary: 11000, equity: "0.3141592653", company_handle: "c2" },
			{ id: 3, title: "job3", salary: 12000, equity: "0.99", company_handle: "c3" },
		]);
	});

	test("filter by values where nothing is matched.", async function () {
		let jobs = await Job.findAll({title:"ABCD"});

		expect(jobs).toEqual([]);
	});

});


describe("get", function () {
	test("succeeds", async function () {
		let job = await Job.get(1);
		expect(job).toEqual({
			id: 1,
			title: "job1",
			salary: 10000,
			equity: "0.5",
			company_handle: "c1"
		});
	});

	test("fails", async function () {
		expect.assertions(1);
		try {
			await Job.get("nope");
		} catch (err) {
			expect(err).toBeTruthy();
		}
	});
});


describe("create", function () {

	test("succeeds", async function () {
		let job = await Job.create({
			title: "job4",
			salary: 14000,
			equity: "0.5",
			company_handle: "c1"
		});
		expect(job).toEqual({
			id: expect.any(Number),
			title: "job4",
			salary: 14000,
			equity: "0.5",
			company_handle: "c1"
		});
		const result = await db.query(`SELECT *
                                   FROM jobs
                                   WHERE id = ${job.id}`);
		expect(result.rows).toEqual([
			{
				id: job.id,
				title: "job4",
				salary: 14000,
				equity: "0.5",
				company_handle: "c1",
			},
		]);
	});

	test("fails with unknown company handle.", async function () {
		expect.assertions(1);
		try {
			await Job.create({
				title: "job5",
				salary: 15000,
				equity: "0.5",
				company_handle: "DOESNOTEXIST"
			});
		} catch (err) {
			expect(err).toBeTruthy();
		}
	})
});


describe("update", function () {
	test("succeeds", async function () {
		let job = await Job.update(1, {
			title: "newJob1",
		});
		expect(job).toEqual({
			id: 1,
			title: "newJob1",
			salary: 10000,
			equity: "0.5",
			company_handle: "c1",
		});

		const result = await db.query(`SELECT *
                                   FROM jobs
                                   WHERE id = 1`);
		expect(result.rows).toEqual([
			{
				id: 1,
				title: "newJob1",
				salary: 10000,
				equity: "0.5",
				company_handle: "c1",
			},
		]);
	});

	test("fails if not found", async function () {
		expect.assertions(1);
		try {
			await Job.update(314, {
				title: "newJob",
			});
		} catch (err) {
			expect(err).toBeTruthy();
		}
	});

	test("fails with no data", async function () {
		expect.assertions(1);
		try {
			await Job.update(1, {});
		} catch (err) {
			expect(err).toBeTruthy();
		}
	});

	test("fails when trying to update company_handle.", async function () {

		try {
			await Job.update(1, {
				company_handle: "c3",
			});
			fail("Error was expected.")
		} catch (err) {
			expect(err).toBeTruthy();
		}
	});
});


describe("remove", function () {
	test("succeeds", async function () {
		await Job.remove(1);
		const res = await db.query(
			"SELECT * FROM jobs WHERE id=$1", [1]);
		expect(res.rows.length).toEqual(0);
	});

	test("fails if not found", async function () {
		expect.assertions(1);
		try {
			await Job.remove("nope");
		} catch (err) {
			expect(err).toBeTruthy();
		}
	});
});
