import { convertFile } from '../src/frontmatter.js'

describe('Updating documentation frontmatter', () => {
  it('should use the first H2 for the title if there is no title and no H1', async () => {
    const fileContents = `
## Zarf Git Server
This package contains the Zarf Git Server
`
    const content = await convertFile(fileContents, 'dummyFile')
    expect(content).toMatch('title: Zarf Git Server')
  })

  it('should not replace an existing title with an H2', async () => {
    const fileContents = `---\ntitle: Old Title\n---\n
## Zarf Git Server
This package contains the Zarf Git Server
`
    const content = await convertFile(fileContents, 'dummyFile')
    expect(content).toMatch('title: Old Title')
  })

  it('should replace an existing title with an H1', async () => {
    const fileContents = `---\ntitle: Old Title\n---\n
# Zarf Git Server
This package contains the Zarf Git Server
`
    const content = await convertFile(fileContents, 'dummyFile')
    expect(content).toMatch('title: Zarf Git Server')
  })

  it('should default the title for files that have no headers', async () => {
    const fileContents = `
    This package contains the Zarf Git Server
    `
    const content = await convertFile(fileContents, 'dummyFile')
    expect(content).toMatch('title: MISSING TITLE')
  })
})
