const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

// NESW
const neighboringDirections = [
  { x: 0, y: -1 },
  { x: 1, y: 0 },
  { x: 0, y: 1 },
  { x: -1, y: 0 }
]

function pathTopographicMap (input) {
  const map = input.split('\n').map((line) => line.split(''))
  const topographicMap = {}
  for (let y = 0; y < map.length; y++) {
    for (let x = 0; x < map[y].length; x++) {
      const value = Number(map[y][x])
      const cell = { x, y, value: Number.isNaN(value) ? '.' : value, neighbors: [] }
      topographicMap[`${x},${y}`] = cell
    }
  }

  // Connect neighbors
  Object.values(topographicMap).forEach((cell) => {
    neighboringDirections.forEach((direction) => {
      const neighbor = topographicMap[`${cell.x + direction.x},${cell.y + direction.y}`]
      if (neighbor) {
        cell.neighbors.push(neighbor)
      }
    })
  })

  const width = map[0].length
  const height = map.length

  return { topographicMap, width, height }
}

function printGrid (width, height, cellCallback) {
  for (let y = 0; y < height; y++) {
    const row = []
    for (let x = 0; x < width; x++) {
      row.push(cellCallback(x, y))
    }
    console.log(row.join(''))
  }
}

function findTrails (topographicMap, trackVisits = true) {
  const zeroStarts = Object.values(topographicMap).filter((cell) => cell.value === 0)

  report('Zero starts:', zeroStarts.length)
  // Find all paths ascending from 0 to 9 for each zero start
  // Including multiple paths from the same start
  const trails = zeroStarts.map((start) => {
    const pathsFromStart = []
    const visited = {}
    const activePaths = [{ x: start.x, y: start.y, path: [start] }]
    while (activePaths.length > 0) {
      const activePath = activePaths.shift()
      const cell = topographicMap[`${activePath.x},${activePath.y}`]
      if (cell.value === 9) {
        const start = activePath.path[0]
        const end = activePath.path[activePath.path.length - 1]
        console.log('Found path to summit', [start.x, start.y].join(','), [end.x, end.y].join(','), activePath.path.map((cell) => cell.value).join(''))
        pathsFromStart.push(activePath.path)
      } else {
        const branches = trackVisits ? cell.neighbors.filter((neighbor) => neighbor.value === cell.value + 1 && !visited[`${neighbor.x},${neighbor.y}`]) : cell.neighbors.filter((neighbor) => neighbor.value === cell.value + 1)
        if (branches.length > 0) {
          branches.forEach((branch) => {
            visited[`${branch.x},${branch.y}`] = true
            activePaths.push({ x: branch.x, y: branch.y, path: [...activePath.path, branch] })
          })
        } else {
          // Dead end
          console.log('Dead end', activePath.path[0], activePath.path.map((cell) => cell.value).join(''))
        }
      }
    }
    console.log('Paths from start', pathsFromStart, pathsFromStart.length)
    return pathsFromStart
  }).filter(Boolean).flat()

  return trails
}

function findTrailheads (trails) {
  // Find trailheads - locations that start multiple trails from 0
  const trailheads = {}
  trails.forEach((trail) => {
    if (trail.length > 0) {
      const trailhead = trailheads[`${trail[0].x},${trail[0].y}`] ?? {
        count: 0,
        trails: []
      }
      trailhead.count++
      trailhead.trails.push(trail)
      trailheads[`${trail[0].x},${trail[0].y}`] = trailhead
    }
  })

  return trailheads
}

function findTrailheadsAndCountDistinctRoutes (trails) {
  // Find trailheads - locations that start multiple trails from 0
  const trailheads = {}
  trails.forEach((trail) => {
    if (trail.length > 0) {
      const trailhead = trailheads[`${trail[0].x},${trail[0].y}`] ?? {
        count: 0,
        trails: []
      }
      trailhead.count++
      trailhead.trails.push(trail)
      trailheads[`${trail[0].x},${trail[0].y}`] = trailhead
    }
  })

  return trailheads
}

function markLocations (locations, topographicMap) {
  const marked = {}
  locations.forEach((location) => {
    marked[`${location.x},${location.y}`] = location
  })
  return marked
}

async function solveForFirstStar (input) {
  const { topographicMap, width, height } = pathTopographicMap(input)

  report('Topography:', Object.values(topographicMap).length, 'tiles', { width, height })

  const trails = findTrails(topographicMap, true)
  report('Trails:', trails.length)

  const trailheads = findTrailheadsAndCountDistinctRoutes(trails)
  report('Trailheads:', Object.values(trailheads).length)

  markLocations(Object.values(trailheads), topographicMap)

  const solution = Object.values(trailheads).reduce((solution, trailhead) => {
    return solution + trailhead.count
  }, 0)

  printGrid(width, height, (x, y) => {
    // const cell = topographicMap[`${x},${y}`]
    const trailhead = trailheads[`${x},${y}`]
    if (trailhead) {
      return trailhead.count
    }
    return '.'
  })

  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const { topographicMap, width, height } = pathTopographicMap(input)

  report('Topography:', Object.values(topographicMap).length, 'tiles', { width, height })

  const trails = findTrails(topographicMap, false)
  report('Trails:', trails.length)

  const trailheads = findTrailheads(trails)
  report('Trailheads:', Object.values(trailheads).length)

  // Score trail heads by how many distinct paths they can take to summits
  Object.values(trailheads).forEach((trailhead) => {
    trailhead.score = trailhead.trails.length
  })

  printGrid(width, height, (x, y) => {
    // const cell = topographicMap[`${x},${y}`]
    const trailhead = trailheads[`${x},${y}`]
    if (trailhead) {
      return trailhead.count
    }
    return '.'
  })

  const solution = Object.values(trailheads).reduce((solution, trailhead) => {
    return solution + trailhead.score
  }, 0)
  report('Solution 2:', solution)
}

run()
