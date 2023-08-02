import { getFileContents } from '../src/fileUtils.js'
import convertFile from '../src/frontmatter.js'

describe('Updating documentation frontmatter', () => {
  it('should use the first H2 for the title if there is no title and no H1', async () => {
    const filePath = 'test/fixtures/path1/h2Content.md'
    const fileContents = await getFileContents(filePath)

    const { frontMatter, body } = await convertFile(fileContents, filePath)

    expect(frontMatter).toMatch('title: Zarf Registry')
    expect(body.length).toBeGreaterThan(0)
  })

  it('should not replace an existing title with an H2', async () => {
    const filePath = 'test/fixtures/path1/titleH2Content.md'

    const fileContents = await getFileContents(filePath)

    const { frontMatter, body } = await convertFile(fileContents, filePath)
    expect(frontMatter).toMatch('title: Old Title')
    expect(body.length).toBeGreaterThan(0)
  })

  it('should not replace an existing title with an H1', async () => {
    const filePath = 'test/fixtures/path1/titleH1Content.md'

    const fileContents = await getFileContents(filePath)

    const { frontMatter, body } = await convertFile(fileContents, filePath)
    expect(frontMatter).toMatch('title: Old Title H1')
    expect(body.length).toBeGreaterThan(0)
  })

  it('should use an existing H1 title if there is no frontmatter', async () => {
    const filePath = 'test/fixtures/path1/h1Content.md'

    const fileContents = await getFileContents(filePath)

    const { frontMatter, body } = await convertFile(fileContents, filePath)
    expect(frontMatter).toMatch('title: Zarf Git Server')
    expect(body.length).toBeGreaterThan(0)
  })

  it('should default the title for files that have no headers', async () => {
    const filePath = 'test/fixtures/path1/noHeaderContent.md'

    const fileContents = await getFileContents(filePath)

    const { frontMatter, body } = await convertFile(fileContents, filePath)
    expect(frontMatter).toMatch('title: MISSING TITLE')
    expect(body.length).toBeGreaterThan(0)
  })

  it('should default to type docs', async () => {
    const filePath = 'test/fixtures/path1/path2/0-zarf-overview.md'
    const fileContents = await getFileContents(filePath)
    const { frontMatter } = await convertFile(fileContents, filePath)
    expect(frontMatter).toMatch('type: docs')
  })
})
