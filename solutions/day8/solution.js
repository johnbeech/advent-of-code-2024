const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

function printGridInLayers (maps, bounds) {
  const grid = Array.from({ length: bounds.height }, () => Array.from({ length: bounds.width }, () => '.'))
  for (const map of maps) {
    for (const location of map.values()) {
      grid[location.y][location.x] = location.value
    }
  }
  console.log(grid.map(row => row.join('')).join('\n'))
}

function parseMap (input) {
  const grid = input.split('\n').map(line => line.split(''))
  // map x,y locations to objects with x,y, and value
  const map = grid.reduce((map, row, y) => {
    row.forEach((value, x) => {
      map.set(`${x},${y}`, { x, y, value })
    })
    return map
  }, new Map())

  const bounds = {
    width: grid[0].length,
    height: grid.length
  }

  return { map, bounds }
}

function findAntennae (map) {
  const antennae = [...map.values()].filter(({ value }) => value !== '.')
  // Group antennae by their value
  const groups = antennae.reduce((groups, location) => {
    if (!groups[location.value]) groups[location.value] = []
    groups[location.value].push(location)
    return groups
  }, {})

  // Calculate all vectors between combinations of antennae in each group
  const vectors = Object.values(groups).map(group => {
    return group.map((a, i) => {
      return group.slice(i + 1).map(b => {
        return {
          a,
          b,
          dx: b.x - a.x,
          dy: b.y - a.y
        }
      })
    }).flat()
  }).flat()

  return { antennae, groups, vectors }
}

async function solveForFirstStar (input) {
  const { map, bounds } = parseMap(input)
  const { antennae, groups, vectors } = findAntennae(map)

  report('Bounds:', bounds)
  report('Antennae:', antennae)
  report('Groups', groups)
  report('Vectors:', vectors)

  // For each vector, generate two antinodes and store them in a new map
  // Map has the same bounds as the original map; so ignore any antinode that is out of bounds
  const antinodes = vectors.reduce((antinodes, { a, dx, dy }) => {
    const anode = { x: a.x + dx * 2, y: a.y + dy * 2, value: '#' }
    const bnode = { x: a.x - dx * 1, y: a.y - dy * 1, value: '#' }
    if (anode.x >= 0 && anode.x < bounds.width && anode.y >= 0 && anode.y < bounds.height) { antinodes.set(`${anode.x},${anode.y}`, anode) }
    if (bnode.x >= 0 && bnode.x < bounds.width && bnode.y >= 0 && bnode.y < bounds.height) { antinodes.set(`${bnode.x},${bnode.y}`, bnode) }
    return antinodes
  }, new Map())

  printGridInLayers([map, antinodes], bounds)

  // Count of unique antinode locations
  const solution = antinodes.size
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
