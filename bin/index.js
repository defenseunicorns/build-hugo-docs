#! /usr/bin/env node

import fs from 'fs/promises'

import { getUserInput } from '../src/cli.js'
import { defineWritePath, getFileContents, getFilesForPaths } from '../src/fileUtils.js'
import { convertFile } from '../src/frontmatter.js'

const add = async () => {
  try {
    const { paths, ignores, outdir } = getUserInput()

    const files = await getFilesForPaths(paths, ignores)

    const converted = await Promise.all(
      await files.map(async file => {
        const fileContents = await getFileContents(file.filePath)
        const content = await convertFile(fileContents, file.filePath)
        return { ...file, content }
      }),
    )

    await converted.map(async item => {
      const result = defineWritePath(outdir, item.sectionPath, item.filePath)

      const toFile = `${result.pathName}/${result.fileName}`

      await fs.mkdir(result.pathName, { recursive: true })
      await fs.writeFile(toFile, item.content)
      console.log(`Created: ${toFile}`)
    })
  } catch (err) {
    console.error(err)
  }
}

add()
