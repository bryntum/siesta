import defaultConfig from './rollup.config.js'

defaultConfig.input = [
    'resources/html_report/index.js'
]

defaultConfig.output.dir = 'dist_html_report'

export default defaultConfig
