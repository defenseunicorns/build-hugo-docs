import { getFilesForPaths } from '../src/fileUtils'

describe('Retreiving files to convert', () => {
  let files
  beforeAll(async () => {
    files = await getFilesForPaths(['test'])
  })

  it('Should return a list of files to be converted', async () => {
    expect(files.length).toBeGreaterThan(0)
  })

  it('Should preserve the relative paths', () => {
    const testFile = '0-understand-the-basics.md'
    const expPath = 'test/path1/path2/0-u'

    const found = files.find(file => file.filePath.includes(testFile))
    console.log(found)

    expect(found.filePath.includes(expPath)).toBe(true)
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
