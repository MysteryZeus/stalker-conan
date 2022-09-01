const pg = require("pg");
const db_conf = require('../configs/db.json');

const pool = new pg.Pool(db_conf);

module.exports = {
    query(query, params=[]) {
        return pool.query(query, params);
    },
    end() {
        pool.end();
    }
};