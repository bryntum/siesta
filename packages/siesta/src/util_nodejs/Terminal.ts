//---------------------------------------------------------------------------------------------------------------------
export const hideCursor = '\u001B[?25l'

export const showCursor = '\u001B[?25h'

//---------------------------------------------------------------------------------------------------------------------
const ansiConstrolCharacters = new RegExp(
    [
        '[\\u001B\\u009B][[\\]()#;?]*(?:(?:(?:[a-zA-Z\\d]*(?:;[-a-zA-Z\\d\\/#&.:=?%@~_]*)*)?\\u0007)',
        '(?:(?:\\d{1,4}(?:;\\d{0,4})*)?[\\dA-PR-TZcf-ntqry=><~]))'
    ].join('|'),
    'g'
)


export const stripAnsiControlCharacters = (str : string) : string => str.replace(ansiConstrolCharacters, '')
