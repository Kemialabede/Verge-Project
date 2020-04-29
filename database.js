const { Pool } = require('pg');
const pool = new Pool({
    user: 'postgres',
    host: 'localhost',
    database: 'kemi',
    password: 'cocojones',
    port: 5432,
})
pool.on("connect", () => {
    console.log("connected to db successfully");
});
pool.on("error", (err) => {
    console.log("could not connect to database", err);
});
module.exports = pool