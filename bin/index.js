#! /usr/bin/env node

const chalk = require('chalk')
const boxen = require('boxen')
const utils = require('./utils')
const matter = require('gray-matter')
const fs = require('fs/promises')
const yargs = require('yargs')
const { exit } = require('process')
const path = require('path')

async function getFileCOntents(file) {
  try {
    return await fs.readFile(file, { encoding: 'utf8' })
  } catch (err) {
    console.error(err)
  }
}

const getFileName = input => {
  if (!input) {
    utils.showHelp()
    exit(1)
  }

  return input.split('/').slice(-1)
}

const getUserInput = () => {
  const usage = chalk.keyword('violet')('\nUsage: frontmatter <file>')

  const opts = yargs.usage(usage).help(true).argv
  return opts._[0]
}

const buildFrontMatter = (params = []) => {
  const delim = ['---\n']

  const fm = [...delim, ...params, ...delim]

  return fm.join('')
}

const getTitle = content => {
  // const h1 = /^'\s*#\s.+/
  const h1 = /^#\s.+/

  const header = content.find(el => el.match(h1))
  const title = header.replace('# ', '')
  const body = content.filter(el => !el.match(header))

  return [title, body]
}

const getFilesFromDirectory = async directoryPath => {
  const mdFiles = /\w+\.md$/
  const filesInDirectory = await fs.readdir(directoryPath)

  const files = await Promise.all(
    filesInDirectory.map(async file => {
      const filePath = path.join(directoryPath, file)
      const stats = await fs.stat(filePath)

      if (stats.isDirectory()) {
        return getFilesFromDirectory(filePath)
      } else {
        return filePath
      }
    }),
    // .filter(file => file.match(mdFiles)),
  )
  console.log(files)
  return files.filter(file => file.length) // return with empty arrays removed
}

const add = async () => {
  const fileData = await getFileCOntents(yargs.argv._[0])
  const fmData = matter(fileData)
  const inputFile = getUserInput()

  const fileContent = fmData.content.split('\n')

  const [title, body] = getTitle(fileContent)

  const frontMatterValues = [
    `title: ${title}\n`,
    fmData.data.sidebar_position ? `weight: ${fmData.data.sidebar_position}\n` : null,
  ]

  const content = [...buildFrontMatter(frontMatterValues), ...body.join('\n')]

  console.log(await getFilesFromDirectory('/Users/bryan/_git/du/zarf/docs'))

  try {
    await fs.writeFile(`${getFileName(inputFile)}.new`, content)
  } catch (err) {
    console.error(err)
  }
}

add()
