import matter from 'gray-matter'

import { getFileContents } from './fileUtils.js'

const buildFrontMatter = (params = []) => {
  const delim = ['---\n']

  const fm = [...delim, ...params, ...delim]

  return fm.join('')
}

const getTitle = content => {
  const h1 = /^#\s.+/

  const header = content.find(el => el.match(h1))
  const title = header.replace('# ', '')
  const body = content.filter(el => !el.match(header))

  return [title, body]
}

const convertFile = async inputFile => {
  const fileContents = await getFileContents(inputFile)
  const fmData = matter(fileContents)
  const fileBody = fmData.content.split('\n')

  const [title, body] = getTitle(fileBody)

  const frontMatterValues = [
    `title: ${title}\n`,
    fmData.data.sidebar_position ? `weight: ${fmData.data.sidebar_position}\n` : null,
  ]

  const frontMatter = buildFrontMatter(frontMatterValues)

  return `${frontMatter}${body.join('\n')}`
}

export default convertFile
