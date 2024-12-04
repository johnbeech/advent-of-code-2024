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

async function solveForFirstStar (input) {
  const letterGrid = input.split('\n').map(line => line.split(''))

  const letterMap = letterGrid.reduce((map, line, y) => {
    line.forEach((letter, x) => {
      map[`${x},${y}`] = { letter, x, y }
    })
    return map
  }, {})

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
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
