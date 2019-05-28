# keep-or-skip

## Dynamically execute or skip express middlewares

This wrapper allows you to choose one or more middlewares to execute based on a
certain condition. The aforementioned condition could be, for instance, a
specific request value.

<br/>

<div align="center">

[![Build Status](https://travis-ci.org/mauro-d/keep-or-skip.svg?branch=master)](https://travis-ci.org/mauro-d/keep-or-skip)
[![Build status](https://ci.appveyor.com/api/projects/status/m8de0gc397tcceq5?svg=true)](https://ci.appveyor.com/project/mauro-d/keep-or-skip)
[![NPM version](https://img.shields.io/npm/v/keep-or-skip.svg?style=flat)](https://www.npmjs.com/package/keep-or-skip)
[![NPM downloads](https://img.shields.io/npm/dm/keep-or-skip.svg?style=flat)](https://www.npmjs.com/package/keep-or-skip)

</div>

## Installation

You can choose one of the following methods:

### First method

In your *package.json* add the following item to get the latest available version:

```json
"keep-or-skip": "*"
```

or, if you need a specific version, just add an item like the following,
specifying the version number:

```json
"keep-or-skip": "1.0.4"
```

then launch this command:

```console
npm install
```

### Second method

Just launch this command:

```console
npm install keep-or-skip --save
```

## Type signature

```javascript
keepOrSkip(middlewares, predicate[, debug])
```

- `middlewares` &lt;Function&gt; | &lt;Function[]&gt; A middleware or an array of middlewares to handle dynamically.
- `predicate` &lt;Function&gt; A function that returns a *boolean* value, by which, one or more middlewares will be executed or skipped. This function takes as input two *optional* parameters, the `request` and the `response` objects. If the predicate doesn't return a boolean value, the middleware/middlewares contained in the `middlewares` parameter will be skipped.
- `debug` &lt;Boolean&gt; An *optional* boolean parameter to enable a warning log which notifies that the `predicate` parameter doesn't return a boolean value. **Default**: *false*.
- **returns** An array of middlewares.

If the parameters' type does not match with those required, an error will be
thrown. In pariticular, the error will be an instance of **KeepOrSkipError**.

## Examples

Consider the following example:

```javascript
const express = require('express')
const keepOrSkip = require('keep-or-skip')

const app = express()

function init(req, res, next) {
    const min = -5
    const max = 5
    req.value = Math.floor(Math.random() * (max - min) + min)
    req.middlewares = []
    next()
}

function m1(req, res, next) {
    req.middlewares.push('executed m1')
    next()
}

function m2(req, res, next) {
    req.middlewares.push('executed m2')
    next()
}

function respond(req, res, next) {
    res.status(200).json({
        value: req.value,
        middlewares: req.middlewares
    })
}

app.get('/',
    init,
    keepOrSkip([m2, m1, m2], req => req.value < 0 ? true : false),
    keepOrSkip([m1, m2], req => req.value >= 0 ? true : false),
    respond
)

app.listen(3000)
```

`http://localhost:3000` will produce the following `middlewares` array if the
random value is lower than 0:

```json
{
    "middlewares": [
        "executed m2",
        "executed m1",
        "executed m2"
    ]
}
```

otherwise it will produce:

```json
{
    "middlewares": [
        "executed m1",
        "executed m2"
    ]
}
```

## Debug

In the case the `predicate` parameter doesn't return a boolean value, the
middleware/middlewares contained in the `middlewares` parameter will be skipped.
In this situation, it's possible to log a warning by using the debug mode.

It's possible to activate the debug globally, directly on the imported module:

```javascript
const keepOrSkip = require('keep-or-skip')
keepOrSkip.debug(true)
```

the above code will set the debug mode to *true* every time `keepOrSkip` will be
used, unless otherwise specified at the time of use as shown in the following
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
