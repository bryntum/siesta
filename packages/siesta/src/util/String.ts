export const fitString = function (string : string, maxLength : number) : string[] {
    const spacesStr             = ' '.repeat(maxLength)

    const lines : string[]      = []

    const parts : string[]      = string.split(/ /)

    while (parts.length) {
        const str : string[]    = []
        let len                 = 0
        let forcedNewLine       = false

        while (
            parts.length
                &&
            (len + parts[ 0 ].length + (str.length ? 1 : 0) <= maxLength || !str.length && parts[ 0 ].length > maxLength)
        ) {
            const part      = parts.shift()
            len             += part.length + (str.length ? 1 : 0)

            if (/\n$/.test(part)) forcedNewLine = true

            str.push(part.replace(/\n$/, ''))

            if (forcedNewLine) break
        }

        // can be negative in case of small `maxLength`
        let spaceLeft       = Math.max(parts.length && !forcedNewLine ? maxLength - len : 0, 0)

        let fittedStr       = ''

        for (let i = 0; i < str.length; i++) {
            if (i === 0)
                fittedStr       = str[ 0 ]
            else {
                const addition  = Math.ceil(spaceLeft / (str.length - i))

                fittedStr       += spacesStr.substr(0, addition + 1) + str[ i ]

                spaceLeft       -= addition
            }
        }

        lines.push(fittedStr)
    }

    return lines
}
