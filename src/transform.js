import path from 'path'

import { getFileContents } from './fileUtils.js'
import convertFile, { formatFrontmatter } from './frontmatter.js'

export const addIndexMetadata = async (filePath, contents) => {
  if (path.basename(filePath) !== 'index.md') {
    return contents
  }

  const pathName = path.dirname(filePath)
  const configPath = `${pathName}/_category_.json`

  const fileContents = await getFileContents(configPath)
  const config = fileContents
    ? JSON.parse(fileContents)
    : {
        position: undefined,
        label: undefined,
      }

  const headers = formatFrontmatter({ title: config.label, weight: config.position })

  return headers ? `${headers}\n\n${contents}` : contents
}

/**
 *
 * @param {{filePath: string}[]} files
 * @returns {Promise<{filePath: string, content: string}>}
 */
const transform = async files =>
  Promise.all(
    files.map(async file => {
      let fileContents = await getFileContents(file.filePath)
      fileContents = await addIndexMetadata(file.filePath, fileContents)
      const { frontMatter, body } = await convertFile(fileContents, file.filePath)

      const content = `${frontMatter}${body.join('\n')}`

      return { filePath: file.filePath, content }
    }),
  )

export default transform
