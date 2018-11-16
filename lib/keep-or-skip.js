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

var DEBUG = false

/*!
 * Module dependencies
 */
var KeepOrSkipError = require('./error/KeepOrSkipError')
var ec = KeepOrSkipError.codes

var utils = require('./utils')
var noop = utils.noop
var isFunction = utils.isFunction
var isBoolean = utils.isBoolean
var log = utils.log
var checkDebug = utils.checkDebug

/**
 *
 * @param {(Function|Function[])} middlewares A middleware or an array of
 * middlewares to handle dynamically.
 * @param {Function} predicate A function that returns a boolean value,
 * by which, one or more middlewares will be executed or skipped.
 * This function takes as input two optional parameters, the request and
 * the response objects. If the predicate doesn't return a boolean value, the
 * middleware/middlewares contained in the middlewares parameter will be
 * skipped.
 * @param {Boolean} [debug=false] An optional boolean parameter to enable a
 * warning log which notifies that the predicate parameter doesn't return a
 * boolean value.
 * @returns {Function[]} An array of middlewares.
 * @version 1.0.3
 * @author Nicola Del Gobbo - Mauro Doganieri
 */
function keepOrSkip(middlewares, predicate, debug) {
    if (!isFunction(predicate)) {
        throw new KeepOrSkipError(ec.INVALID_PREDICATE_PARAM.message)
    }
    var skip = false
    var wrappedMiddlewares = []
    var activeDebug = checkDebug(debug, DEBUG)
    wrappedMiddlewares.push(function (req, res, next) {
        var predicateResult = predicate(req, res)
        if (isBoolean(predicateResult)) {
            skip = !predicateResult
        } else {
            skip = true
            if (activeDebug) {
                log('The predicate parameter doesn\'t return a boolean value,' +
                    ' midllewares will be skipped.')
            }
        }
        next = next || noop
        next()
    })
    var wrap = function (middleware) {
        return function (req, res, next) {
            if (skip === true) {
                next = next || noop
                next()
            } else {
                return middleware(req, res, next)
            }
        }
    }
    if (isFunction(middlewares)) {
        wrappedMiddlewares.push(wrap(middlewares))
    } else if (Array.isArray(middlewares) && middlewares.length > 0) {
        middlewares.forEach(function (m) {
            if (!isFunction(m)) {
                throw new KeepOrSkipError(ec.INVALID_MIDDLEWARES_PARAM.message)
            }
            wrappedMiddlewares.push(wrap(m))
        })
    } else {
        throw new KeepOrSkipError(ec.INVALID_MIDDLEWARES_PARAM.message)
    }
    return wrappedMiddlewares
}

keepOrSkip.debug = function debug(debug) {
    DEBUG = isBoolean(debug) ? debug : false
}

module.exports = keepOrSkip
