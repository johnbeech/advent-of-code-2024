const path = require('path')
const { read, position } = require('promise-path')
const fromHere = position(__dirname)
const report = (...messages) => console.log(`[${require(fromHere('../../package.json')).logName} / ${__dirname.split(path.sep).pop()}]`, ...messages)

async function run () {
  const input = (await read(fromHere('input.txt'), 'utf8')).trim()

  await solveForFirstStar(input)
  await solveForSecondStar(input)
}

function validatePage (page, rules) {
  // Check if page conforms to the rules
  // Page A must exist before Page B if present
  return rules.every(rule => {
    const { L, R } = rule
    const pageA = page.indexOf(L)
    const pageB = page.indexOf(R)
    if (pageA === -1 || pageB === -1) {
      return true
    }
    return pageA < pageB
  })
}

function parseInput (input) {
  const [rulesInput, pagesInput] = input.split('\n\n')

  const rules = rulesInput.split('\n').map(rule => {
    const [L, R] = rule.split('|').map(Number)
    return { L, R }
  })

  const pageUpdates = pagesInput.split('\n').map(line => {
    return line.split(',').map(Number)
  })

  return { rules, pageUpdates }
}

async function solveForFirstStar (input) {
  const { rules, pageUpdates } = parseInput(input)
  report('Rules:', rules)
  report('Pages:', pageUpdates)

  const validPageUpdates = pageUpdates.filter(page => {
    return validatePage(page, rules)
  })

  report('Valid pages:', validPageUpdates.length)

  const middleNumberFromValidPages = validPageUpdates.map(page => page[page.length / 2 | 0])
  const sumOfMiddlePageNumbers = middleNumberFromValidPages.reduce((sum, number) => sum + number, 0)

  const solution = sumOfMiddlePageNumbers
  report('Solution 1:', solution)
}

function fixPageBasedOnRules (page, rules) {
  // Fix the page based on the rules
  // Page A must exist before Page B if present
  const fixedPage = page.slice()
  let changed = true
  console.log('Fixing page...', page.join(','))
  while (changed) {
    changed = false
    console.log('  Looping...', fixedPage.join(','))
    rules.forEach(rule => {
      const { L, R } = rule
      const pageA = fixedPage.indexOf(L)
      const pageB = fixedPage.indexOf(R)
      if (pageA === -1 || pageB === -1) {
        return
      }
      if (pageA > pageB) {
        fixedPage[pageA] = R
        fixedPage[pageB] = L
        changed = true
      }
    })
  }
  return fixedPage
}

async function solveForSecondStar (input) {
  const { rules, pageUpdates } = parseInput(input)

  const invalidPageUpdates = pageUpdates.filter(page => {
    return !validatePage(page, rules)
  })

  console.log('')
  report('Second Star')
  report('Invalid pages:', invalidPageUpdates.length)

  const fixedPages = invalidPageUpdates.map(page => {
    return fixPageBasedOnRules(page, rules)
  })

  report('Fixed pages:', fixedPages.length)

  const middleNumberFromValidPages = fixedPages.map(page => page[page.length / 2 | 0])
  const sumOfMiddlePageNumbers = middleNumberFromValidPages.reduce((sum, number) => sum + number, 0)

  const solution = sumOfMiddlePageNumbers
  report('Solution 2:', solution)
}

run()
