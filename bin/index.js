#! /usr/bin/env node

const chalk = require('chalk')
const boxen = require('boxen')
const utils = require('./utils')
const matter = require('gray-matter')
const fs = require('fs/promises')
const yargs = require('yargs')
const { exit } = require('process')

async function getFileCOntents(file) {
  try {
    return await fs.readFile(file, { encoding: 'utf8' })
  } catch (err) {
    console.log(err)
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

  console.log(params)

  const fm = [...delim, ...params, ...delim]

  return fm.join('')
}

const getTitle = content => {
  // const h1 = /^'\s*#\s.+/
  const h1 = /^#\s.+/

  const title = content.find(el => el.match(h1)).replace('# ', '')
  const body = content.filter(el => !el.match(h1))

  return [title, body]
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

  try {
    await fs.writeFile(`${getFileName(inputFile)}.new`, content)
  } catch (err) {
    console.log(err)
  }
}

add()
