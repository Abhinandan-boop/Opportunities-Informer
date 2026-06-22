const mysql = require("mysql2");

const db = mysql.createConnection({

    host: "localhost",

    user: "root",

    password: "aarushi@1234",

    database: "OpBox"

});

db.connect(err => {

    if(err){
        console.log(err);
        return;
    }

    console.log("✅ Connected to MySQL");

});

module.exports = db;