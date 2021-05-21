/**
 * @type {import('vite').UserConfig}
 */
const config = {
    optimizeDeps    : {
        entries     : [
            './tests/index.js',
            './tests/**/*.t.js'
        ]
    }
}

export default config
