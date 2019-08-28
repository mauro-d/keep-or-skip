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

var KeepOrSkipError = require('./error/KeepOrSkipError')
var ec = KeepOrSkipError.codes

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

function makeSkip(debugMessage) {
    var skip = false
    return {
        get: function getSkip() {
            return skip
        },
        set: function setSkip(predicateResult) {
            if (isBoolean(predicateResult)) {
                skip = !predicateResult
            } else {
                skip = true
                debugMessage()
            }
        }
    }
}

function makeDebugMessage(activeDebug) {
    return function debugMessage() {
        if (activeDebug) {
            log('The predicate parameter doesn\'t return a boolean value,' +
                ' midllewares will be skipped.')
        }
    }
}

function makePredicateMiddlewareMaker(skip) {
    return function makePredicateMiddleware(predicate) {
        return function predicateMiddleware(req, res, next) {
            skip.set(predicate(req, res))
            next = next || noop
            next()
        }
    }
}

function makeWrappedMiddlewareMaker(skip) {
    return function makeWrappedMiddleware(middleware) {
        return function wrappedMiddleware(req, res, next) {
            if (skip.get()) {
                next = next || noop
                next()
            } else {
                return middleware(req, res, next)
            }
        }
    }
}

function checkMiddleware(middleware) {
    if (!isFunction(middleware)) {
        throw new KeepOrSkipError(ec.INVALID_MIDDLEWARES_PARAM.message)
    }
    return middleware
}

function parseInput(middlewares, predicate) {
    if (!isFunction(predicate)) {
        throw new KeepOrSkipError(ec.INVALID_PREDICATE_PARAM.message)
    }
    var parsedMiddlewares = []
    if (Array.isArray(middlewares) && middlewares.length > 0) {
        parsedMiddlewares = middlewares.map(checkMiddleware)
    } else if (isFunction(middlewares)) {
        parsedMiddlewares = parsedMiddlewares.concat(middlewares)
    } else {
        throw new KeepOrSkipError(ec.INVALID_MIDDLEWARES_PARAM.message)
    }
    return parsedMiddlewares
}

function makeWrappers(debug, DEBUG) {
    var debugMessage = makeDebugMessage(checkDebug(debug, DEBUG))
    var skip = makeSkip(debugMessage)
    return {
        makePredicateMiddleware: makePredicateMiddlewareMaker(skip),
        makeWrappedMiddleware: makeWrappedMiddlewareMaker(skip)
    }
}

module.exports = exports = {
    isBoolean: isBoolean,
    parseInput: parseInput,
    makeWrappers: makeWrappers
}
