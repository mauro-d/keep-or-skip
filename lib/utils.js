/*******************************************************************************
 * Copyright (c) 2017 Mauro Doganieri - Nicola Del Gobbo
 * Licensed under the Apache License, Version 2.0 (the "License"); you may not
 * use this file except in compliance with the License. You may obtain a copy of
 * the license at http://www.apache.org/licenses/LICENSE-2.0
 *
 * THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS
 * OF ANY KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY
 * IMPLIED WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
 * MERCHANTABLITY OR NON-INFRINGEMENT.
 *
 * See the Apache Version 2.0 License for specific language governing
 * permissions and limitations under the License.
 *
 * Contributors - initial API implementation:
 * Mauro Doganieri <mauro.doganieri@gmail.com>
 * Nicola Del Gobbo <nicoladelgobbo@gmail.com>
 ******************************************************************************/

'use strict'

function noop() { }

function isFunction(value) {
    return typeof value === 'function'
}

function isBoolean(value) {
    return value === true ||
        value === false ||
        Object.prototype.toString.call(value) === '[object Boolean]'
}

function log(msg) {
    process.stdout.write('KeepOrSkipWarning: ' + msg)
}

function checkDebug(ld, gd) {
    ld = isBoolean(ld) ? ld : null
    if (ld === true || (ld === null && gd)) {
        return true
    }
    return false
}

module.exports = exports = {
    noop: noop,
    isFunction: isFunction,
    isBoolean: isBoolean,
    log: log,
    checkDebug: checkDebug
}