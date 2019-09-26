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

describe('testing input parameters', function () {

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

    /**
     * Testing the middlewares parameter
     */
    for (var i = 0; i < mi.length; i++) {
        (function testMiddlewares(input) {
            it('should throw an error about invalid middlewares param: ' + input, function () {
                expect(function () {
                    var app = express()
                    app.use(keepOrSkip(input, function () { }))
                })
                .toThrow(new KeepOrSkipError(ec.INVALID_MIDDLEWARES_PARAM.message))
            })
        })(mi[i])
    }

    /**
     * Testing the predicate parameter
     */
    for (var i = 0; i < pi.length; i++) {
        (function testPredicate(input) {
            it('should throw an error about invalid predicate param: ' + input, function () {
                expect(function () {
                    var app = express()
                    app.use(keepOrSkip(function () { }, input))
                })
                .toThrow(new KeepOrSkipError(ec.INVALID_PREDICATE_PARAM.message))
            })
        })(pi[i])
    }

})

describe('testing the middlewares execution', function () {

    function init(req, res, next) {
        req.middlewares = []
        next()
    }

    function setValue(number) {
        return function (req, res, next) {
            req.value = number
            next()
        }
    }

    function makeMiddleware(name) {
        return function middleware(req, res, next) {
            req.middlewares.push(name)
            next()
        }
    }

    function respond(req, res, next) {
        res.status(200).json(req.middlewares)
    }

    it('should throw an error if the middleware execution sequence is incorrect', function (done) {
        var app = express()
        var m1 = makeMiddleware('m1')
        var m2 = makeMiddleware('m2')
        var wm1 = keepOrSkip(m1, req => req.value < 0)
        var wm2 = keepOrSkip(m2, req => req.value >= 0)
        var seq = ['m1', 'm1', 'm2', 'm1', 'm2', 'm2', 'm1']

        app.get('/',
            init,
            setValue(-1),
            wm1, // run
            wm2, // skip
            wm1, // run
            wm2, // skip
            setValue(0),
            wm1, // skip
            wm2, // run
            setValue(-1),
            wm1, // run
            wm2, // skip
            setValue(0),
            wm1, // skip
            wm2, // run
            wm1, // skip
            wm2, // run
            setValue(-1),
            wm1, // run
            wm2, // skip
            respond
        )

        return request(app)
            .get('/')
            .set('Accept', 'application/json')
            .expect(200)
            .end(function (err, res) {
                if (err) {
                    done(err)
                }
                if (seq.toString() !== res.body.toString()) {
                    done(new Error('Wrong middleware execution sequence'))
                }
                done()
            })
    })

})

describe('testing the warning message', function () {

    var app, middlewares

    beforeEach(function () {
        keepOrSkip.debug(false)
        app = express()
        middlewares = [
            hookStdOut,
            unhookStdOut,
            respond
        ]
    })

    var warningMsg = 'KeepOrSkipWarning: The predicate parameter' +
        ' doesn\'t return a boolean value,' +
        ' midllewares will be skipped.'

    function hookStream(stream, fn) {
        var oldWrite = stream.write
        stream.write = fn
        return function () {
            stream.write = oldWrite
        }
    }

    function hookStdOut(req, res, next) {
        req.unhookStdout = hookStream(process.stdout, function (string, encoding, fd) {
            req.log = string
        })
        next()
    }

    function unhookStdOut(req, res, next) {
        req.unhookStdout()
        next()
    }

    function testMiddleware(req, res, next) {
        next()
    }

    function respond(req, res, next) {
        res.send(req.log)
    }

    function noop() { }

    // Cases that SHOULD NOT fire a warning message.

    it('should respond with an empty string - global:false/local:undefined', function (done) {
        var middleware = keepOrSkip(testMiddleware, noop)
        middlewares.splice(1, 0, middleware)
        app.get('/', middlewares)
        return request(app)
            .get('/')
            .expect(
                200,
                '',
                done
            )
    })

    it('should respond with an empty string - global:false/local:false', function (done) {
        keepOrSkip.debug(false)
        var middleware = keepOrSkip(testMiddleware, noop, false)
        middlewares.splice(1, 0, middleware)
        app.get('/', middlewares)
        return request(app)
            .get('/')
            .expect(
                200,
                '',
                done
            )
    })

    it('should respond with a warning message - global:true/local:false', function (done) {
        keepOrSkip.debug(true)
        var middleware = keepOrSkip(testMiddleware, noop, false)
        middlewares.splice(1, 0, middleware)
        app.get('/', middlewares)
        return request(app)
            .get('/')
            .expect(
                200,
                '',
                done
            )
    })

    // Cases that SHOULD fire a warning message.

    it('should respond with a warning message - global:true/local:undefined', function (done) {
        keepOrSkip.debug(true)
        var middleware = keepOrSkip(testMiddleware, noop)
        middlewares.splice(1, 0, middleware)
        app.get('/', middlewares)
        return request(app)
            .get('/')
            .expect(
                200,
                warningMsg,
                done
            )
    })

    it('should respond with a warning message - global:true/local:true', function (done) {
        keepOrSkip.debug(true)
        var middleware = keepOrSkip(testMiddleware, noop, true)
        middlewares.splice(1, 0, middleware)
        app.get('/', middlewares)
        return request(app)
            .get('/')
            .expect(
                200,
                warningMsg,
                done
            )
    })

    it('should respond with a warning message - global:false/local:true', function (done) {
        keepOrSkip.debug(false)
        var middleware = keepOrSkip(testMiddleware, noop, true)
        middlewares.splice(1, 0, middleware)
        app.get('/', middlewares)
        return request(app)
            .get('/')
            .expect(
                200,
                warningMsg,
                done
            )
    })

})
