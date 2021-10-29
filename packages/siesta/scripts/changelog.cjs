const fs    = require('fs')
const path  = require('path')

const prependZero = (int, minLength) => {
    const str   = String(int)

    return '0000000'.slice(0, minLength - str.length) + str
}

const version       = require('../package.json').version

const updateVersion = () => {
    const versionTime       = new Date()
    const changelog         = fs.readFileSync('CHANGELOG.md', 'utf8')

    const lines             = changelog.split('\n')

    lines.splice(2, 0, getVersionStr(version, versionTime))

    fs.writeFileSync('CHANGELOG.md', lines.join('\n'), 'utf8')
}


// const updateVersionAndStartNew = (newVersion, newVersionTime) => {
//     let changelog = fs.readFileSync('CHANGELOG.md', 'utf8')
//
//     const version   = (newVersion || version).replace(/^v/, '')
//     const time      = new Date(newVersionTime) || new Date()
//
//     changelog = changelog.replace(/^(.*?)\{\{ \$NEXT \}\}/m, `$1{{ $NEXT }}\n\n$1${ getVersionStr(version, time) }`)
//
//     fs.writeFileSync('CHANGELOG.md', changelog, 'utf8')
// }

const getVersionStr = (version, now) => {
    return `## ${version}        ${ now.getFullYear() }-${ prependZero(now.getMonth() + 1, 2) }-${ prependZero(now.getDate(), 2) } ${ prependZero(now.getHours(), 2) }:${ prependZero(now.getMinutes(), 2) }`
}

module.exports = {
    updateVersion
    // ,
    // updateVersionAndStartNew
}
