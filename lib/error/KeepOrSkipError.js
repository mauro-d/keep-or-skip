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
 * KeepOrSkipError constructor
 * @constructs KeepOrSkipError
 * @param {string} msg Description message for the error
 * @inherits Error https://developer.mozilla.org/en/JavaScript/Reference/Global_Objects/Error
 */
function KeepOrSkipError (msg) {
  Error.call(this)
  if (Error.captureStackTrace) {
    Error.captureStackTrace(this)
  } else {
    this.stack = new Error().stack
  }
  this.message = msg
  this.name = 'KeepOrSkipError'
}

KeepOrSkipError.codes = {
  INVALID_MIDDLEWARES_PARAM: {
    code: 'INVALID_MIDDLEWARES_PARAM',
    message: 'The middlewares parameter must be a function or an array of' +
      ' functions. More info at: http://expressjs.com'
  },
  INVALID_PREDICATE_PARAM: {
    code: 'INVALID_PREDICATE_PARAM',
    message: 'The predicate parameter must be a function.'
  }
}

/*!
 * Inherits from Error
 */
KeepOrSkipError.prototype = Object.create(Error.prototype)
KeepOrSkipError.prototype.constructor = Error

/*!
 * Module exports
 */
module.exports = exports = KeepOrSkipError
