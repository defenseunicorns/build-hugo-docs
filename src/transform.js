import { existsSync, writeFileSync } from 'fs'
import path from 'path'

import { getFileContents } from './fileUtils.js'
import convertFile, { formatFrontmatter } from './frontmatter.js'

const docusaurusConfig = async pathName => {
  const configPath = `${pathName}/_category_.json`

  const fileContents = await getFileContents(configPath)
  return fileContents
    ? JSON.parse(fileContents)
    : {
        position: undefined,
        label: undefined,
      }
}
export const addIndexMetadata = async (filePath, contents) => {
  if (path.basename(filePath) !== 'index.md') {
    return contents
  }

  const config = await docusaurusConfig(path.dirname(filePath))
  const headers = formatFrontmatter({ title: config.label, weight: config.position })

  return headers ? `${headers}\n\n${contents}` : contents
}

const addMissingIndexMDFile = async files => {
  //   path.basename(path[, suffix])
  // path.delimiter
  // path.dirname(path)

  files.forEach(async file => {
    if (file.filePath.match('index.md') && !existsSync(file.filePath))
      await writeFileSync(file.filePath, '', { flag: 'wx' })
  })

  // uniqPaths.forEach(el => {
  //   const indexFiles = files.filter(
  //     file => path.dirname(file.filePath) === el && path.basename(file.filePath) === 'index.md',
  //   )
  //   if (indexFiles.length() === 0) {
  //   }
  // })
}

/**
 *
 * @param {{filePath: string}[]} files
 * @returns {Promise<{filePath: string, content: string}>}
 */
const transform = async files => {
  await addMissingIndexMDFile(files)

  return Promise.all(
    files.map(async file => {
      let fileContents = await getFileContents(file.filePath)
      fileContents = await addIndexMetadata(file.filePath, fileContents)

      const { frontMatter, body } = await convertFile(fileContents, file.filePath)

      const content = `${frontMatter}${body.join('\n')}`

      return { filePath: file.filePath, content }
    }),
  )
}

export default transform
