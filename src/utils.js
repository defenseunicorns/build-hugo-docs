import path from 'path'

import fs from 'fs/promises'

export const getFilesFromDirectory = async directoryPath => {
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
