# keep-or-skip

## Overview

**`keep-or-skip`** is an utility for Express.js that conditionally executes one 
or more middleware functions based on dynamic conditions. For instance, this 
could be useful to execute middleware if a specific request parameter meets a 
certain condition.

<div align="center">

[![CI](https://github.com/mauro-d/keep-or-skip/workflows/ci/badge.svg)](https://github.com/mauro-d/keep-or-skip/actions/workflows/ci.yml)
[![NPM version](https://img.shields.io/npm/v/keep-or-skip.svg?style=flat)](https://www.npmjs.com/package/keep-or-skip)
[![NPM downloads](https://img.shields.io/npm/dm/keep-or-skip.svg?style=flat)](https://www.npmjs.com/package/keep-or-skip)

</div>

## Installation

```bash
npm i keep-or-skip
```

## API

```javascript
keepOrSkip(middlewares, predicate)
```

**Parameters**:

- `middlewares` *\<Function\> | \<Function[]\>* a single middleware function or 
an array of middleware functions that should be conditionally applied.

- `predicate` *\<Function\>* a function that returns a boolean value based on 
the provided inputs. This function determines whether `middlewares` should be 
executed. The predicate can use any relevant information from the `request` and 
the `response` objects, or other factors. If the predicate does not return a 
boolean value, `middlewares` will be skipped.

**Returns**: *\<Function\> | \<Function[]\>* an array of middlewares.

## Usage

### Basic Example

Here's a simple example using `keep-or-skip` in an Express application:

```javascript
const express = require('express')
const keepOrSkip = require('keep-or-skip')

const app = express()

function setRandomValue(req, res, next) {
    req.randomNumber = Math.floor(Math.random() * 100) // Generate a random number between 0 and 99
    next()
}

function isEven(req, res, next) {
    req.isEven = req.randomNumber % 2 === 0 // Determine if the number is even
    next()
}

function handleEven(req, res, next) {
    req.message = 'The number is even.'
    next()
}

function handleOdd(req, res, next) {
    req.message = 'The number is odd.'
    next()
}

function respond(req, res) {
    res.status(200).json({
        number: req.randomNumber,
        message: req.message
    })
}

const maybeHandleEven = keepOrSkip(handleEven, req => req.isEven)
const maybeHandleOdd = keepOrSkip(handleOdd, req => !req.isEven)

app.get('/random',
    setRandomValue,
    isEven,
    maybeHandleEven,
    maybeHandleOdd,
    respond
)

app.listen(3000, () => console.log('Server running on port 3000'))
```

#### Behavior

When accessing `http://localhost:3000/random`, a random number between 0 and 99 
is generated. Depending on whether the number is even or odd, either 
`handleEven` or `handleOdd` will be executed. The response will include the 
number and the corresponding message:

```json
{
    "number": 42,
    "message": "The number is even."
}
```

or

```json
{
    "number": 37,
    "message": "The number is odd."
}
```

## Error Handling

`KeepOrSkipError` is thrown when the parameters passed to `keepOrSkip` are invalid.
