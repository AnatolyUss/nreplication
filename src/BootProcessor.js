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
 * Boot the process.
 *
 * @returns {Promise}
 */
module.exports = () => {
    return readConfig()
        .then(readExtraConfig)
        .then(initialize);
};
