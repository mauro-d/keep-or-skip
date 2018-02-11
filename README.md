# keep-or-skip (WIP)

## Dynamically execute or skip express middlewares

This wrapper allows you to choose one or more middlewares to execute based on a
certain condition. The aforementioned condition could be, for instance, a
specific request value.

## Installation

You can choose one of the following methods:

### First method

In your package.json add the following item to get the latest available version:

```json
"keep-or-skip": "*"
```

or, if you need a specific version, just add an item like the following,
specifying the version number:

```json
"keep-or-skip": "1.0.0"
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
keepOrSkip(maybeObj, predicate)
```

- `maybeObj` {Object} an object whose fields are each an array containing one or
more express middlewares.
- `predicate` {Function} a middleware that returns a `maybeObj`'s property 
representing the set of middlewares to use.
- **returns** an array of wrapped middlewares representing all the middlewares
cointained in the `maybeObj` param which are executed or skipped based on the
value returned by the `predicate` param.

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

let maybeObj = {
    1: [m2, m1, m2],
    2: [m1, m2]
}

app.get('/random',
    setRandomValue,
    keepOrSkip(maybeObj, (req, res) => {
        if (req.random < 0) {
            // Execute the set of middlewares in maybeObj[1]
            return 1
        } else {
            // Execute the set of middlewares in maybeObj[2]
            return 2
        }
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