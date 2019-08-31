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

/*!
 * Module dependencies
 */
var utils = require('./utils')

var isBoolean = utils.isBoolean
var makeWrappers = utils.makeWrappers
var parseInput = utils.parseInput

module.exports = (function keepOrSkipIIFE() {
    var DEBUG = false
    
    /**
     *
     * @param {(Function|Function[])} middlewares A middleware or an array of
     * middlewares to handle dynamically.
     * @param {Function} predicate A function that returns a boolean value,
     * by which, one or more middlewares will be executed or skipped.
     * This function takes as input two optional parameters, the request and
     * the response objects. If the predicate doesn't return a boolean value,
     * the middleware/middlewares contained in the middlewares parameter will be
     * skipped.
     * @param {Boolean} [debug=false] An optional boolean parameter to enable a
     * warning log which notifies that the predicate parameter doesn't return a
     * boolean value.
     * @returns {Function[]} An array of middlewares.
     * @version 1.0.5
     * @author Nicola Del Gobbo - Mauro Doganieri
     */
    function keepOrSkip(middlewares, predicate, debug) {
        var parsedMiddlewares = parseInput(middlewares, predicate)
        var wrappers = makeWrappers(debug, DEBUG)
        var makePredicateMiddleware = wrappers.makePredicateMiddleware
        var makeWrappedMiddleware = wrappers.makeWrappedMiddleware
        var wrappedMiddlewares = [
            makePredicateMiddleware(predicate)
        ]
        return wrappedMiddlewares.concat(
            parsedMiddlewares.map(makeWrappedMiddleware)
        )
    }
    
    keepOrSkip.debug = function debug(debug) {
        DEBUG = isBoolean(debug) ? debug : false
    }

    return keepOrSkip
})()
