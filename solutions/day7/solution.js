const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

function parseLine (line) {
  const [result, ...rest] = line.split(':')
  const numbers = String(rest).trim().split(' ').map(Number)
  return {
    result: Number(result),
    numbers
  }
}

function evaluateInstruction (instruction) {
  // For each value, either multiply or add it to the previous number
  // If a working number exceeds the result, break
  // If the final number matches the result, return true
  // Otherwise, return false
  const { result, numbers } = instruction

  // Make all combinations of * and + for the number sequence
  // For example, for [1, 2, 3], the combinations are:
  // [1, '+', 2, '+' 3]
  // [1, '+', 2, '*' 3]
  // [1, '*', 2, '+' 3]
  // [1, '*', 2, '*' 3]

  const combinations = []
  const operators = ['+', '*']
  const numberOfOperators = numbers.length - 1
  for (let i = 0; i < 2 ** numberOfOperators; i++) {
    const combination = []
    for (let j = 0; j < numberOfOperators; j++) {
      const operator = operators[(i >> j) & 1]
      combination.push(numbers[j], operator)
    }
    combination.push(numbers[numbers.length - 1])
    combinations.push(combination)
  }

  console.log('Combinations:', combinations.length)

  // Evaluate each combination
  for (const combination of combinations) {
    let workingNumber = combination[0]
    for (let i = 1; i < combination.length; i += 2) {
      const operator = combination[i]
      const number = combination[i + 1]
      if (operator === '+') {
        workingNumber += number
      } else if (operator === '*') {
        workingNumber *= number
      }
      if (workingNumber > result) {
        break
      }
    }
    if (workingNumber === result) {
      console.log('Found a match:', result, combination)
      return result
    }
  }
}

async function solveForFirstStar (input) {
  const instructions = input.split('\n').map(line => parseLine(line))

  const evaluations = instructions.map(evaluateInstruction).filter(Boolean)
  const solution = evaluations.reduce((sum, evaluation) => sum + evaluation, 0)

  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
