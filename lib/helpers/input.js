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

var KeepOrSkipError = require('../error/KeepOrSkipError')
var util = require('./util')

var ec = KeepOrSkipError.codes
var isFunction = util.isFunction
var not = util.not

var notIsFunction = not(isFunction)

function normalizeMiddlewares(middlewares) {
    var parsedMiddlewares = []
    if (Array.isArray(middlewares) && middlewares.length > 0) {
        parsedMiddlewares = middlewares.slice()
    } else {
        parsedMiddlewares.push(middlewares)
    }
    return parsedMiddlewares
}

function inputParser(middlewares, predicate) {
    if (!isFunction(predicate)) {
        throw new KeepOrSkipError(ec.INVALID_PREDICATE_PARAM.message)
    }
    var parsedMiddlewares = normalizeMiddlewares(middlewares)
    var notValidMiddlewares = parsedMiddlewares.some(notIsFunction)
    if (notValidMiddlewares) {
        throw new KeepOrSkipError(ec.INVALID_MIDDLEWARES_PARAM.message)
    }
    return parsedMiddlewares
}

module.exports = inputParser
