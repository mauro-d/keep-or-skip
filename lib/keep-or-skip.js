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

var helpers = require('./helpers')

var inputParser = helpers.inputParser
var isActiveDebug = helpers.debug.isActiveDebug
var makeDebugHandler = helpers.debug.makeDebugHandler
var setGlobalDebug = helpers.debug.setGlobalDebug
var makeSkipHandler = helpers.makeSkipHandler
var makePredicateMiddleware = helpers.wrappers.makePredicateMiddleware
var makeWrappedMiddleware = helpers.wrappers.makeWrappedMiddleware

/**
 *
 * @param {(Function|Function[])} middlewares A middleware or an array of
 * middlewares to be handled dynamically.
 * @param {Function} predicate A function returning a boolean value affecting
 * the execution of the speciefied middlewares. This function takes as input two
 * optional parameters, the request and the response objects. If the predicate
 * does not return a boolean value, middlewares will be skipped.
 * @param {Boolean} [debug=false] An optional boolean parameter enabling a
 * warning log which notifies whether predicate returned a boolean value.
 * @returns {Function[]} An array of middlewares.
 * @version 1.0.5
 * @author Nicola Del Gobbo - Mauro Doganieri
 */
function keepOrSkip(middlewares, predicate, debug) {
    var parsedMiddlewares = inputParser(middlewares, predicate)
    var localDebugHandler = makeDebugHandler()
    localDebugHandler.setDebug(debug)
    var skipHandler = makeSkipHandler(isActiveDebug(localDebugHandler))
    var predicateMiddleware = makePredicateMiddleware(predicate, skipHandler)
    var wrappedMiddlwares = parsedMiddlewares.map(makeWrappedMiddleware(skipHandler))
    return [predicateMiddleware].concat(wrappedMiddlwares)
}

keepOrSkip.debug = setGlobalDebug

module.exports = keepOrSkip
