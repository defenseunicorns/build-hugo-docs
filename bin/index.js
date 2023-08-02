#! /usr/bin/env node

import fs from 'fs/promises'

import getUserInput from '../src/cli.js'
import { defineWritePath, getFilesForPaths } from '../src/fileUtils.js'
import transform from '../src/transform.js'

const add = async () => {
  try {
    const { paths, ignores, outdir } = getUserInput()

    const files = await getFilesForPaths(paths, ignores)

    const converted = await transform(files)

    await converted.map(async item => {
      const result = defineWritePath(outdir, item.sectionPath, item.filePath)

      const toFile = `${result.pathName}/${result.fileName}`

      await fs.mkdir(result.pathName, { recursive: true })
      await fs.writeFile(toFile, item.content)
      console.log(`Created: ${toFile}`)
    })
  } catch (err) {
    console.log(err, 0)
  }
}

add()
