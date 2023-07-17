import path from 'path'

import { findUpSync } from 'find-up'
import fs from 'fs/promises'

const getStartingPath = (configFile = '.hugo-docs.yaml') => {
  const configPath = path.dirname(findUpSync(configFile))
  return configPath
  // return existsSync(configPath)
}

const isDirectory = async filePath => {
  const stats = await fs.stat(filePath)
  return stats.isDirectory()
}

const getFilesFromDirectory = async directoryPath => {
  const mdFiles = /\w+\.md$/

  try {
    const filesInDirectory = (await isDirectory(directoryPath)) ? await fs.readdir(directoryPath) : [directoryPath]

    const files = await Promise.all(
      filesInDirectory.map(async file => {
        const filePath = path.join(directoryPath, file)
        const stats = await fs.stat(filePath)

        if (stats.isDirectory()) {
          return getFilesFromDirectory(filePath)
        } else if (filePath.match(mdFiles)) {
          return filePath
        } else {
          return []
        }
      }),
      // .filter(file => file.match(mdFiles)),
    )
    return files.filter(file => file.length).flat() // return with empty arrays removed
  } catch (err) {
    console.error(err)
  }
}

export const getFileContents = async file => {
  try {
    return await fs.readFile(file, { encoding: 'utf8' })
  } catch (err) {
    console.error(err)
  }
}

export const getFilesForPaths = async searchPaths => {
  const files = await Promise.all(
    searchPaths.map(async searchPath => {
      const docsPath = `${getStartingPath()}/${searchPath}`

      const found = await getFilesFromDirectory(docsPath)
      return found.map(filePath => {
        const sectionPath = path.basename(docsPath)

        return { searchPath: docsPath, sectionPath, filePath }
      })
    }),
  )

  return await files.flat()
}

export const getFileWeight = fileName => {
  const weight = Number(path.basename(fileName).split('-')[0])
  return Number.isInteger(weight) ? weight : undefined
}
