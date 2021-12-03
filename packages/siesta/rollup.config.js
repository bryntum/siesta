import { fileURLToPath } from "url"
import { defineConfig } from 'rollup'
import resolve from '@rollup/plugin-node-resolve'
// import commonjs from '@rollup/plugin-commonjs'
import multiInput from 'rollup-plugin-multi-input'
// import { terser } from 'rollup-plugin-terser'
import { preserveShebangs } from "rollup-plugin-preserve-shebangs"
// import visualizer from "rollup-plugin-visualizer"
import { importMetaAssets } from "@web/rollup-plugin-import-meta-assets"


export default defineConfig({
    input : [
        // TODO ideally, every environment should separate bundle, so that
        // `import { it } from 'siesta/browser.js'`
        // imports a single file (modulo Ports/Medias), that will be the fastest
        // right now, many files are shared between the environments, which forces loading
        // of many bundles as separate files
        'bin/siesta.js',
        'bin/siesta_deno.js',
        'index.js',
        'browser.js',
        'nodejs.js',
        'deno.js',
        'resources/dashboard/index.js',
        // TODO ideally, for publishing, we should create a bundle w/o tests as entry points
        // however, how to test the package then? (we would like to run all the tests on the "bundled"
        // package, and seems there's no good way to do that other than create entries for them)
        // or, if bundled tests passes (should use minified bundles then), then we just re-run
        // the bundler w/o test entries and cross the fingers? Relying on bundler then
        'tests/**/*.t.js',
        'tests/index.js',

        'tests_browser/**/*.t.js',
        'tests_browser/index.js',

        'tests_nodejs/**/*.t.js',
        'tests_nodejs/index.js',
        'tests_nodejs/@sample_test_suites/isomorphic/index.js',
        'tests_nodejs/@sample_test_suites/browser/index.js',
        'tests_nodejs/@sample_test_suites/nodejs/index.js',
        'tests_nodejs/@sample_test_suites/deno/index.js',

        'tests_deno/**/*.t.js',
        'tests_deno/index.js',
        'tests_deno/@sample_test_suites/isomorphic/index.js',
        'tests_deno/@sample_test_suites/browser/index.js',
        'tests_deno/@sample_test_suites/deno/index.js',
    ],

    output : {
        dir     : 'dist',
        format  : 'esm',
        chunkFileNames  : 'chunks/[name]-[hash].js'
    },

    plugins : [
        {
            // if `siestaPackageRootUrl` is moved into a chunk, move its value one level up
            resolveImportMeta (prop, { chunkId, moduleId, format }) {
                if (moduleId === fileURLToPath(new URL('index.js', import.meta.url)) && chunkId.startsWith('chunks')) {
                    return `import.meta.url.replace(/[^/]*$/, '../')`
                } else
                    return null
            }
        },
        resolve({ preferBuiltins : true }),
        // commonjs(),
        multiInput(),
        // terser(),
        preserveShebangs(),
        importMetaAssets(),
        // visualizer({
        //     filename    : 'dist/stats.html',
        //     template    : 'treemap'
        // })
    ],

    external : [
        '@web/dev-server',
        'playwright',
        'puppeteer',
        'node-fetch',
        'glob',
        'chalk',
        'ws',
        'fs-extra'
    ]
})
