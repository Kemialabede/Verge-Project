const { Pool } = require('pg');
const dotenv = require("dotenv")

dotenv.config();

const connectionString = process.env.DATABASE_URL
const pool = new Pool({
    connectionString: connectionString
})
pool.on("connect", () => {
    console.log("connected to db successfully");
});
pool.on("error", (err) => {
    console.log("could not connect to database", err);
});
module.exports = pool