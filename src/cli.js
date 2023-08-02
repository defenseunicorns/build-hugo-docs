import { existsSync, readFileSync } from 'fs'
import { findUpSync } from 'find-up'
import { hideBin } from 'yargs/helpers'
import yaml from 'js-yaml'
import yargs from 'yargs'

const getConfigOptions = (path = '.hugo-docs.yaml') => {
  const configPath = findUpSync(path)
  return existsSync(configPath) ? yaml.load(readFileSync(configPath, 'utf-8')) : null
}

const format = obj => {
  const { paths } = obj
  const { ignores } = obj
  const { outdir } = obj
  return [paths, ignores, outdir]
}

const getUserInput = () => {
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

export default getUserInput
