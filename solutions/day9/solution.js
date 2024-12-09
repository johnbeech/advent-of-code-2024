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

  const checksums = memory.map((block, index) => {
    return block.id !== undefined ? block.id * index : 0
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
    // Skip if free block is after the block
    if (freeBlock !== undefined && remappedBlocks.indexOf(freeBlock) > remappedBlocks.indexOf(block)) {
      continue
    }
    if (freeBlock === undefined) {
      report('No free block large enough for block:', block)
      block.unmovedCount = block.unmovedCount === undefined ? 1 : block.unmovedCount + 1
      if (block.unmovedCount > 5) {
        report('Giving up on block:', block)
        break
      } else {
        // unmovedBlocks.unshift(block)
      }
    } else {
      report('Moving block:', block, 'to free block:', freeBlock)
      // Create a new block to splice in
      const newBlock = { ...block, size: block.size }
      // Find the block index of the free block
      const freeBlockIndex = remappedBlocks.findIndex((block) => block === freeBlock)
      // Remove the free block if it is empty
      if (freeBlock.size === 0) {
        remappedBlocks.splice(freeBlockIndex, 1)
      }
      // Insert the new block before the free block
      remappedBlocks.splice(freeBlockIndex, 0, newBlock)
      // Change the size of the free block
      freeBlock.size -= block.size
      // Change the original block to a free block
      block.id = undefined

      // Combine free blocks
      let i = 0
      while (i < remappedBlocks.length - 1) {
        const block = remappedBlocks[i]
        const nextBlock = remappedBlocks[i + 1]
        if (block.id === undefined && nextBlock.id === undefined) {
          block.size += nextBlock.size
          remappedBlocks.splice(i + 1, 1)
        } else {
          i++
        }
      }

      // Update free blocks
      freeBlocks.length = 0
      remappedBlocks.forEach((block) => {
        if (block.id === undefined) {
          freeBlocks.push(block)
        }
      })

      /*
      const memory = expandBlocksToMemory(remappedBlocks)
      const updatedMapString = createMapString(memory)
      report('Updated map:', updatedMapString)
      */
    }
  }

  // Calculate checksum
  const memory = expandBlocksToMemory(remappedBlocks)
  const checksums = memory.map((block, index) => {
    return block.id !== undefined ? block.id * index : 0
  })
  const checksum = checksums.reduce((acc, val) => acc + val, 0)
  const solution = checksum
  report('Solution 2:', solution)
}

run()
