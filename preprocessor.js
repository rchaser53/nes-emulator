const tsc = require('typescript')
const tsConfig = require('./tsconfig.json')

module.exports = {
	process(src, path) {
		if (path.endsWith('.ts')) {
      const optionForJest = {
        ...tsConfig.compilerOptions,
        'module': 'commonjs',
      }

			return tsc.transpile(src, optionForJest, path, [])
		}
		return src
	}
}