import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-commonjs';
import { uglify } from "rollup-plugin-uglify";
import buble from 'rollup-plugin-buble';
import pkg from './package.json';

let isProd = process.env.buildTarget == 'prod';

let plugins = [
	resolve(),
	commonjs(), 
	buble()
]; 

if(isProd) { 
	plugins.push(uglify());
}

export default [
	// browser-friendly UMD build
	{
		input: 'src/index.js',
		output: {
			name: 'simpleBind',
			file: pkg.browser,
			format: 'umd',
			sourcemap: true
		},
		plugins
	},

	// browser-friendly demo builds
	{
		input: 'src/demo/todo.js',
		external: [ ...Object.keys(pkg.peerDependencies || {}), ],
		output: { 
			name: 'todo',
			file: 'dist/todo.js',
			format: 'umd',
			sourcemap: true
		},
		plugins: [
			resolve(), 
			commonjs(), 
			buble(),
			// uglify()
		]
	},

	// CommonJS (for Node) and ES module (for bundlers) build.
	// (We could have three entries in the configuration array
	// instead of two, but it's quicker to generate multiple
	// builds from a single configuration where possible, using
	// an array for the `output` option, where we can specify 
	// `file` and `format` for each target)
	{
		input: 'src/index.js',
		external: [],
		output: [
			{ file: pkg.main, format: 'cjs' },
			{ file: pkg.module, format: 'es' }
		]
	}
];