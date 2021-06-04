const fs    = require('fs')
const path  = require('path')

const prependZero = (int, minLength) => {
    const str   = String(int)

    return '0000000'.slice(0, minLength - str.length) + str
}

const now           = new Date()
const version       = require('../package.json').version
const versionStr    = `${version}        ${now.getFullYear()}-${ prependZero(now.getMonth() + 1, 2) }-${ prependZero(now.getDate(), 2) } ${ prependZero(now.getHours(), 2) }:${ prependZero(now.getMinutes(), 2) }`

const updateVersion = () => {
    let changelog = fs.readFileSync('CHANGELOG.md', 'utf8')

    changelog = changelog.replace(/\{\{ \$NEXT \}\}/m, versionStr)

    fs.writeFileSync('CHANGELOG.md', changelog, 'utf8')
}


const updateVersionAndStartNew = (newVersion) => {
    let changelog = fs.readFileSync('CHANGELOG.md', 'utf8')

    changelog = changelog.replace(/^(.*?)\{\{ \$NEXT \}\}/m, `$1{{ $NEXT }}\n\n$1${ newVersion || versionStr }`)

    fs.writeFileSync('CHANGELOG.md', changelog, 'utf8')
}

module.exports = {
    updateVersion,
    updateVersionAndStartNew
}
