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

const fnRegex = /(do|don't|mul)\((\d+)?,?(\d+)?\)/g

async function solveForSecondStar (input) {
  const instructions = [...input.matchAll(fnRegex)].map(match => {
    const [fn, x, y] = match.slice(1)
    return { fn, x: (x && Number(x)) || 0, y: (y && Number(y)) || 0 }
  }).filter(({ fn, x, y }) => {
    if (fn === 'mul') {
      return x !== undefined && y !== undefined
    }
    return true
  })

  report('Instructions:', instructions)

  const program = []
  let doEnabled = true
  while (instructions.length) {
    const instruction = instructions.shift()
    if (instruction.fn === 'do') {
      doEnabled = true
      program.push(instruction)
    } else if (instruction.fn === 'don\'t') {
      doEnabled = false
      program.push(instruction)
    } else if (instruction.fn === 'mul') {
      if (doEnabled) {
        program.push(instruction)
      }
    }
  }

  report('Program:', program)

  const solution = program
    .map(({ x, y }) => x * y)
    .reduce((acc, value) => acc + value, 0)

  report('Solution 2:', solution)
}

run()
