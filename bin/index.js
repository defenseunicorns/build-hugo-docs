#! /usr/bin/env node

import path from 'path'

import fs from 'fs/promises'

import { getUserInput } from '../src/cli.js'
import { getFilesFromDirectory } from '../src/fileUtils.js'
import convertFile from '../src/frontmatter.js'

const getLastPathValue = input => {
  return input.split('/'.slice(-1))
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
