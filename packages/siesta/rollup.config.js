import { defineConfig } from 'rollup'
import resolve from '@rollup/plugin-node-resolve'
// import commonjs from '@rollup/plugin-commonjs'
import multiInput from 'rollup-plugin-multi-input'
// import { terser } from 'rollup-plugin-terser'
import { preserveShebangs } from "rollup-plugin-preserve-shebangs"

export default defineConfig({
    input : [
        'bin/siesta.js',
        'bin/siesta-deno.js',
        'index.js',
        'browser.js',
        'nodejs.js',
        'deno.js',
        // TODO ideally, for publishing, we should create a bundle w/o tests as entry points
        // however, how to test the package then? (we would like to run all the tests on the "bundled"
        // package, and seems there's no good way to do that other than create entries for them)
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
        // terser(),
        preserveShebangs()
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
