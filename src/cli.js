import { existsSync, readFileSync } from 'fs'

import { findUpSync } from 'find-up'
import yaml from 'js-yaml'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

const getConfigOptions = (path = '.hugo-docs.yaml') => {
  const configPath = findUpSync(path)
  return existsSync(configPath) ? yaml.safeLoad(readFileSync(configPath, 'utf-8')) : null
}

const format = obj => {
  const paths = obj.paths
  const ignores = obj.ignores
  const outdir = obj.outdir
  return [paths, ignores, outdir]
}

export const getUserInput = () => {
  const args = yargs(hideBin(process.argv))
    .options({
      paths: {
        alias: 'p',
        describe: 'List of paths to search for docs to convert',
        type: 'array',
      },
      ignores: {
        alias: 'i',
        describe: 'List of paths to ignore',
        type: 'array',
      },
      outdir: {
        alias: 'o',
        describe: 'Path to write converted files to',
        type: 'string',
      },
      config: {
        alias: 'c',
        describe: 'Configuration file',
        type: 'string',
      },
    })
    .implies('paths', 'outdir')
    .implies('outdir', 'paths')
    .conflicts('config', ['paths', 'outdir']).argv

  const [paths, ignores, outdir] = !args.paths ? format(getConfigOptions(args.config)) : format(args)

  return { paths, ignores, outdir }
}
