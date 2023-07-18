import { getFilesForPaths } from '../src/fileUtils'

describe('Retreiving files to convert', () => {
  it('Should return a list of files to be converted', async () => {
    const files = await getFilesForPaths(['test'])

    expect(files.length).toBeGreaterThan(0)
  })

  it('Should preserve the relative paths', async () => {
    const files = await getFilesForPaths(['test'])

    const testFile = '0-understand-the-basics.md'
    const expPath = 'test/path1/path2/0-u'

    const found = files.find(file => file.filePath.includes(testFile))

    expect(found.filePath.includes(expPath)).toBe(true)
  })
  it('should accept files as input', async () => {
    const files = await getFilesForPaths(['README.md'])

    expect(files.length).toBeGreaterThan(0)
  })
  it('should ignore requested paths', async () => {
    const ignorePath = 'test/path1/ignore'

    const files = await getFilesForPaths(['test'], [ignorePath])

    const found = files.filter(file => {
      return file.filePath.match(ignorePath)
    })
    expect(found.length).toBe(0)
  })
})

describe('Error conditions', () => {
  it('Should throw an error of if the input is empty', async () => {
    await expect(getFilesForPaths()).rejects.toThrow()
  })
  it('Should throw an error of if the input is an empty array', async () => {
    await expect(getFilesForPaths([])).rejects.toThrow()
  })
  it('Should throw an error of if the input is the incorrect type', async () => {
    await expect(getFilesForPaths('test')).rejects.toThrow()
  })
})
