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
  { x: 0, y: -1 }, // North
  { x: 1, y: 0 }, // East
  { x: 0, y: 1 }, // South
  { x: -1, y: 0 } // West
]
// const directionNames = ['North', 'East', 'South', 'West']

function walkGrid (grid, guard, onVisit) {
  const mapWidth = grid[0].length
  const mapHeight = grid.length

  while (guard.x >= 0 && guard.x < mapWidth && guard.y >= 0 && guard.y < mapHeight) {
    const next = guard.neighbors[guard.direction]
    if (!next) {
      // console.log('Guard exited the map from', guard.x, ',', guard.y)
      break
    } else if (next.char === '#') {
      // Turn right
      guard.direction = (guard.direction + 1) % 4
      // const newDirectionName = directionNames[guard.direction]
      // console.log('Turning right to face', newDirectionName)
    } else {
      // Move forward
      guard.x = next.x
      guard.y = next.y
      guard.neighbors = next.neighbors
      next.visited = true
      // console.log('Moving forward to', next.x, ',', next.y)
      const exitEarly = onVisit(next)
      if (exitEarly) {
        break
      }
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

function locateGuard (map) {
  // Find guard ^ facing north
  const guardStartLocation = [...map.values()].find(point => point.char === '^')
  guardStartLocation.visited = true
  guardStartLocation.visits = {
    0: 1 // direction: count
  }
  return {
    direction: 0,
    ...guardStartLocation
  }
}

async function solveForFirstStar (input) {
  const { grid, map } = createMapFrom(input)

  const guard = locateGuard(map)

  console.log('Guard:', guard)
  walkGrid(grid, guard, location => {
    console.log('Visited', location.x, ',', location.y, 'in direction', guard.direction)
  })

  // Count all visited locations
  const visitedLocations = [...map.values()].filter(location => location.visited)

  printGrid(grid, map)

  const solution = visitedLocations.length
  report('Solution 1:', solution)
}

function printGrid (grid, map) {
  const result = grid.map((line, y) => line.map((char, x) => {
    const location = map.get(`${x},${y}`)
    if (location.modified) {
      return 'O'
    } else if (location.visited) {
      return 'x'
    } else {
      return char
    }
  }).join('')).join('\n')

  console.log(result)
}

async function solveForSecondStar (input) {
  const { grid, map } = createMapFrom(input)

  const guard = locateGuard(map)

  walkGrid(grid, guard, location => {
    location.visits = location.visits || {}
    location.visits[guard.direction] = (location.visits[guard.direction] || 0) + 1
  })

  // Find collidable locations that could generate a loop
  const collidableLocations = [...map.values()].filter(location => location.visits && Object.keys(location.visits).length > 0 && location.char === '.')

  // Walk each map and check if the guard is walking in a loop
  const loopingMaps = []

  let previousLocation
  const startTime = Date.now()
  while (collidableLocations.length > 0) {
    const iterationStart = Date.now()
    const location = collidableLocations.pop()
    if (collidableLocations.length % 100 === 0) {
      console.log('Checking for loop with changed location', location.x, ',', location.y, '...', collidableLocations.length, 'locations remaining')
    }

    // Reset the map efficiently
    map.forEach(point => {
      point.visited = false
      point.neighbors = directions.map(({ x, y }) => map.get(`${point.x + x},${point.y + y}`))
      point.visits = {}
    })

    if (previousLocation) {
      previousLocation.char = '.'
    }

    const changedLocation = map.get(`${location.x},${location.y}`)
    changedLocation.char = '#'

    const guard = locateGuard(map)
    let loopDetected = false
    walkGrid(grid, guard, location => {
      location.visits = location.visits || {}
      location.visits[guard.direction] = (location.visits[guard.direction] || 0) + 1
      // console.log('Visiting', location.x, ',', location.y, 'in direction', guard.direction, 'for the', location.visits[guard.direction], 'time')

      if (location.visits[guard.direction] > 1) {
        // console.log('Loop detected at', location.x, ',', location.y, '...iterations remaining:', collidableLocations.length)
        loopDetected = true
        return true
      }
    })

    if (loopDetected) {
      loopingMaps.push({ map, changedLocation })
    }

    previousLocation = changedLocation
    const iterationEnd = Date.now()
    if (collidableLocations.length % 100 === 0) {
      console.log('Iteration took', iterationEnd - iterationStart, 'ms')
    }
  }

  const endTime = Date.now()
  console.log('Loop detection took', endTime - startTime, 'ms')

  // Mark looping locations in the original map
  const originalMap = map
  loopingMaps.forEach(({ map, changedLocation }) => {
    const location = originalMap.get(`${changedLocation.x},${changedLocation.y}`)
    location.modified = true
  })

  printGrid(grid, originalMap)

  const solution = loopingMaps.length
  report('Solution 2:', solution)
}

run()
