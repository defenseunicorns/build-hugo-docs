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
  files.forEach(async file => {
    if (file.filePath.match('index.md') && !existsSync(file.filePath))
      await writeFileSync(file.filePath, '', { flag: 'wx' })
  })
}

const convertAlerts = body => {
  const alerts = ['info', 'note', 'caution', 'tip']

  let result = body
  alerts.forEach(alert => {
    const re = new RegExp(`(:::${alert})((.|[\n])*?)(:::)`)
    result = result.replace(re, `{{% alert-${alert} %}}\n$2\n{{% /alert-${alert} %}}`)
  })

  return result
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

      const body = await convertFile(fileContents, file.filePath)

      const content = convertAlerts(body)

      return { filePath: file.filePath, sectionPath: file.sectionPath, content }
    }),
  )
}

export default transform
