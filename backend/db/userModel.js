const db = require("./connection");

async function findUserByEmail(email) {
    return new Promise((resolve, reject) => {
        db.query(
            "SELECT * FROM users WHERE email = ?",
            [email],
            (err, results) => {
                if (err) return reject(err);
                resolve(results[0]);
            }
        );
    });
}

async function createUser(user) {
    return new Promise((resolve, reject) => {
        db.query(
            `INSERT INTO users
            (name,email,google_id,picture)
            VALUES(?,?,?,?)`,
            [
                user.name,
                user.email,
                user.googleId,
                user.picture
            ],
            (err, results) => {
                if(err) return reject(err);
                resolve(results);
            }
        );
    });
}

module.exports = {
    findUserByEmail,
    createUser
};