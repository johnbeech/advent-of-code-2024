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

async function solveForFirstStar (input) {
  const [rulesInput, pagesInput] = input.split('\n\n')
  const rules = rulesInput.split('\n').map(rule => {
    const [L, R] = rule.split('|').map(Number)
    return { L, R }
  })
  const pageUpdates = pagesInput.split('\n').map(line => {
    return line.split(',').map(Number)
  })

  report('Rules:', rules)
  report('Pages:', pageUpdates)

  const validPageUpdates = pageUpdates.filter(page => {
    return validatePage(page, rules)
  })

  report('Valid pages:', validPageUpdates)

  const middleNumberFromValidPages = validPageUpdates.map(page => page[page.length / 2 | 0])
  const sumOfMiddlePageNumbers = middleNumberFromValidPages.reduce((sum, number) => sum + number, 0)

  const solution = sumOfMiddlePageNumbers
  report('Solution 1:', solution)
}

async function solveForSecondStar (input) {
  const solution = 'UNSOLVED'
  report('Solution 2:', solution)
}

run()
