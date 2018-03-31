/*******************************************************************************
 * Copyright (c) 2016 Mauro Doganieri - Nicola Del Gobbo
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
var express = require('express')
var request = require('supertest')
var keepOrSkip = require('../')
var KeepOrSkipError = require('../lib/error/KeepOrSkipError')
var ec = KeepOrSkipError.codes

function m1(req, res, next) {
    if (!req.middlewares) {
        req.middlewares = []
    }
    req.middlewares.push('m1')
    next()
}

function m2(req, res, next) {
    if (!req.middlewares) {
        req.middlewares = []
    }
    req.middlewares.push('m2')
    next()
}

function saveMiddlewares(key) {
    return function (req, res, next) {
        if (!req.savedMiddlewares) {
            req.savedMiddlewares = {}
        }
        req.savedMiddlewares[key] = req.middlewares
        next()
    }
}

function clear(req, res, next) {
    req.middlewares = []
    next()
}

function setValue(number) {
    return function (req, res, next) {
        req.value = number
        next()
    }
}

function respond(req, res, next) {
    res.status(200).json(req.savedMiddlewares)
}

var arr1 = [m1, m2, m1]
var arr2 = [m2, m2]

// keep-or-skip module will throw an error if the "middlewares" parameter has
// the following values
var mi = [
    undefined,
    null,
    '',
    true,
    false,
    'string',
    11,
    {},
    [],
    [undefined],
    [null],
    [''],
    [true],
    [false],
    ['string'],
    [11],
    [{}],
    [[]]
]

// keep-or-skip module will throw an error if the "predicate" parameter has
// the following values
var pi = [
    undefined,
    null,
    '',
    true,
    false,
    'string',
    11,
    {},
    []
]

describe('keep-or-skip module', function () {

    /**
     * Testing middlewares parameter
     */
    for (var i = 0; i < mi.length; i++) {
        (function testMiddlewares(input) {
            it('should throw KeepOrSkipError - ' + ec.INVALID_MIDDLEWARES_PARAM.message, function () {
                expect(function () {
                    var app = express()
                    app.use(keepOrSkip(input, function () { }))
                })
                .toThrow(new KeepOrSkipError(ec.INVALID_MIDDLEWARES_PARAM.message))
            })
        })(mi[i])
    }

    /**
     * Testing predicate parameter
     */
    for (var i = 0; i < pi.length; i++) {
        (function testPredicate(input) {
            it('should throw KeepOrSkipError - ' + ec.INVALID_PREDICATE_PARAM.message, function () {
                expect(function () {
                    var app = express()
                    app.use(keepOrSkip(function () { }, input))
                })
                .toThrow(new KeepOrSkipError(ec.INVALID_PREDICATE_PARAM.message))
            })
        })(pi[i])
    }

    /**
     * Testing middleware execution
     */
    it('should throw an error', function (done) {
        var app = express()
        var kosArr1 = keepOrSkip(arr1, (req, res) => {
            if (req.value < 0) {
                return true
            }
            return false
        })
        var kosArr2 = keepOrSkip(arr2, (req, res) => {
            if (req.value >= 0) {
                return true
            }
            return false
        })
        app.get('/',
            setValue(1),
            kosArr1, // should skip
            kosArr2, // should execute
            saveMiddlewares('first'),
            clear,
            setValue(-1),
            kosArr1, // should execute
            kosArr2, // should skip
            saveMiddlewares('second'),
            clear,
            kosArr1, // should execute
            kosArr2, // should skip
            saveMiddlewares('third'),
            clear,
            respond
        )
        var checkProp = function checkProp(res, prop, arr) {
            for (var i = 0; i < res.body[prop].length; i++) {
                if (arr[i].name !== res.body[prop][i]) {
                    return true
                }
            }
            return false
        }
        return request(app)
            .get('/')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err)
                }
                var error = false
                if (!(res.body.first && res.body.first.length === arr2.length &&
                    res.body.second && res.body.second.length === arr1.length &&
                    res.body.third && res.body.third.length === arr1.length)) {
                    error = true
                } else {
                    for (var prop in res.body) {
                        if (prop === 'first') {
                            error = checkProp(res, prop, arr2)
                        }
                        if (prop === 'second' || prop === 'third') {
                            error = checkProp(res, prop, arr1)
                        }
                    }
                }
                if (error) {
                    done(new Error('Wrong result'))
                }
                done()
            })
    })

})