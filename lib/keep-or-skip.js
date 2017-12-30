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

/**
 *
 * @param {Object} maybeObj An object whose fields are each an array containing
 * one or more express or connect middlewares to handle dynamically.
 * @param {Function} predicate A function that returns a property name contained
 * in the maybeObj param and representing the set of middlewares to use.
 * @returns {Function[]} An array of wrapped middlewares representing all the
 * middlewares cointained in the maybeObj param which are kept or skipped based
 * on the value returned by the predicate param.
 * @version 1.0.0
 * @author Nicola Del Gobbo - Mauro Doganieri
 */
module.exports = function keepOrSkip(maybeObj, predicate) {
    if (!isObject(maybeObj)) {
        throw new Error('The maybeObj parameter must be a valid JavaScript' +
            ' object.')
    }
    if (!isFunction(predicate)) {
        throw new Error('The predicate parameter must be a function.')
    }
    var middlewares = []
    var predicateResult
    middlewares.push((req, res, next) => {
        predicateResult = predicate(req, res, noop)
        if (!maybeObj.hasOwnProperty(predicateResult)) {
            throw new Error('The predicate paramter must return a maybeObj\'s' +
                ' property.')
        }
        next = next || noop
        next()
    })
    for (var key in maybeObj) {
        if (!isNotEmptyArray(maybeObj[key])) {
            throw new Error('Every maybeObj\'s property must have an array of' +
                ' middlewares as its value.')
        }
        maybeObj[key].forEach((m, i) => {
            if (!isFunction(m)) {
                throw new Error('The element ' + m + ' in maybeObj[' + key +
                    '][' + i + '] is not a valid function.')
            }
            middlewares.push((function wrapper(key) {
                return (req, res, next) => {
                    if (key == predicateResult) {
                        m(req, res, next)
                    } else {
                        next = next || noop
                        next()
                    }
                }
            })(key))
        })
    }
    return middlewares
}

function noop() { }

function isObject(value) {
    return value !== null && typeof value === 'object'
}

function isFunction(value) {
    return typeof value === 'function'
}

function isNotEmptyArray(value) {
    return Array.isArray(value) && value.length > 0
}