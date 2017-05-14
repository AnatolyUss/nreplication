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

/**
 * Get current table's name.
 *
 * @param {Nreplication} nreplication
 * @param {String}       currentTableName
 * @param {Boolean}      shouldGetOriginal
 *
 * @returns {String}
 */
module.exports.getTableName = (nreplication, currentTableName, shouldGetOriginal) => {
    if (nreplication._extraConfig !== null && 'tables' in nreplication._extraConfig) {
        for (let i = 0; i < nreplication._extraConfig.tables.length; ++i) {
            if ((shouldGetOriginal ? nreplication._extraConfig.tables[i].name.new : nreplication._extraConfig.tables[i].name.original) === currentTableName) {
                return shouldGetOriginal ? nreplication._extraConfig.tables[i].name.original : nreplication._extraConfig.tables[i].name.new;
            }
        }
    }

    return currentTableName;
};

/**
 * Get current column's name.
 *
 * @param {Nreplication} nreplication
 * @param {String}       originalTableName
 * @param {String}       currentColumnName
 * @param {Boolean}      shouldGetOriginal
 *
 * @returns {String}
 */
module.exports.getColumnName = (nreplication, originalTableName, currentColumnName, shouldGetOriginal) => {
    if (nreplication._extraConfig !== null && 'tables' in nreplication._extraConfig) {
        for (let i = 0; i < nreplication._extraConfig.tables.length; ++i) {
            if (nreplication._extraConfig.tables[i].name.original === originalTableName && 'columns' in nreplication._extraConfig.tables[i]) {
                for (let columnsCount = 0; columnsCount < nreplication._extraConfig.tables[i].columns.length; ++columnsCount) {
                    if (nreplication._extraConfig.tables[i].columns[columnsCount].original === currentColumnName) {
                        return shouldGetOriginal
                            ? nreplication._extraConfig.tables[i].columns[columnsCount].original
                            : nreplication._extraConfig.tables[i].columns[columnsCount].new;
                    }
                }
            }
        }
    }

    return currentColumnName;
};
