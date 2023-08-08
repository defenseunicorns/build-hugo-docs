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
    const re = new RegExp(`(:::${alert})((.|[\n])*?)(:::)`, 'g')
    result = result.replaceAll(re, `{{% alert-${alert} %}}\n$2\n{{% /alert-${alert} %}}`)
  })

  return result
}

const convertSelectionTabsToShortcodes = body => {
  let result = body

  const replace = [
    { from: "'<TabItem ...>'", to: 'tab' },
    { from: /(<Tabs)((.|[\n])*?)(>)/g, to: '{{< tabpane >}}' },
    { from: /(<TabItem)((.|[\n])*?)(>)/g, to: '{{% tab $2 %}}' },
    { from: '</Tabs>', to: '{{< /tabpane >}}' },
    { from: '</TabItem>', to: '{{% /tab %}}' },
    { from: 'value=', to: 'header=' },
    { from: /(value=")\w+(")/g, to: '' },
    { from: /(import Tab).+([",'];)/g, to: '' },
  ]

  replace.forEach(el => {
    result = result.replaceAll(el.from, el.to)
  })

  return result
}

const convertCodeImportsToShortcodes = body => {
  const yamlImport = /(<ExampleYAML src={require\('..\/..\/examples)((.|[\n])*?)('\)})((.|[\n])*?)(\/>)/g

  let result = body

  const replace = [
    { from: yamlImport, to: '{{< readfile file="$2" code="true" lang="yaml" >}}' },
    { from: /(import ExampleYAML).+([",'];)/g, to: '' },
  ]

  replace.forEach(el => {
    result = result.replaceAll(el.from, el.to)
  })

  return result
}

const cleanExtraLF = body => body.replaceAll(/\n{3,}/g, '\n\n')
/**
 *
 * @param {{filePath: string}[]} files
 * @returns {Promise<{filePath: string, content: string}>}
 */
const transform = async files => {
  await addMissingIndexMDFile(files)

  return Promise.all(
    files.map(async fileInfo => {
      let fileContents = await getFileContents(fileInfo.filePath)
      fileContents = await addIndexMetadata(fileInfo.filePath, fileContents)

      let body = await convertFile(fileContents, fileInfo)

      body = convertAlerts(body)
      body = convertSelectionTabsToShortcodes(body)
      // body = convertCodeImportsToShortcodes(body)
      body = cleanExtraLF(body)

      return { filePath: fileInfo.filePath, sectionPath: fileInfo.sectionPath, content: body }
    }),
  )
}

export default transform
