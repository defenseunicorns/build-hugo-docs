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

const parseHeader = (content, matcher) => {
  const head = content.find(el => el.match(matcher))

  return head ? head.split(' ').slice(1).join(' ') : ''
}

const getTitle = (content, data, inputFile) => {
  const hAny = /^#.+/
  const h1 = /^#\s.+/

  try {
    if (content.length < 1) {
      return ['', '']
    }

    const h1Header = parseHeader(content, h1)
    const altHeader = data.title ? data.title : parseHeader(content, hAny)
    let title = h1Header ? h1Header : altHeader

    if (!title.length) {
      title = 'MISSING TITLE'
    }

    const body = content.filter(el => !el.match(title))

    return [title, body]
  } catch (err) {
    console.error(`getTitle(${inputFile}) : ${err}`)
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

    const [title, body] = getTitle(fileBody, data, inputFile)

    const fileWeight = getWeightFromFileName(inputFile)

    const frontMatterValues = buildFrontmatterValues(title, data, fileWeight)

    const frontmatterList = []
    for (const [key, value] of Object.entries(frontMatterValues)) {
      frontmatterList.push(`${key}: ${value}\n`)
    }

    const frontMatter = buildFrontMatter(frontmatterList)

    return `${frontMatter}${body.join('\n')}`
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
