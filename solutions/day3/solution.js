const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

// regex for mul(x,y) where x and y are integers
const mulRegex = /mul\((\d+),(\d+)\)/g

async function solveForFirstStar (input) {
  const matches = [...input.matchAll(mulRegex)]
  const multiplication = matches
    .map(match => match.slice(1)
      .map(Number))
    .map(([x, y]) => x * y)
  const solution = multiplication.reduce((acc, value) => acc + value, 0)

  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
