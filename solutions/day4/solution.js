const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

const directions = [
  [-1, -1], [0, -1], [1, -1],
  [-1, 0], [1, 0],
  [-1, 1], [0, 1], [1, 1]
]

function parseInput (input) {
  const letterGrid = input.split('\n').map(line => line.split(''))
  const letterMap = letterGrid.reduce((map, line, y) => {
    line.forEach((letter, x) => {
      map[`${x},${y}`] = { letter, x, y }
    })
    return map
  }, {})
  return { letterGrid, letterMap }
}

async function solveForFirstStar (input) {
  const { letterMap } = parseInput(input)

  // looking for the word XMAS, find all Xs
  const searchWord = 'XMAS'
  const searchWordArray = searchWord.split('')
  const xPoints = Object.values(letterMap).filter(point => point.letter === searchWord.charAt(0))
  // count how many XMAS words are in the grid
  const xmasWords = []
  xPoints.forEach(point => {
    directions.forEach(direction => {
      const word = searchWordArray.map((letter, index) => {
        const x = point.x + direction[0] * index
        const y = point.y + direction[1] * index
        return letterMap[`${x},${y}`]?.letter === letter ? letter : '.'
      }).join('')
      if (word === searchWord) {
        xmasWords.push(word)
      }
    })
  })

  const grid = makeGridFromMap(letterMap)
  printGrid(grid)

  const solution = xmasWords.length
  report('Solution 1:', solution)
}

function makeGridFromMap (map) {
  const grid = []
  const keys = Object.keys(map)
  const xValues = keys.map(key => map[key].x)
  const yValues = keys.map(key => map[key].y)
  const xMin = Math.min(...xValues)
  const xMax = Math.max(...xValues)
  const yMin = Math.min(...yValues)
  const yMax = Math.max(...yValues)
  for (let y = yMin; y <= yMax; y++) {
    const line = []
    for (let x = xMin; x <= xMax; x++) {
      line.push(map[`${x},${y}`]?.letter || ' ')
    }
    grid.push(line)
  }
  return grid
}

function printGrid (grid) {
  grid.forEach(line => {
    report(line.join(''))
  })
}

async function solveForSecondStar (input) {
  // find A that are surrounded by exactly 2 Ms and 2 Ss in the shape of an X
  const xDirections = [
    [-1, -1], [1, -1],
    [-1, 1], [1, 1]
  ]
  const { letterMap } = parseInput(input)
  const aPoints = Object.values(letterMap).filter(point => point.letter === 'A')
  const aPointsWithSurroundings = aPoints.filter(point => {
    return xDirections.every(direction => {
      const surroundings = xDirections.map(dir => {
        const x = point.x + dir[0] + direction[0]
        const y = point.y + dir[1] + direction[1]
        return letterMap[`${x},${y}`]?.letter
      })
      const Ms = surroundings.filter(letter => letter === 'M').length
      const Ss = surroundings.filter(letter => letter === 'S').length
      const MsAreNotOpposite = !(surroundings[0] === 'M' && surroundings[3] === 'M') && !(surroundings[1] === 'M' && surroundings[2] === 'M')
      return Ms === 2 && Ss === 2 && MsAreNotOpposite
    })
  })

  const grid = makeGridFromMap(letterMap)
  printGrid(grid)

  const solution = aPointsWithSurroundings.length
  report('Solution 2:', solution)
}

run()
