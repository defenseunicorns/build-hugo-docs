import path from 'path'

import { findUpSync } from 'find-up'
import fs from 'fs/promises'

const getStartingPath = (configFile = '.hugo-docs.yaml') => {
  const configPath = path.dirname(findUpSync(configFile))
  return configPath
  // return existsSync(configPath)
}

const isMarkdownFile = file => {
  const mdFiles = /\w+\.md$/
  return file.match(mdFiles)
}

const isDir = async (filePath = '') => {
  try {
    const stats = await fs.stat(filePath)
    return stats.isDirectory()
  } catch (err) {
    const error = `isDir(${filePath}): ${JSON.stringify(err, null, 2)}`
    throw new Error(error)
  }
}

const getFilesFromDirectory = async directoryPath => {
  try {
    const filesInDirectory = (await isDir(directoryPath)) ? await fs.readdir(directoryPath) : [directoryPath]

    const files = await Promise.all(
      filesInDirectory.map(async file => {
        const filePath = path.join(directoryPath, file)

        if (await isDir(filePath)) {
          return getFilesFromDirectory(filePath)
        } else if (isMarkdownFile(filePath)) {
          return filePath
        } else {
          return []
        }
      }),
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

const getFileList = async (searchPath, docsPath, ignorePaths) => {
  const files = isMarkdownFile(searchPath) ? [docsPath] : await getFilesFromDirectory(docsPath)
  return files.filter(file => {
    ignorePaths.find(el => file.match(el))
    return !ignorePaths.find(el => file.match(el))
  })
}

export const getFilesForPaths = async (searchPaths = [], ignorePaths = []) => {
  if (!Array.isArray(searchPaths) || searchPaths.length < 1) {
    if (searchPaths.length < 1) {
      throw new Error('Invalid number of search paths')
    }
    throw new TypeError(`Expected an array, but received a ${typeof searchPaths}`)
  }

  const files = await Promise.all(
    searchPaths.map(async searchPath => {
      const docsPath = `${getStartingPath()}/${searchPath}`

      const found = await getFileList(searchPath, docsPath, ignorePaths)

      return found.map(filePath => {
        const sectionPath = path.basename(docsPath)

        return { searchPath: docsPath, sectionPath, filePath }
      })
    }),
  )

  return await files.flat()
}

export const defineWritePath = (outdir, sectionPath, filePath) => {
  const fullPath = `${outdir}/${sectionPath}/${filePath}`

  const fromFileName = path.basename(filePath)
  const toFileName = fromFileName === 'index.md' ? '_index.md' : fromFileName

  const toPath = path.dirname(filePath).split(`/${sectionPath}/`)[1]

  return { pathName: `${outdir}/${sectionPath}/${toPath}`, fileName: `${toFileName}` }
}
