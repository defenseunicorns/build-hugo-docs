#! /usr/bin/env node

import { exit } from 'process'

import fs from 'fs/promises'
import matter from 'gray-matter'

import { getUserInput } from '../src/cli.js'
import { getFilesFromDirectory } from '../src/utils.js'

async function getFileContents(file) {
  try {
    return await fs.readFile(file, { encoding: 'utf8' })
  } catch (err) {
    console.error(err)
  }
}

const getFileName = input => {
  if (!input) {
    showHelp()
    exit(1)
  }

  return input.split('/'.slice(-1))
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

const getFilesForPaths = async paths => {
  const files = await Promise.all(
    paths.map(async path => {
      return await getFilesFromDirectory(path)
    }),
  )

  return await files.flat()
}

const convertFile = async inputFile => {
  const fileContents = await getFileContents(inputFile)
  const fmData = matter(fileContents)
  const fileBody = fmData.content.split('\n')

  const [title, body] = getTitle(fileBody)

  const frontMatterValues = [
    `title: ${title}\n`,
    fmData.data.sidebar_position ? `weight: ${fmData.data.sidebar_position}\n` : null,
  ]

  const frontMatter = buildFrontMatter(frontMatterValues)

  // return frontMatter
  return `${frontMatter}${body.join('\n')}`
}

const add = async () => {
  const { paths, outdir } = getUserInput()

  const files = await getFilesForPaths(paths)
  const converted = await convertFile(files[0])
  console.log(converted)

  exit()

  try {
    await fs.writeFile(`${getFileName(inputFile)}.new`, content)
  } catch (err) {
    console.error(err)
  }
}

add()
