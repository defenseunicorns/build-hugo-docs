import { defineWritePath } from '../src/fileUtils.js'
import transform from '../src/transform.js'

const files = [
  {
    searchPath: '/Users/bryan/_git/du/build-hugo-docs/test/fixtures',
    sectionPath: 'fixtures',
    filePath: '/Users/bryan/_git/du/build-hugo-docs/test/fixtures/path1/path2/index.md',
  },
]

describe('Index files', () => {
  it('should rename index.md to _index.md', () => {
    const root = 'content'
    const docSection = 'docs'
    const currentPath = '/build-hugo-docs/docs/path1/path2/index.md'

    const result = defineWritePath(root, docSection, currentPath)
    expect(result.fileName).toEqual('_index.md')
  })
  it('should use the config file for titles', async () => {
    const filePath = [{ filePath: 'test/fixtures/path1/path2/index.md' }]

    const converted = await transform(filePath)

    expect(converted[0].content).toMatch('title: Getting Started')
  })
})
