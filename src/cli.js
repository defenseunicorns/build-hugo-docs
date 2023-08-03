import { findUpSync } from 'find-up'
import { existsSync, readFileSync } from 'fs'
import yaml from 'js-yaml'
import yargs from 'yargs'
import { hideBin } from 'yargs/helpers'

/**
 *
 * @param {string} cfgFile
 * @returns {Object[]} mounts
 * @returns {string} mounts.source - Source path
 * @returns {string} mounts.target - destination path
 * @returns {string[]} mounts.ignores - paths to ignore
 */
const getConfigOptions = (cfgFile = '.hugo-docs.yaml') => {
  const configPath = findUpSync(cfgFile)
  if (!existsSync(configPath)) {
    throw new Error(`Config file ${cfgFile} not found at ${process.cwd()}`)
  }
  return yaml.load(readFileSync(configPath, 'utf-8')).mounts
}

const getUserInput = () => {
  const args = yargs(hideBin(process.argv))
    .options({
      source: {
        alias: 's',
        describe: 'Source path to search for docs to convert',
        type: 'string',
      },
      ignores: {
        alias: 'i',
        describe: 'List of paths to ignore',
        type: 'array',
      },
      target: {
        alias: 't',
        describe: 'Path to write converted files to',
        type: 'string',
      },
      config: {
        alias: 'c',
        describe: 'Configuration file',
        type: 'string',
      },
    })
    .implies('source', 'target')
    .implies('target', 'source')
    .conflicts('config', ['source', 'target']).argv

  return !args.source ? getConfigOptions(args.config) : args
}

export default getUserInput
