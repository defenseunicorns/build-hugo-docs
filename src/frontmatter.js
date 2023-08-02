import matter from 'gray-matter'
import path from 'path'

const getWeightFromFileName = fileName => {
  const weight = Number(path.basename(fileName).split('-')[0])
  return Number.isInteger(weight) ? weight : undefined
}

export const formatFrontmatter = fields => {
  const keys = Object.keys(fields)
  const delim = '---\n'
  const docType = 'type: docs\n'

  const frontmatter = keys.map(key => `${key}: ${fields[key]}\n`)

  frontmatter.unshift(delim)
  frontmatter.push(docType)
  frontmatter.push(delim)

  return frontmatter.join('')
}

const parseHeader = content => {
  const hAny = /^#.+/

  const oldHeader = content.find(el => el.match(hAny))
  const headerLevel = oldHeader ? oldHeader.match(/#/g).length : 1
  const header = oldHeader ? oldHeader.split(' ').slice(1).join(' ') : ''

  return [header, headerLevel, oldHeader]
}

/**
 *
 * @param {string[]} content
 * @returns {string[]}
 */
const replaceH1WithH2 = content => {
  const h1 = /^#\s/
  const h2 = '## '

  return content.map(line => line.replace(h1, h2))
}

/**
 *
 * @param {string} content
 * @param {{title: string}}  data
 * @returns {[header: string, body:string]}
 */
const setTitleAndBody = (content, data) => {
  if (content.length < 1) {
    return ['', '']
  }

  if (data.title) {
    const body = replaceH1WithH2(content)
    return [data.title, body]
  }

  const [header, level, oldHeader] = parseHeader(content)
  const body = content.filter(el => !el.match(oldHeader))

  if (!header.length) {
    return ['MISSING TITLE', content]
  }

  if (level === 1) {
    return [header, body]
  }
  return [data.title ? data.title : header, body]
}

const buildFrontmatterValues = (pageTitle, currentFrontmatter, fileWeight) => {
  const frontMatterValues = { ...currentFrontmatter, title: pageTitle }

  frontMatterValues.weight = 'sidebar_position' in frontMatterValues ? frontMatterValues.sidebar_position : fileWeight

  frontMatterValues.sidebar_position = undefined

  Object.keys(frontMatterValues).forEach(key =>
    frontMatterValues[key] === undefined ? delete frontMatterValues[key] : {},
  )

  return frontMatterValues
}

const convertFile = async (fileContents, inputFile) => {
  const { content, data } = matter(fileContents)

  const fileBody = content.split('\n')

  const [title, body] = setTitleAndBody(fileBody, data)

  const fileWeight = getWeightFromFileName(inputFile)

  const frontMatterValues = buildFrontmatterValues(title, data, fileWeight)

  const frontMatter = formatFrontmatter(frontMatterValues)

  return { frontMatter, body }
}

export default convertFile
