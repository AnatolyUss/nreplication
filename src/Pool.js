/*
 * This file is a part of "NREPLICATION" - the database replication tool.
 *
 * Copyright (C) 2017 - present, Anatoly Khaytovich <anatolyuss@gmail.com>
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program (please see the "LICENSE.md" file).
 * If not, see <http://www.gnu.org/licenses/gpl.txt>.
 *
 * @author Anatoly Khaytovich <anatolyuss@gmail.com>
 */
'use strict';

const mysql = require('mysql');
const pg    = require('pg');
const log   = require('./Logger');

/**
 * Ensure MySQL connections pool is available.
 * If not, then create the pool.
 *
 * @param {Nreplication} nreplication
 *
 * @returns {Promise}
 */
const getMySqlPool = nreplication => {
    return new Promise((mysqlResolve, mysqlReject) => {
        if (!nreplication._mysql) {
            nreplication._sourceConDetails.connectionLimit = nreplication._maxPoolSizeSource;
            const pool                                     = mysql.createPool(nreplication._sourceConDetails);

            if (pool) {
                nreplication._mysql = pool;
                mysqlResolve();
            } else {
                const message = '\t--[Pool::getMySqlPool] Cannot create MySQL connections pool...';
                log(nreplication, message, undefined, mysqlReject);
            }
        } else {
            mysqlResolve();
        }
    });
};

/**
 * Ensure PostgreSQL connections pool is available.
 * If not, then create the pool.
 *
 * @param {Nreplication} nreplication
 *
 * @returns {Promise}
 */
const getPgSqlPool = nreplication => {
    return new Promise((pgResolve, pgReject) => {
        if (!nreplication._pg) {
            nreplication._targetConDetails.max = nreplication._maxPoolSizeTarget;
            const pool                         = new pg.Pool(nreplication._targetConDetails);

            if (pool) {
                nreplication._pg = pool;
                nreplication._pg.on('error', error => {
                    const message = '\t--[Pool::getPgSqlPool] Cannot create PostgreSQL connections pool...\n'
                        + error.message + '\n' + error.stack;

                    log(nreplication, message, undefined, () => {
                        process.exit();
                    });
                });

                pgResolve();
            } else {
                log(
                    nreplication,
                    '\t--[Pool::getPgSqlPool] Cannot create PostgreSQL connections pool...',
                    undefined,
                    pgReject
                );
            }
        } else {
            pgResolve();
        }
    });
};

/**
 * Check if both pools exist.
 * If not, than create pools.
 * Kill current process if can not create pools.
 *
 * @param {Nreplication} nreplication
 *
 * @returns {Promise}
 */
module.exports = nreplication => {
    return new Promise(resolve => {
        Promise.all([getMySqlPool(nreplication), getPgSqlPool(nreplication)])
            .then(() => resolve(nreplication))
            .catch(() => process.exit());
    });
};
