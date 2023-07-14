import path from 'path'

import fs from 'fs/promises'

const getFilesFromDirectory = async directoryPath => {
  const mdFiles = /\w+\.md$/
  const filesInDirectory = await fs.readdir(directoryPath)

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

export const getFileWeight = fileName => {
  const weight = Number(path.basename(fileName).split('-')[0])
  return Number.isInteger(weight) ? weight : undefined
}
