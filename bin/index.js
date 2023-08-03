#! /usr/bin/env node
/* eslint-disable no-console */

import fs from 'fs/promises'

import getUserInput from '../src/cli.js'
import { defineWritePath, getFilesForPath } from '../src/fileUtils.js'
import transform from '../src/transform.js'

const add = async () => {
  try {
    const mounts = getUserInput()
    await mounts.map(async mount => {
      const { source, target, ignores } = mount
      const files = await getFilesForPath(source, ignores)
      const converted = await transform(files)

      await converted.map(async item => {
        const result = defineWritePath(target, item.sectionPath, item.filePath)

        const toFile = `${result.pathName}/${result.fileName}`

        await fs.mkdir(result.pathName, { recursive: true })
        await fs.writeFile(toFile, item.content)
        console.log(`Created: ${toFile}`)
      })
    })
  } catch (err) {
    console.error(err, 0)
  }
}

add()
