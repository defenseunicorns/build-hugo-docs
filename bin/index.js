#! /usr/bin/env node

import fs from 'fs/promises'

import { defineWritePath, getFileContents, getFilesForPaths } from '../src/fileUtils.js'
import convertFile from '../src/frontmatter.js'
import getUserInput from '../src/cli.js'
import log from '../src/logger.js'

const add = async () => {
  try {
    const { paths, ignores, outdir } = getUserInput()

    const files = await getFilesForPaths(paths, ignores)

    const converted = await Promise.all(
      await files.map(async file => {
        const fileContents = await getFileContents(file.filePath)
        const { frontMatter, body } = await convertFile(fileContents, file.filePath)

        const content = `${frontMatter}${body.join('\n')}`

        return { ...file, content }
      }),
    )

    await converted.map(async item => {
      const result = defineWritePath(outdir, item.sectionPath, item.filePath)

      const toFile = `${result.pathName}/${result.fileName}`

      await fs.mkdir(result.pathName, { recursive: true })
      await fs.writeFile(toFile, item.content)
      log(`Created: ${toFile}`)
    })
  } catch (err) {
    log(err, 0)
  }
}

add()
