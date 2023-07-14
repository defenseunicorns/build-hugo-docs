#! /usr/bin/env node

import path from 'path'

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

const getLastPathValue = input => {
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

const getFilesForPaths = async searchPaths => {
  const files = await Promise.all(
    searchPaths.map(async searchPath => {
      const found = await getFilesFromDirectory(searchPath)
      return found.map(file => {
        const filePath = file.split('/')
        filePath.shift()

        const sectionPath = path.basename(searchPath)

        return { searchPath, sectionPath, filePath: filePath.join('/') }
      })
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

  const converted = await Promise.all(
    await files.map(async file => {
      const content = await convertFile(`${file.sectionPath}/${file.filePath}`)
      return { ...file, content }
    }),
  )

  try {
    await converted.map(async item => {
      const writePath = `${outdir}/${item.sectionPath}/${item.filePath}`
      await fs.mkdir(path.dirname(writePath), { recursive: true })
      await fs.writeFile(writePath, item.content)
      console.log(`Creating:  ${writePath}`)
    })
  } catch (err) {
    console.error(err)
  }
}

add()
