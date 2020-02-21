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

var util = require('./util')

var isBoolean = util.isBoolean
var warn = util.warn

function makeSkipHandler(isActiveDebug) {
    var skip = false
    return {
        setSkip: function setSkip(predicateResult) {
            if (isBoolean(predicateResult)) {
                skip = !predicateResult
            } else {
                skip = true
                if (isActiveDebug) {
                    warn('The predicate parameter doesn\'t return a boolean' +
                        ' value, midllewares will be skipped.')
                }
            }
        },
        getSkip: function getSkip() {
            return skip
        }
    }
}

module.exports = makeSkipHandler
