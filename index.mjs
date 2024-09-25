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

import inputParser from './lib/helpers/input.mjs'
import makeMiddlewareHandlers from './lib/helpers/middleware.mjs'

/**
 * @param {(Function|Function[])} middlewares A single middleware function or
 * an array of middleware functions that should be conditionally applied.
 * @param {Function} predicate A function that returns a boolean value based on
 * the provided inputs. This function determines whether "middlewares" should be
 * executed. The predicate can use any relevant information from the request and
 * the response objects, or other factors. If the predicate does not return a
 * boolean value, "middlewares" will be skipped.
 * @returns {Function[]} An array of middlewares.
 * @version 1.0.5
 * @author Nicola Del Gobbo - Mauro Doganieri
 */
export default (middlewares, predicate) => {
  const parsedMiddlewares = inputParser(middlewares, predicate)
  const middlewareHandlers = makeMiddlewareHandlers(predicate)
  const predicateMiddleware = middlewareHandlers.predicate()
  const userMiddlwares = parsedMiddlewares.map(middlewareHandlers.user())
  return [predicateMiddleware].concat(userMiddlwares)
}
