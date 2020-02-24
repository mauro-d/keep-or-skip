# keep-or-skip

## Dynamically execute or skip express middlewares

This wrapper allows you to choose one or more middlewares whose execution is based on a
certain condition. The aforementioned condition could be, for instance, a
specific *request* value.

<br/>

<div align="center">

[![Build Status](https://travis-ci.org/mauro-d/keep-or-skip.svg?branch=master)](https://travis-ci.org/mauro-d/keep-or-skip)
[![Build status](https://ci.appveyor.com/api/projects/status/m8de0gc397tcceq5?svg=true)](https://ci.appveyor.com/project/mauro-d/keep-or-skip)
[![NPM version](https://img.shields.io/npm/v/keep-or-skip.svg?style=flat)](https://www.npmjs.com/package/keep-or-skip)
[![NPM downloads](https://img.shields.io/npm/dm/keep-or-skip.svg?style=flat)](https://www.npmjs.com/package/keep-or-skip)

</div>

## Installation

```console
npm i keep-or-skip --save
```

## API

```javascript
keepOrSkip(middlewares, predicate[, debug])
```

- `middlewares` &lt;Function&gt; | &lt;Function[]&gt; A middleware or an array of middlewares to be handled dynamically.
- `predicate` &lt;Function&gt; A function returning a *boolean* value affecting the execution of the speciefied `middlewares`. This function takes as input two *optional* parameters, the `request` and the `response` objects. If the predicate does not return a boolean value, `middlewares` will be skipped.
- `debug` &lt;Boolean&gt; An *optional* boolean parameter enabling a warning log which notifies whether `predicate` returned a boolean value. **Default**: *false*.
- **returns** An array of middlewares.

If the parameters' type does not match with those required, an error will be
thrown. In pariticular, the error will be an instance of **KeepOrSkipError**.

## Example

Consider the following example:

```javascript
const express = require('express')
const keepOrSkip = require('keep-or-skip')

const app = express()

function setValue(req, res, next) {
    req.value = 1
    next()
}

function middlewareOne(req, res, next) {
    req.message = 'Hi from middlewareOne'
    next()
}

function middlewareTwo(req, res, next) {
    req.message = 'Hi from middlewareTwo'
    next()
}

function respond(req, res, next) {
    res.status(200).json({
        message: req.message
    })
}

const maybeMiddlewareOne = keepOrSkip(middlewareOne, req => req.value < 0)
const maybeMiddlewareTwo = keepOrSkip(middlewareTwo, req => req.value >= 0)

app.get('/',
    setValue,
    maybeMiddlewareOne,
    maybeMiddlewareTwo,
    respond
)

app.listen(3000)
```

`http://localhost:3000` will produce the following result, `middlewareOne` is
skipped and `middlewareTwo` is executed:

```json
{
    "message": "Hi from middlewareTwo"
}
```

## Debug

In case `predicate` does not return a boolean value, `middlewares` will be skipped.
In this situation it's possible to log a warning by using the debug mode.

It's possible to activate the debug globally, directly on the imported module:

```javascript
const keepOrSkip = require('keep-or-skip')
keepOrSkip.debug(true)
```

the above code sets the debug mode to *true* every time `keepOrSkip` is
used unless otherwise specified in the single calls as shown in the following
example:

```javascript
const keepOrSkip = require('keep-or-skip')

// Set debug mode globally.
keepOrSkip.debug(true)

/**
 * Specifying the debug parameter at the time of use will overwrite the global debug variable.
 */

keepOrSkip(myMiddlewares, myPredicate, false) // Debug OFF.

keepOrSkip(myMiddlewares, myPredicate) // Debug ON because of the global debug variable.
```
