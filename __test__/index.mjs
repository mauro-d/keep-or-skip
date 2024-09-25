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

import assert from 'assert'
import test from 'node:test'

import express from 'express'
import request from 'supertest'
import keepOrSkip from '../index.mjs'
import KeepOrSkipError from '../lib/error/KeepOrSkipError.mjs'

const ec = KeepOrSkipError.codes

// keep-or-skip module will throw an error if the "middlewares" parameter has
// the following values
const mi = [
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
const pi = [
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

// Testing middlewares parameter
test('middlewares params', t => {
  for (const input of mi) {
    assert.throws(
      () => {
        const app = express()
        app.use(keepOrSkip(input, () => { }))
      },
      new KeepOrSkipError(ec.INVALID_MIDDLEWARES_PARAM.message)
    )
  }
})

// Testing predicate parameter
test('predicate params', t => {
  for (const input of pi) {
    assert.throws(
      () => {
        const app = express()
        app.use(keepOrSkip(() => { }, input))
      },
      new KeepOrSkipError(ec.INVALID_PREDICATE_PARAM.message)
    )
  }
})

function init (req, res, next) {
  req.middlewares = []
  next()
}

function setValue (number) {
  return function (req, res, next) {
    req.value = number
    next()
  }
}

function makeMiddleware (name) {
  return function middleware (req, res, next) {
    req.middlewares.push(name)
    next()
  }
}

function respond (req, res, next) {
  res.status(200).json(req.middlewares)
}

test('middleware execution sequence evaluating a request value', async done => {
  const app = express()
  const m1 = makeMiddleware('m1')
  const m2 = makeMiddleware('m2')
  const wm1 = keepOrSkip(m1, req => req.value < 0)
  const wm2 = keepOrSkip(m2, req => req.value >= 0)
  const seq = ['m1', 'm1', 'm2', 'm1', 'm2', 'm2', 'm1']

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

  const res = await request(app)
    .get('/')
    .set('Accept', 'application/json')

  assert.equal(res.status, 200)
  assert.equal(seq.toString(), res.body.toString())
})

test('middleware execution sequence evaluating a static value', async done => {
  const app = express()
  const m1 = makeMiddleware('m1')
  const m2 = makeMiddleware('m2')
  const wm1 = keepOrSkip(m1, () => true)
  const wm2 = keepOrSkip(m2, () => false)
  const seq = ['m1', 'm2', 'm1', 'm2', 'm1']

  app.get('/',
    init,
    wm1, // run
    m2, // run
    wm1, // run
    m2, // run
    wm2, // skip
    wm1, // run
    respond
  )

  const res = await request(app)
    .get('/')
    .set('Accept', 'application/json')

  assert.equal(res.status, 200)
  assert.equal(seq.toString(), res.body.toString())
})
