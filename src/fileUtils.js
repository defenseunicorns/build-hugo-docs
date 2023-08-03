import { findUpSync } from 'find-up'
import fs from 'fs/promises'
import path from 'path'

const getStartingPath = (configFile = '.hugo-docs.yaml') => {
  const configPath = path.dirname(findUpSync(configFile))
  return configPath
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
  const filesInDirectory = (await isDir(directoryPath)) ? await fs.readdir(directoryPath) : [directoryPath]

  const files = await Promise.all(
    filesInDirectory.map(async file => {
      const filePath = path.join(directoryPath, file)

      if (await isDir(filePath)) {
        return getFilesFromDirectory(filePath)
      }
      if (isMarkdownFile(filePath)) {
        return filePath
      }
      return []
    }),
  )
  return files.filter(file => file.length).flat() // return with empty arrays removed
}

/**
 *
 * @param {string} file
 * @returns {Promise<string>}
 */
export const getFileContents = async file => {
  try {
    return await fs.readFile(file, { encoding: 'utf8' })
  } catch (err) {
    throw new Error(`getFileContents(${file}) : ${err}`)
  }
}

const getFileList = async (searchPath, docsPath, ignorePaths) => {
  const files = isMarkdownFile(searchPath) ? [docsPath] : await getFilesFromDirectory(docsPath)
  return files.filter(file => {
    ignorePaths.find(el => file.match(el))
    return !ignorePaths.find(el => file.match(el))
  })
}

/**
 *
 * @param {string[]} searchPath
 * @param {string[]} ignorePaths
 * @returns {Promise<{{searchPath: string, sectionPath: string, filePath: string}}>}
 */
export const getFilesForPath = async (searchPath = '', ignorePaths = []) => {
  const docsPath = `${getStartingPath()}/${searchPath}`

  const found = await getFileList(searchPath, docsPath, ignorePaths)

  const files = found.map(filePath => {
    const sectionPath = path.basename(docsPath)

    return { searchPath: docsPath, sectionPath, filePath }
  })

  return files.flat()
}

export const defineWritePath = (outdir, sectionPath, filePath) => {
  const fromFileName = path.basename(filePath)
  const toFileName = fromFileName === 'index.md' ? '_index.md' : fromFileName

  // const toPath = path.dirname(filePath).split(`/${sectionPath}/`).slice(1).join('/')

  const pathArr = path.dirname(filePath).split('/')
  const sectionIdx = pathArr.findIndex(el => el === sectionPath)
  const pathName = `${outdir}/${pathArr.slice(sectionIdx).join('/')}`

  return { pathName, fileName: `${toFileName}` }
}
