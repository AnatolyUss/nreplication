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

const fs           = require('fs');
const path         = require('path');
const Nreplication = require('./MappingClasses/Nreplication');
const getPool      = require('./Pool');
const log          = require('./Logger');

/**
 * Read the configuration file.
 *
 * @returns {Promise}
 */
const readConfig = () => {
    return new Promise((resolve, reject) => {
        const strPathToConfig = path.join(__dirname, '..', 'config.json');

        fs.readFile(strPathToConfig, (error, data) => {
            if (error) {
                reject('\n\t--Cannot run replication\nCannot read configuration info from ' + strPathToConfig);
            } else {
                try {
                    const config       = JSON.parse(data);
                    config.logsDirPath = path.join(__dirname, '..', 'logs_directory');
                    resolve(config);
                } catch (err) {
                    reject('\n\t--Cannot parse JSON from ' + strPathToConfig);
                }
            }
        });

    });
};

/**
 * Read the extra configuration file, if necessary.
 *
 * @param {Object} config
 *
 * @returns {Promise}
 */
const readExtraConfig = config => {
    return new Promise((resolve, reject) => {
        if (config.enable_extra_config !== true) {
            config.extraConfig = null;
            return resolve(config);
        }

        const strPathToExtraConfig = path.join(__dirname, '..', 'extra_config.json');

        fs.readFile(strPathToExtraConfig, (error, data) => {
            if (error) {
                reject('\n\t--Cannot run replication\nCannot read configuration info from ' + strPathToExtraConfig);
            } else {
                try {
                    config.extraConfig = JSON.parse(data);
                    resolve(config);
                } catch (err) {
                    reject('\n\t--Cannot parse JSON from ' + strPathToExtraConfig);
                }
            }
        });
    });
};

/**
 * Initialize Nreplication instance.
 *
 * @param {Object} config
 *
 * @returns {Promise}
 */
const initialize = config => {
    return new Promise(resolve => {
        resolve(new Nreplication(config));
    });
};

/**
 * Check connection.
 *
 * @param {Nreplication} nreplication
 *
 * @returns {Promise}
 */
const ping = nreplication => {
    return getPool(nreplication).then(() => {
        return new Promise(resolve => {
            // Ping MySQL server.
            nreplication._mysql.getConnection((error, connection) => {
                if (error) {
                    // Cannot continue, since the connection to MySQL server is undefined.
                    log(nreplication, '\t--[BootProcessor::ping] Cannot obtain MySQL connection.', undefined, () => process.exit());
                } else {
                    connection.query('SELECT 1;', err => {
                        connection.release();

                        if (err) {
                            log(
                                nreplication,
                                '\t--[BootProcessor::ping] Unexpected error occurred when connected to MySQL.',
                                undefined,
                                () => process.exit()
                            );
                        } else {
                            // Ping PostgreSQL server.
                            nreplication._pg.connect((pgError, client, done) => {
                                if (pgError) {
                                    // Cannot continue, since the connection to PostgreSQL server is undefined.
                                    log(nreplication, '\t--[BootProcessor::ping] Cannot obtain PostgreSQL connection.', undefined, () => process.exit());
                                } else {
                                    client.query('SELECT 1;', pgErr => {
                                        done();

                                        if (pgErr) {
                                            log(
                                                nreplication,
                                                '\t--[BootProcessor::ping] Unexpected error occurred when connected to PostgreSQL.',
                                                undefined,
                                                () => process.exit()
                                            );
                                        } else {
                                            // The ping performed successfully.
                                            const greeting = ''
                                                + '\n\n\tNREPLICATION - the database replication tool.'
                                                + '\n\tCopyright (C) 2017 - present, Anatoly Khaytovich <anatolyuss@gmail.com>.\n\n'
                                                + '\tConfiguration has been just loaded.'
                                                + '\n\tProceed? [Y/n]';

                                                console.log(greeting);
                                                process
                                                    .stdin
                                                    .resume()
                                                    .setEncoding(nreplication._encoding)
                                                    .on('data', stdin => {
                                                        if (stdin.indexOf('n') !== -1) {
                                                            console.log('\tReplication aborted.\n');
                                                            process.exit();
                                                        }

                                                        if (stdin.indexOf('Y') !== -1) {
                                                            resolve(nreplication);
                                                        }
                                                    });
                                        }
                                    });
                                }
                            });
                        }
                    });
                }
            });
        });
    });
};

/**
 * Boot the process.
 *
 * @returns {Promise}
 */
module.exports = () => {
    return readConfig()
        .then(readExtraConfig)
        .then(initialize)
        .then(ping);
};
