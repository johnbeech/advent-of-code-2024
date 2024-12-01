const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

async function solveForFirstStar (input) {
  const numberPairs = input.split('\n').map((line) => {
    return line.split(' ').filter(n => n).map(Number)
  })

  const leftList = numberPairs.map(([left, right]) => left).sort()
  const rightList = numberPairs.map(([left, right]) => right).sort()

  report('Left:', leftList)
  report('Right:', rightList)

  const distances = []
  while (leftList.length > 0) {
    const left = leftList.shift()
    const right = rightList.shift()

    const distance = Math.abs(left - right)
    report('Pair:', left, right, distance)
    distances.push(distance)
  }

  const sumOfDistances = distances.reduce((sum, distance) => sum + distance, 0)

  const solution = sumOfDistances
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const numberPairs = input.split('\n').map((line) => {
    return line.split(' ').filter(n => n).map(Number)
  })

  const leftList = numberPairs.map(([left, right]) => left).sort()
  const rightList = numberPairs.map(([left, right]) => right).sort()

  const similiarityScores = leftList.map((left, index) => {
    const countInRight = rightList.filter(right => right === left).length
    return left * countInRight
  })

  const sumOfSimiliarityScores = similiarityScores.reduce((sum, score) => sum + score, 0)

  const solution = sumOfSimiliarityScores
  report('Solution 2:', solution)
}

run()
