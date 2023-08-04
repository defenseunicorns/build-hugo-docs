import { findUpSync } from 'find-up'
import fs from 'fs/promises'
import path from 'path'

const findRootPath = (configFile = '.hugo-docs.yaml') => {
  const configPath = path.dirname(findUpSync(configFile))
  return configPath
}

const isMarkdownFile = file => file.match(/\w+\.md$/)

const configToIndex = file => file.replace('_category_.json', 'index.md')

const isDocusaurusConfig = file => file.match('_category_.json')

const isDir = async (filePath = '') => {
  try {
    const stats = await fs.stat(filePath)
    return stats.isDirectory()
  } catch (err) {
    const error = `isDir(${filePath}): ${JSON.stringify(err, null, 2)}:${stats}`
    throw new Error(error)
  }
}

const findFilesInPath = async directoryPath => {
  const filesInDirectory = (await isDir(directoryPath)) ? await fs.readdir(directoryPath) : [directoryPath]

  const files = await Promise.all(
    filesInDirectory.map(async file => {
      const filePath = path.join(directoryPath, file)

      if (await isDir(filePath)) {
        return findFilesInPath(filePath)
      }
      if (isMarkdownFile(filePath)) {
        return filePath
      }
      if (isDocusaurusConfig(filePath)) {
        return configToIndex(filePath)
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

const removeIgnoredPaths = (files, ignorePaths) =>
  files.filter(file => {
    ignorePaths.find(el => file.match(el))
    return !ignorePaths.find(el => file.match(el))
  })

const getFileList = async (searchPath, docsPath, ignorePaths) => {
  const files =
    isMarkdownFile(searchPath) || isDocusaurusConfig(searchPath) ? [docsPath] : await findFilesInPath(docsPath)

  return removeIgnoredPaths(files, ignorePaths)
}

/**
 *
 * @param {string[]} searchPath
 * @param {string[]} ignorePaths
 * @returns {Promise<{{searchPath: string, sectionPath: string, filePath: string}}>}
 */
export const getDocumentationFiles = async (searchPath = '', ignorePaths = []) => {
  const docsPath = `${findRootPath()}/${searchPath}`

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

  const pathArr = path.dirname(filePath).split('/')
  const sectionIdx = pathArr.findIndex(el => el === sectionPath)
  const pathName = `${outdir}/${pathArr.slice(sectionIdx).join('/')}`

  return { pathName, fileName: `${toFileName}` }
}
