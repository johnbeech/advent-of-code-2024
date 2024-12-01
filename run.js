const { run } = require('promise-path')

const args = process.argv.slice(2)

const commands = {
  runSolution: async (solutionId) => {
    try {
      return require(`./solutions/${solutionId}/solution.js`)
    } catch (ex) {
      if (!solutionId) {
        console.error('No solution ID provided; please re-run with an argument, e.g.: npm start day1, or: node run day1')
      } else {
        await copyTemplate()
      }
    }
  },
  '--first-star': async (solutionId) => {
    const command = `git commit -am "Solve ${solutionId} for first star"`
    console.log('Running:', command)
    await run(command)
  },
  '--second-star': async (solutionId) => {
    const command = `git commit -am "Solve ${solutionId} for second star"`
    console.log('Running:', command)
    await run(command)
  }
}

async function start () {
  const solutionId = args.pop()
  const commandKey = args.pop()
  const command = commands[commandKey] ?? commands.runSolution

  if (!solutionId?.startsWith('day')) {
    console.error('Invalid solution ID provided; please re-run with an argument, e.g.: npm start day1, or: node run day1')
    return
  }

  try {
    await command(solutionId)
  } catch (ex) {
    console.error(`Unable to process command for '${solutionId}': ${ex?.message}`, { commandKey, solutionId })
  }
}

async function copyTemplate (solutionId) {
  try {
    await require('./copy-template.js')
    await commands.runSolution(solutionId)
    await run(`git commit -am "Create template for ${solutionId}"`)
  } catch (ex) {
    console.error(`Unable to run solution for '${solutionId}': ${ex}`, ex.stack)
  }
}

start()
