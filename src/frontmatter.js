import path from 'path'

import matter from 'gray-matter'

const getWeightFromFileName = fileName => {
  const weight = Number(path.basename(fileName).split('-')[0])
  return Number.isInteger(weight) ? weight : undefined
}

const buildFrontMatter = (params = []) => {
  const delim = ['---\n']

  const fm = [...delim, ...params, ...delim]

  return fm.join('')
}

const parseHeader = content => {
  const hAny = /^#.+/

  const oldHeader = content.find(el => el.match(hAny))
  const headerLevel = oldHeader ? oldHeader.match(/#/g).length : 1
  const header = oldHeader ? oldHeader.split(' ').slice(1).join(' ') : ''

  return [header, headerLevel, oldHeader]
}

const setTitleAndBody = (content, data, inputFile) => {
  const hAny = /^#.+/
  const h1 = /^#\s.+/

  try {
    if (content.length < 1) {
      return ['', '']
    }

    const [header, level, oldHeader] = parseHeader(content, h1)
    const body = content.filter(el => !el.match(oldHeader))

    if (!header.length && !data.title) {
      return ['MISSING TITLE', content]
    }

    if (level === 1) {
      return [header, body]
    } else {
      return [data.title ? data.title : header, body]
    }
  } catch (err) {
    console.error(`setTitleAndBody(${inputFile}) : ${err}`)
  }
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

export const convertFile = async (fileContents, inputFile) => {
  try {
    const { content, data } = matter(fileContents)

    const fileBody = content.split('\n')

    const [title, body] = setTitleAndBody(fileBody, data, inputFile)

    console.log(`${title},\n${body},\n${fileBody}`)

    const fileWeight = getWeightFromFileName(inputFile)

    const frontMatterValues = buildFrontmatterValues(title, data, fileWeight)

    const frontmatterList = []
    for (const [key, value] of Object.entries(frontMatterValues)) {
      frontmatterList.push(`${key}: ${value}\n`)
    }

    const frontMatter = buildFrontMatter(frontmatterList)

    return { frontMatter, body }
  } catch (err) {
    const error = `convertFile(${inputFile})\n${err}`
  }
}

const fmList = [
  'aliases',
  'audio',
  'cascade',
  'date',
  'description',
  'expiryDate',
  'headless',
  'images',
  'isCJKLanguage',
  'keywords',
  'lastmod',
  'layout',
  'linkTitle',
  'markup',
  'outputs',
  'publishDate',
  'resources',
  'slug',
  'title',
  'type',
  'url',
  'videos',
  'weight',
]
