// SETUP
import * as dotenv from "dotenv";
import express from "express";
import pool from "./db.mjs";

dotenv.config();

const	app 	= express(),
		port	= process.env.PORT || 3000;


app.use(express.urlencoded({extended: true}));
app.set("view engine", "ejs");
app.use(express.static("public"));


// ROUTES
app.get("/", (req, res) => {
	try {
		res.render("home");
	} catch(err) {
		res.render("errorpage");
		console.log(err);
	}
});

app.get("/form", (req, res) => {
	try {
		res.render("form");
	} catch(err) {
		res.render("errorpage");
		console.log(err);
	}
});

// API Submit Form Route
app.post("/api/form", async (req, res) => {
	try {
		const {
			student_name,
			student_number,
			student_gender,
			student_program,
			target_semester,
			signature,
			program_cp,
			program_cp_title,
			program_dean,
			subject_code,
			program_sy,
			subject_description,
			subject_day,
			subject_time,
			subject_units,
			reason,
			current_units,
			cross_enroll_units,
			total_units
		} = req.body;

		const client = await pool.connect();
		const student = await client.query(`
			INSERT INTO students (
				student_name,
				student_number,
				student_gender,
				student_program,
				target_semester,
				signature
			) VALUES ($1, $2, $3, $4, $5, $6)
		`, [student_name, student_number, student_gender, student_program, target_semester, signature]);

		const program = await client.query(`
			INSERT INTO programs (
				student_id,
				program_cp,
				program_cp_title,
				program_dean,
				program_sy
			) VALUES ($1, $2, $3, $4, $5)
		`, [student.rows[0].student_id, program_cp, program_cp_title, program_dean, program_sy]);

		const subject = await client.query(`
			INSERT INTO subjects (
				student_id,
				subject_code,
				subject_description,
				subject_day,
				subject_time,
				subject_units
			) VALUES ($1, $2, $3, $4, $5, $6)
		`, [student.rows[0].student_id, subject_code[0], subject_description[0], subject_day[0], subject_time[0], subject_units[0]]);

		const reasons = await client.query(`
			INSERT INTO reasons (
				student_id,
				reason
			) VALUES ($1, $2)
		`, [student.rows[0].student_id, reason]);

		const crossenrollments = await client.query(`
			INSERT INTO crossenrollments (
				student_id,
				current_units,
				cross_enroll_units,
				total_units
			) VALUES ($1, $2, $3, $4)
		`, [student.rows[0].student_id, current_units, cross_enroll_units, total_units]);

		alert("Submit Successful!");
		res.redirect("/");
	} catch (error) {
		console.error(error);
	}
})


app.get("*", (req, res) => {
	res.render("errorpage");
});


// LISTEN
app.listen(port, () => {
	console.log(`Server starting on port ${port}`);
})
