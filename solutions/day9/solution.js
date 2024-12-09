const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

// Characters 0-9, a-z, A-Z
const idSymbols = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ'

async function run () {
  const input = (await read(fromHere('example.txt'), 'utf8')).trim()

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

function expandBlocksToMemory (blocks) {
  // Expand memory to print the map
  const memory = []
  blocks.forEach((block) => {
    for (let i = 0; i < block.size; i++) {
      memory.push({ ...block, size: 1 })
    }
  })
  return memory
}

async function solveForSecondStar (input) {
  // Move blocks instead of individual cells
  const diskMap = parseDiskMap(input)

  const { blocks } = diskMap
  const usedBlocks = blocks.filter((block) => block.id !== undefined)
  const freeBlocks = blocks.filter((block) => block.id === undefined)

  report('Starting map:', diskMap.mapString)

  const remappedBlocks = [...blocks]
  const unmovedBlocks = [...usedBlocks]
  while (unmovedBlocks.length > 0) {
    const block = unmovedBlocks.pop()
    // Find the first free block large enough to hold the block
    const freeBlock = freeBlocks.find((freeBlock) => freeBlock.size >= block.size)
    if (freeBlock === undefined) {
      report('No free block large enough for block:', block)
      block.unmovedCount = block.unmovedCount === undefined ? 1 : block.unmovedCount + 1
      if (block.unmovedCount > 5) {
        report('Giving up on block:', block)
        break
      } else {
        unmovedBlocks.unshift(block)
      }
    } else {
      // Remove the block from the remapped blocks
      const blockIndex = remappedBlocks.indexOf(block)
      remappedBlocks.splice(blockIndex, 1)
      block.moved = true

      // Reduce the size of the free block
      freeBlock.size -= block.size

      // Insert an empty free block after the moved block
      const emptyBlock = { size: block.size }
      remappedBlocks.splice(blockIndex, 0, emptyBlock)

      // Move the block into the location before the free block
      const index = remappedBlocks.indexOf(freeBlock)
      remappedBlocks.splice(index, 0, block)

      // Join adjacent free blocks if possible
      let nextBlock; let scanIndex = 0
      do {
        const currentBlock = remappedBlocks[scanIndex]
        nextBlock = remappedBlocks[scanIndex + 1]
        if (currentBlock.id === undefined && nextBlock !== undefined && nextBlock.id === undefined) {
          currentBlock.size += nextBlock.size
          remappedBlocks.splice(scanIndex + 1, 1)
        } else {
          scanIndex++
        }
      } while (nextBlock !== undefined && nextBlock.id === undefined)

      const memory = expandBlocksToMemory(remappedBlocks)
      const updatedMapString = createMapString(memory)
      report('Updated map:', updatedMapString)
    }
  }

  // Calculate checksum
  const checksums = blocks.filter((block) => block.id !== undefined).map((block, index) => {
    let sum = 0
    for (let i = 0; i < block.size; i++) {
      sum += block.id * (index + i)
    }
    return sum
  })
  const checksum = checksums.reduce((acc, val) => acc + val, 0)
  const solution = checksum
  report('Solution 2:', solution)
}

run()
