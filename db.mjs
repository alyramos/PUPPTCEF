import * as dotenv from "dotenv";
import pg from "pg";
const { Pool } = pg;

dotenv.config();

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.DATABASE_URL ? { rejectUnauthorized: false } : false
});

export default pool;

async function initializeDatabase() {
  // Connect to Database
  const client = await pool.connect();
  
  try {
    // Drop Database on start
    await client.query("DROP SCHEMA public CASCADE");
    await client.query("CREATE SCHEMA public");
    await client.query("SET search_path TO public");
    console.log("Schema created");

    // Create Table
    await client.query(`
      CREATE TABLE students (
        student_id SERIAL PRIMARY KEY,
        student_name VARCHAR(255),
        student_number VARCHAR(255),
        student_program VARCHAR(255),
        target_semester VARCHAR(255),
        createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        signature VARCHAR(255)
      )
    `);
    console.log("Students Table created");

    // Create Programs Table with student_id as foreign key
    await client.query(`
      CREATE TABLE programs (
        program_id SERIAL PRIMARY KEY,
        student_id INT,
        program_cp VARCHAR(255),
        program_cp_title VARCHAR(255),
        program_dean VARCHAR(255),
        program_sy VARCHAR(255),
        FOREIGN KEY (student_id) REFERENCES students(student_id)
      )
    `);
    console.log("Programs Table created");

    // Create Subjects Table with student_id as foreign key
    await client.query(`
      CREATE TABLE subjects (
        subject_id SERIAL PRIMARY KEY,
        student_id INT,
        subject_code VARCHAR(255),
        subject_description VARCHAR(255),
        subject_day VARCHAR(255),
        subject_time VARCHAR(255),
        subject_units INT,
        FOREIGN KEY (student_id) REFERENCES students(student_id)
      )
    `);
    console.log("Subjects Table created");

    // Create Reasons Table with student_id as foreign key
    await client.query(`
      CREATE TABLE reasons (
        reason_id SERIAL PRIMARY KEY,
        student_id INT,
        reason VARCHAR(255),
        FOREIGN KEY (student_id) REFERENCES students(student_id)
      )
    `);
    console.log("Reasons Table created");

    // Create CrossEnrollments Table with student_id as foreign key
    await client.query(`
      CREATE TABLE crossenrollments (
        cross_enrollment_id SERIAL PRIMARY KEY,
        student_id INT,
        current_units INT,
        cross_enroll_units INT,
        total_units INT,
        FOREIGN KEY (student_id) REFERENCES students(student_id)
      )
    `);
    console.log("CrossEnrollments Table created");
  } catch (err) {
    console.log(err);
  } finally {
    client.release();
  }
}

initializeDatabase();
