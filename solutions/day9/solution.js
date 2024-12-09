const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

// Characters 0-9, a-z, A-Z
const idSymbols = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

function parseDiskMap (input) {
  const numbers = input.split('').map(Number).reverse()
  const blocks = []
  const files = []
  while (numbers.length > 0) {
    const fileSize = numbers.pop()
    const freeSpace = numbers.pop()
    const file = { id: files.length, size: fileSize }
    files.push(file)
    blocks.push(file)
    if (freeSpace !== undefined) {
      const space = { size: freeSpace }
      blocks.push(space)
    }
  }
  // Expand memory filling with an object reference in cell
  const memory = []
  blocks.forEach((block) => {
    for (let i = 0; i < block.size; i++) {
      memory.push({ ...block, size: 1 })
    }
  })

  const mapString = createMapString(memory)

  return { memory, blocks, mapString }
}

function createMapString (memory) {
  return memory.map((block) => {
    return block.id !== undefined ? (idSymbols[block.id % idSymbols.length] ?? '#') : '.'
  }).join('')
}

async function solveForFirstStar (input) {
  const diskMap = parseDiskMap(input)

  const { memory } = diskMap

  report('Disk map:', diskMap)

  const freeMemory = memory.filter((block) => block.id === undefined)
  const usedMemory = memory.filter((block) => block.id !== undefined)

  console.log('Free memory:', freeMemory)
  console.log('Used memory:', usedMemory)

  let gapsLeft = true
  let iterations = 0
  while (gapsLeft === true) {
    const block = freeMemory.shift()
    // reassign the last used memory block to the free block
    const lastUsed = usedMemory.pop()
    block.id = lastUsed.id
    lastUsed.id = undefined

    // index of first free block
    const firstFree = memory.findIndex((block) => block.id === undefined)
    // index of last used block
    gapsLeft = firstFree < usedMemory.length || firstFree < memory.length - [...memory].reverse().findIndex((block) => block.id !== undefined)

    iterations++
    if (iterations % 1000 === 0) {
      report('Iteration:', iterations, 'First free:', firstFree, usedMemory.length)
    }
  }

  const updatedMapString = createMapString(memory)
  report('Updated map:', updatedMapString)

  const checksums = memory.filter((block) => block.id !== undefined).map((block, index) => {
    return block.id * index
  })
  const checksum = checksums.reduce((acc, val) => acc + val, 0)
  const solution = checksum

  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
