const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('example.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

const directions = [
  { x: 0, y: -1 }, // North
  { x: 1, y: 0 }, // East
  { x: 0, y: 1 }, // South
  { x: -1, y: 0 } // West
]
const directionNames = ['North', 'East', 'South', 'West']

function walkGrid (grid, guard, onVisit) {
  const mapWidth = grid[0].length
  const mapHeight = grid.length

  while (guard.x >= 0 && guard.x < mapWidth && guard.y >= 0 && guard.y < mapHeight) {
    const next = guard.neighbors[guard.direction]
    if (!next) {
      report('Guard exited the map from', guard.x, ',', guard.y)
      break
    } else if (next.char === '#') {
      // Turn right
      guard.direction = (guard.direction + 1) % 4
      const newDirectionName = directionNames[guard.direction]
      console.log('Turning right to face', newDirectionName)
    } else {
      // Move forward
      guard.x = next.x
      guard.y = next.y
      guard.neighbors = next.neighbors
      next.visited = true
      onVisit(next)
      console.log('Moving forward to', next.x, ',', next.y)
    }
  }
}

function createMapFrom (input) {
  const grid = input.split('\n').map(line => line.split(''))
  const map = grid.reduce((map, line, y) => {
    line.forEach((char, x) => {
      map.set(`${x},${y}`, { char, x, y })
    })
    return map
  }, new Map())

  // Link all points to their neighbors
  map.forEach(point => {
    point.neighbors = directions.map(({ x, y }) => map.get(`${point.x + x},${point.y + y}`))
  })

  return { grid, map }
}

async function solveForFirstStar (input) {
  const { grid, map } = createMapFrom(input)

  // Find guard ^ facing north
  const guardStartLocation = [...map.values()].find(point => point.char === '^')
  const guard = {
    direction: 0,
    ...guardStartLocation
  }
  guardStartLocation.visited = true

  console.log('Guard:', guard)
  walkGrid(grid, guard, point => {
    console.log('Visited', point.x, ',', point.y, 'in direction', guard.direction)
  })

  // Count all visited locations
  const visitedLocations = [...map.values()].filter(location => location.visited)

  const solution = visitedLocations.length
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
