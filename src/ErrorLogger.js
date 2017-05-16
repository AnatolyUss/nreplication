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

const fs  = require('fs');
const log = require('./Logger');

/**
 * Writes a ditailed error message to the "/errors-only.log" file
 *
 * @param {Nreplication} nreplication
 * @param {String}       message
 * @param {String}       sql
 * @param {Function}     callback
 *
 * @returns {undefined}
 */
module.exports = (nreplication, message, sql, callback) => {
    message      += '\n\n\tSQL: ' + (sql || '') + '\n\n';
    const buffer  = Buffer.from(message, nreplication._encoding);
    log(nreplication, message, undefined, true, () => {
        fs.open(nreplication._errorLogsPath, 'a', nreplication._0777, (error, fd) => {
            if (error) {
                return callback();
            }

            fs.write(fd, buffer, 0, buffer.length, null, () => {
                fs.close(fd, callback);
            });
        });
    });
};
