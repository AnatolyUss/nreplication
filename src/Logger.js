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

const fs = require('fs');

/**
 * Outputs given log.
 * Writes given log to the "/all.log" file.
 * If necessary, writes given log to the "/{tableName}.log" file.
 *
 * @param {Nreplication} nreplication
 * @param {String}       log
 * @param {String}       tableLogPath
 * @param {Function}     callback
 *
 * @returns {undefined}
 */
module.exports = (nreplication, log, tableLogPath, callback) => {
    const buffer = Buffer.from(`${log} \n\n`, nreplication._encoding);
    console.log(log);
    
    fs.open(nreplication._allLogsPath, 'a', nreplication._0777, (error, fd) => {
        if (error) {
            return callback();
        }

        fs.write(fd, buffer, 0, buffer.length, null, () => {
            fs.close(fd, () => {
                if (tableLogPath) {
                    fs.open(tableLogPath, 'a', nreplication._0777, (error, fd) => {
                        if (error) {
                            return callback();
                        }

                        fs.write(fd, buffer, 0, buffer.length, null, () => {
                            fs.close(fd, () => {
                                return callback();
                            });
                        });
                    });
                }

                return callback();
            });
        });
    });
};
