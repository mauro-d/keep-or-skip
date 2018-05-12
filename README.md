# keep-or-skip

## Dynamically execute or skip express middlewares

This wrapper allows you to choose one or more middlewares to execute based on a
certain condition. The aforementioned condition could be, for instance, a
specific request value.

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
"keep-or-skip": "1.0.1"
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

Consider the following example(all the middlewares defined have demonstration
purposes only):

```javascript
const express = require('express')
const keepOrSkip = require('keep-or-skip')

function m1(req, res, next) {
    if (!req.middlewares) {
        req.middlewares = []
    }
    req.middlewares.push('executed m1')
    next()
}

function m2(req, res, next) {
    if (!req.middlewares) {
        req.middlewares = []
    }
    req.middlewares.push('executed m2')
    next()
}

function respond(req, res, next) {
    res.status(200).json({
        middlewares: req.middlewares
    })
}

function setRandomValue(req, res, next) {
    var max = 5
    var min = -5
    req.random = Math.random() * (max - min) + min
    next()
}

app.get('/random',
    setRandomValue,
    keepOrSkip([m2, m1, m2], (req, res) => {
        if (req.random < 0) {
            // Execute [m2, m1, m2]
            return true
        }
        // Skip [m2, m1, m2]
        return false
    }),
    keepOrSkip([m1, m2], (req, res) => {
        if (req.random >= 0) {
            // Execute [m1, m2]
            return true
        }
        // Skip [m1, m2]
        return false
    }),
    respond
)

app.listen(3000)
```

`http://localhost:3000/random` will produce the following result if the random
value is lower than 0:

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