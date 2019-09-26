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

var isBoolean = require('./util').isBoolean

function debugParser(value) {
    if (isBoolean(value)) {
        return value
    }
    return undefined
}

function debugHandler() {
    var globalDebug = undefined
    var localDebug = undefined
    return {
        setGlobalDebug: function setGlobalDebug(value) {
            globalDebug = debugParser(value)
        },
        setLocalDebug: function setLocalDebug(value) {
            localDebug = debugParser(value)
        },
        isActiveDebug: function isActiveDebug() {
            var isActive = false
            if (isBoolean(localDebug)) {
                isActive = localDebug
            } else if (globalDebug === true) {
                isActive = true
            }
            return isActive
        }
    }
}

module.exports = debugHandler()
