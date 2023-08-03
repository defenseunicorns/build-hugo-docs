import { defineWritePath, getFilesForPath } from '../src/fileUtils'

describe('Retreiving files to convert', () => {
  it('Should return a list of files to be converted', async () => {
    const files = await getFilesForPath('test/fixtures')

    expect(files.length).toBeGreaterThan(0)
  })

  it('Should preserve the relative paths', async () => {
    const files = await getFilesForPath('test/fixtures')

    const testFile = '0-understand-the-basics.md'
    const expPath = 'test/fixtures/path1/path2/0-u'

    const found = files.find(file => file.filePath.includes(testFile))

    expect(found.filePath.includes(expPath)).toBe(true)
  })
  it('should accept files as input', async () => {
    const files = await getFilesForPath('README.md')

    expect(files.length).toBeGreaterThan(0)
  })
  it('should ignore requested paths', async () => {
    const ignorePath = 'test/fixtures/path1/ignore'

    const files = await getFilesForPath('test/fixtures', [ignorePath])

    const found = files.filter(file => {
      return file.filePath.match(ignorePath)
    })
    expect(found.length).toBe(0)
  })

  it('Should throw an error of if the input is empty', async () => {
    await expect(getFilesForPath()).rejects.toThrow()
  })
})

describe('Constructing path to save file', () => {
  it('should begin with the requested output path', () => {
    const root = 'content'
    const docSection = 'docs'
    const currentPath = '/build-hugo-docs/docs/path1/path2/0-understand-the-basics.md'
    const expected = 'content/docs/path1/path2/0-understand-the-basics.md'

    const result = defineWritePath(root, docSection, currentPath)

    expect(`${result.pathName}/${result.fileName}`).toEqual(expected)
  })

  it('should not remove subsections that repeat the docSection name ', () => {
    const root = 'content'
    const docSection = 'docs'
    const currentPath = '/build-hugo-docs/docs/path1/docs/path2/bob.md'
    const expected = 'content/docs/path1/docs/path2/bob.md'

    const result = defineWritePath(root, docSection, currentPath)

    expect(`${result.pathName}/${result.fileName}`).toEqual(expected)
  })
})
