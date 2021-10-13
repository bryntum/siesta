import { defineConfig } from 'rollup'
import resolve from '@rollup/plugin-node-resolve'
// import commonjs from '@rollup/plugin-commonjs'
import multiInput from 'rollup-plugin-multi-input'
// import { terser } from 'rollup-plugin-terser'

export default defineConfig({
    input : [
        'index.js',
        'browser.js',
        'nodejs.js',
        'deno.js',
        'tests/**/*.t.js',
        'tests/index.js'
    ],

    output : {
        dir     : 'dist',
        format  : 'esm'
    },

    plugins : [
        resolve({ preferBuiltins : true }),
        // commonjs(),
        multiInput(),
        // terser()
    ],

    external : [
        '@web/dev-server',
        'playwright',
        'puppeteer',
        'node-fetch',
        'glob',
        'chalk',
        'ws'
    ]
})
