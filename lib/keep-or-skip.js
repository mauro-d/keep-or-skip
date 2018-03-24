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
var KeepOrSkipError = require('./error/KeepOrSkipError')
var ec = KeepOrSkipError.codes

/**
 *
 * @param {(Function|Function[])} middlewares A middleware or an array of
 * middlewares to handle dynamically.
 * @param {Function} predicate A function that returns a boolean value,
 * by which, one or more middlewares will be executed or skipped.
 * This function takes as input two optional parameters, the request and
 * the response objects.
 * @returns {Function[]} An array of wrapped middlewares.
 * @version 1.0.0
 * @author Nicola Del Gobbo - Mauro Doganieri
 */
module.exports = function keepOrSkip(middlewares, predicate) {
    if (!isFunction(predicate)) {
        throw new KeepOrSkipError(ec.INVALID_PREDICATE_PARAM.message)
    }
    var skipAll = false
    var wrappedMiddlewares = []
    var predicateResult
    wrappedMiddlewares.push(function (req, res, next) {
        predicateResult = predicate(req, res, noop)
        if (isBoolean(predicateResult) && predicateResult === true) {
            skipAll = false
        } else {
            skipAll = true
        }
        next = next || noop
        next()
    })
    var wrap = function (middleware) {
        return function (req, res, next) {
            if (skipAll === true) {
                next = next || noop
                next()
            }
            middleware(req, res, next)
        }
    }
    if (isFunction(middlewares)) {
        wrappedMiddlewares.push(wrap(middlewares))
    } else if (Array.isArray(middlewares)) {
        if (middlewares.length === 0) {
            throw new KeepOrSkipError(ec.INVALID_MIDDLEWARES_PARAM.message)
        }
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

function noop() { }

function isFunction(value) {
    return typeof value === 'function'
}

function isBoolean(value) {
    return value === true ||
        value === false ||
        Object.prototype.toString.call(value) === '[object Boolean]'
}