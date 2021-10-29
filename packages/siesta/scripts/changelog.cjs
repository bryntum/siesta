const fs    = require('fs')
const path  = require('path')

const prependZero = (int, minLength) => {
    const str   = String(int)

    return '0000000'.slice(0, minLength - str.length) + str
}

const defaultVersion        = require('../package.json').version

const updateVersion = (newVersion) => {
    const versionTime       = new Date()
    const changelog         = fs.readFileSync('CHANGELOG.md', 'utf8')

    const lines             = changelog.split('\n')

    const version           = newVersion || defaultVersion

    lines.splice(2, 0, getVersionStr(version, versionTime), '')

    fs.writeFileSync('CHANGELOG.md', lines.join('\n'), 'utf8')
}

const getVersionStr = (version, now) => {
    return `## ${version}        ${ now.getFullYear() }-${ prependZero(now.getMonth() + 1, 2) }-${ prependZero(now.getDate(), 2) } ${ prependZero(now.getHours(), 2) }:${ prependZero(now.getMinutes(), 2) }`
}

module.exports = {
    updateVersion
}
