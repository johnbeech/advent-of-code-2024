const path = require('path')
const { read, write, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

async function solveForFirstStar (input) {
  const lines = input.split('\n')
  const levels = lines.map(line => line.trim().split(' ').map(Number))

  const scoredLevels = levels.map(scoreLevel)

  const numberOfSafeLevels = scoredLevels.filter(level => level.isLevelSafe).length
  const solution = numberOfSafeLevels

  await write(fromHere('output.txt'), scoredLevels.map(level => `${level.original} => ${level.isLevelSafe ? 'SAFE' : 'UNSAFE'}`).join('\n'))

  report('Expanded:', scoredLevels)
  report('Solution 1:', solution)
}

function scoreLevel (level) {
  const original = [...level]
  const sorted = level.sort((a, b) => a - b)
  const isAscending = sorted.join('') === original.join('')
  const isDescending = sorted.slice().reverse().join('') === original.join('')
  const maxDiff = original.reduce((acc, value, index) => {
    const nextValue = original[index + 1]
    if (nextValue === undefined) return acc
    const diff = Math.abs(value - nextValue)
    return diff > acc ? diff : acc
  }, 0)
  const minDiff = original.reduce((acc, value, index) => {
    const nextValue = original[index + 1]
    if (nextValue === undefined) return acc
    const diff = Math.abs(nextValue - value)
    return diff < acc ? diff : acc
  }, Infinity)

  const isDiffSafe = maxDiff <= 3 && minDiff >= 1
  const isLevelSafe = (isAscending || isDescending) && isDiffSafe
  return {
    original: original.join(' '),
    sorted: sorted.join(' '),
    reverse: sorted.slice().reverse().join(' '),
    isAscending,
    isDescending,
    minDiff,
    maxDiff,
    isDiffSafe,
    isLevelSafe
  }
}

async function solveForSecondStar (input) {
  const lines = input.split('\n')
  const levels = lines.map(line => line.trim().split(' ').map(Number))

  const expandedlevels = []
  levels.forEach(level => {
    // Remove one element from the level, and check if it's safe
    for (let i = 0; i < level.length; i++) {
      const modifiedLevel = [...level]
      modifiedLevel.splice(i, 1)
      expandedlevels.push({ level, modifiedLevel })
    }
  })

  const scoredLevels = expandedlevels.map(({ level, modifiedLevel }) => {
    const score = scoreLevel(modifiedLevel)
    return {
      ...score,
      original: level.join(' '),
      modified: modifiedLevel.join(' ')
    }
  })
  const indexOfSafeLevels = scoredLevels.reduce((acc, level, index) => {
    const isSafe = level.isLevelSafe
    const existing = acc[level.original] ?? 0
    acc[level.original] = isSafe ? existing + 1 : existing
    return acc
  }, {})

  const numberOfSafeLevels = Object.values(indexOfSafeLevels).filter(count => count >= 1).length
  const solution = numberOfSafeLevels

  report('Solution 2:', solution)
}

run()
