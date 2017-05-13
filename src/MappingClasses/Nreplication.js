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

const path   = require('path');
const ZongJi = require('zongji');

/**
 * Checks if given value is integer number.
 *
 * @param {String|Number} value
 *
 * @returns {Boolean}
 */
const isIntNumeric = value => {
    return !isNaN(parseInt(value)) && isFinite(value);
};

/**
 * Constructor.
 *
 * @param {Object} config
 */
module.exports = function Nreplication(config) {
    this._config               = config;
    this._sourceConDetails     = this._config.source;
    this._targetConDetails     = this._config.target;
    this._logsDirPath          = this._config.logsDirPath;
    this._allLogsPath          = path.join(this._logsDirPath, 'all.log');
    this._errorLogsPath        = path.join(this._logsDirPath, 'errors-only.log');
    this._excludeTables        = this._config.exclude_tables;
    this._encoding             = this._config.encoding === undefined ? 'utf8' : this._config.encoding;
    this._0777                 = '0777';
    this._mysql                = null;
    this._pg                   = null;
    this._mysqlVersion         = '5.6.21'; // Simply a default value.
    this._extraConfig          = this._config.extraConfig;
    this._dicTablesToReplicate = Object.create(null);
    this._schema               = this._config.schema === undefined || this._config.schema === '' ? 'public' : this._config.schema;
    this._zongji               = new ZongJi({
        host     : _sourceConDetails.host,
        user     : _sourceConDetails.user,
        password : _sourceConDetails.password
    });

    this._maxPoolSizeSource    = this._config.max_pool_size_source !== undefined && isIntNumeric(this._config.max_pool_size_source)
        ? +this._config.max_pool_size_source
        : 10;

    this._maxPoolSizeTarget    = this._config.max_pool_size_target !== undefined && isIntNumeric(this._config.max_pool_size_target)
        ? +this._config.max_pool_size_target
        : 10;

    this._maxPoolSizeSource    = this._maxPoolSizeSource > 0 ? this._maxPoolSizeSource : 10;
    this._maxPoolSizeTarget    = this._maxPoolSizeTarget > 0 ? this._maxPoolSizeTarget : 10;
};
