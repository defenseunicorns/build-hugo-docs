import { existsSync, writeFileSync } from 'fs'
import path from 'path'

import { getFileContents, isMarkdownFile } from './fileUtils.js'
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

const convertContributingImport = body => {
  let result = body

  const replace = [
    { from: '<Contributing />', to: '{{% readfile file="/CONTRIBUTING.md" %}}' },
    { from: /(<ArchitectureSVG \/>)((.|[\n])*?)(\/>)/g, to: '' },
    { from: /(<DocCardList )((.|[\n])*?)(\/>)/g, to: '' },
    { from: /(import Contributing).+([",'];)/g, to: '' },
    { from: /(import ArchitectureSVG).+([",'];)/g, to: '' },
    { from: /(import DocCardList).+([",'];)/g, to: '' },
    { from: /(import {useCurrentSidebarCategory}).+([",'];)/g, to: '' },
  ]

  replace.forEach(el => {
    result = result.replaceAll(el.from, el.to)
  })

  return result
}
const convertSelectionTabsToShortcodes = body => {
  let result = body

  const replace = [
    { from: "'<TabItem ...>'", to: 'tab' },
    { from: /(<Tabs)((.|[\n])*?)(>)/g, to: '{{< tabpane text=true >}}' },
    { from: /(<TabItem)((.|[\n])*?)(>)/g, to: '{{< tab $2 >}}' },
    { from: '</Tabs>', to: '{{< /tabpane >}}' },
    { from: '</TabItem>', to: '{{< /tab >}}' },
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
  const exampleImport =
    /(<ExampleYAML src={require\('..\/..\/examples)((.|[\n])*?)\.((.|[\n])*?)('\)})((.|[\n])*?)(\/>)/g
  const packageImport =
    /(<ExampleYAML src={require\('..\/..\/packages)((.|[\n])*?)\.((.|[\n])*?)('\)})((.|[\n])*?)(\/>)/g
  const localImport = /(<ExampleYAML src={require\('.\/)((.|[\n])*?)\.((.|[\n])*?)('\)})((.|[\n])*?)(\/>)/g
  const fetchFileCodeBlock =
    /(<FetchFileCodeBlock src={require\('..\/..\/examples)((.|[\n])*?)\.((.|[\n])*?)('\)})((.|[\n])*?)(\/>)/g

  let result = body

  const replace = [
    { from: exampleImport, to: '{{< readfile file="/docs/examples$2.$4" code="true" lang="$4" >}}' },
    { from: fetchFileCodeBlock, to: '{{< readfile file="/docs/examples$2.$4" code="true" lang="$4" >}}' },
    { from: packageImport, to: '{{< readfile file="/packages$2.$4" code="true" lang="$4" >}}' },
    { from: localImport, to: '{{< readfile file="$2.$4" code="true" lang="$4" >}}' },
    { from: /(import ExampleYAML).+([",'];)/g, to: '' },
    { from: /(import FetchFileCodeBlock).+([",'];)/g, to: '' },
  ]

  replace.forEach(el => {
    result = result.replaceAll(el.from, el.to)
  })

  return result
}

const convertZarfImportsToShortcodes = body => {
  let result = body

  const replace = [
    { from: /(<Properties)((.|[\n])*?)(\/>)/g, to: '{{< zarfprops $2 >}}' },
    { from: /({{< zarfprops)((.|[\n])*?)(invert include)((.|[\n])*?)(>}})/g, to: '{{< zarfprops $2 ignore $5 >}}' },
    { from: /({{< zarfprops)((.|[\n])*?)({\[)((.|[\n])*?)(]}.+)(>}})/g, to: '{{< zarfprops $2 $5 >}}' },
    { from: /({{< zarfprops)((.|[\n])*?)(\s=)((.|[\n])*?)(>}})/g, to: '{{< zarfprops $2=$5 >}}' },
    { from: /({{< zarfprops)((.|[\n])*?)(=\s)((.|[\n])*?)(>}})/g, to: '{{< zarfprops $2=$5 >}}' },
    { from: /({{< zarfprops)([ ]+)((.|[\n])*?)(>}})/g, to: '{{< zarfprops $3 >}}' },
    { from: /","/g, to: ',' },
    { from: /[ ]+>}}/g, to: ' >}}' },

    { from: /(import Properties).+([",'];)/g, to: '' },
  ]

  replace.forEach(el => {
    result = result.replaceAll(el.from, el.to)
  })

  return result
}

const cleanExtraLF = body => `${body.replaceAll(/\n{3,}/g, '\n\n')}\n`
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
      if (isMarkdownFile(fileInfo.filePath)) {
        fileContents = await addIndexMetadata(fileInfo.filePath, fileContents)

        fileContents = await convertFile(fileContents, fileInfo)

        fileContents = convertAlerts(fileContents)
        fileContents = convertSelectionTabsToShortcodes(fileContents)
        fileContents = convertCodeImportsToShortcodes(fileContents)
        fileContents = convertZarfImportsToShortcodes(fileContents)
        fileContents = convertContributingImport(fileContents)
        fileContents = cleanExtraLF(fileContents)
      }
      return { filePath: fileInfo.filePath, sectionPath: fileInfo.sectionPath, content: fileContents }
    }),
  )
}

export default transform
