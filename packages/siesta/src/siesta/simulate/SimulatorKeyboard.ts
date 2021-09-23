//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type TypeOptions      = {
    modifierKeys?   : SiestaModifierKey[]
    // delay between the individual key down / key up events, by default 0
    delay?          : number
}

export type SiestaTypeString    = string

export type SiestaModifierKey   = 'CMD' | 'ALT' | 'CTRL' | 'SHIFT'


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export interface SimulatorKeyboard {
    simulateKeyPress (key : SiestaTypeString, options? : TypeOptions) : Promise<any>

    simulateKeyDown (key : SiestaTypeString) : Promise<any>

    simulateKeyUp (key : SiestaTypeString) : Promise<any>

    simulateType (text : SiestaTypeString, options? : TypeOptions) : Promise<any>
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Extract normal chars, or special keys in brackets such as [TAB], [RIGHT] or [ENTER]
export const extractKeysAndSpecialKeys = (string : SiestaTypeString) : string[] => {
    const res : string[]        = []
    // either: [[SPECIAL]] (meaning plain text), [SPECIAL] (meaning special char), or any character
    const tokens                = string.match(/(\[\[(?:\w|-){1,11}\]\])|(\[(?:\w|-){1,11}\])|([\s\S])/g) || []

    tokens.forEach(token => {
        if (token.length > 1) {
            const isDouble      = /\[\[/.test(token)

            const specialKey    = token.substring(isDouble ? 2 : 1, token.length - (isDouble ? 2 : 1))
            const isNormalText  = keyCodes[ specialKey.toUpperCase() ] === undefined

            if (isNormalText || isDouble) {
                if (isNormalText && isDouble) res.push('[')
                res.push('[', ...extractKeysAndSpecialKeys(specialKey), ']')
                if (isNormalText && isDouble) res.push(']')
            } else {
                res.push(token.substring(1, token.length - 1))
            }
        } else
            res.push(token)
    })

    return res
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const isNavigationKey = (keyCode : number) : boolean => {
    return (keyCode >= 33 && keyCode <= 40) ||
        keyCode === keyCodes.RETURN ||
        keyCode === keyCodes.TAB ||
        keyCode === keyCodes.ESCAPE
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const isSpecialKey = (keyCode : number) : boolean => {
    return keyCode === keyCodes.BACKSPACE ||
        (keyCode >= 16 && keyCode <= 20) ||
        (keyCode >= 44 && keyCode <= 46) ||
        (keyCode >= 112 && keyCode <= 123) ||
        keyCode === 91
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const isModifierKey = (keyCode : number) : boolean => {
    return keyCode === keyCodes.SHIFT
        || keyCode === keyCodes.CTRL
        || keyCode === keyCodes.ALT
        || keyCode === keyCodes.CMD // TODO add check to make sure it's a Mac?
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const keyNameFromCharCode = (code : number, readableForm : boolean) : string => {
    for (const key in keyCodes)
        if (keyCodes[ key ] === code && (!readableForm || key.length > 1)) return key
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// FROM Syn library by JupiterJS, MIT License. www.jupiterjs.com
// key codes
export const keyCodes : Record<string, number> = {
    //backspace
    '\b'            : 8,
    'BACKSPACE'     : 8,

    //tab
    '\t'            : 9,
    'TAB'           : 9,

    //enter
    '\r'            : 13,
    'RETURN'        : 13,
    'ENTER'         : 13,
    'SPACE'         : 32,

    //special
    'SHIFT'         : 16,
    'CTRL'          : 17,
    'ALT'           : 18,
    'CMD'           : 91, // Mac
    'META'          : 91, // Mac

    //weird
    'PAUSE-BREAK'   : 19,
    'CAPS'          : 20,
    'ESCAPE'        : 27,
    'ESC'           : 27,
    'NUM-LOCK'      : 144,
    'SCROLL-LOCK'   : 145,
    'PRINT'         : 44,

    //navigation
    'PAGE-UP'       : 33,
    'PAGEUP'        : 33,
    'PAGE-DOWN'     : 34,
    'PAGEDOWN'      : 34,
    'END'           : 35,
    'HOME'          : 36,
    'LEFT'          : 37,
    'ARROWLEFT'     : 37,
    'UP'            : 38,
    'ARROWUP'       : 38,
    'RIGHT'         : 39,
    'ARROWRIGHT'    : 39,
    'DOWN'          : 40,
    'ARROWDOWN'     : 40,
    'INSERT'        : 45,
    'DELETE'        : 46,

    //normal characters
    ' '             : 32,
    '0'             : 48,
    '1'             : 49,
    '2'             : 50,
    '3'             : 51,
    '4'             : 52,
    '5'             : 53,
    '6'             : 54,
    '7'             : 55,
    '8'             : 56,
    '9'             : 57,
    'A'             : 65,
    'B'             : 66,
    'C'             : 67,
    'D'             : 68,
    'E'             : 69,
    'F'             : 70,
    'G'             : 71,
    'H'             : 72,
    'I'             : 73,
    'J'             : 74,
    'K'             : 75,
    'L'             : 76,
    'M'             : 77,
    'N'             : 78,
    'O'             : 79,
    'P'             : 80,
    'Q'             : 81,
    'R'             : 82,
    'S'             : 83,
    'T'             : 84,
    'U'             : 85,
    'V'             : 86,
    'W'             : 87,
    'X'             : 88,
    'Y'             : 89,
    'Z'             : 90,

    //NORMAL-CHARACTERS, NUMPAD
    'NUM0'          : 96,
    'NUM1'          : 97,
    'NUM2'          : 98,
    'NUM3'          : 99,
    'NUM4'          : 100,
    'NUM5'          : 101,
    'NUM6'          : 102,
    'NUM7'          : 103,
    'NUM8'          : 104,
    'NUM9'          : 105,
    '*'             : 106,
    '+'             : 107,

    //normal-characters, others
    ';'             : 186,
    '='             : 187,
    ','             : 188,
    '-'             : 189,
    '.'             : 190,
    '/'             : 191,
    '`'             : 192,
    '['             : 219,
    '\\'            : 220,
    ']'             : 221,
    "'"             : 222,

    'F1'            : 112,
    'F2'            : 113,
    'F3'            : 114,
    'F4'            : 115,
    'F5'            : 116,
    'F6'            : 117,
    'F7'            : 118,
    'F8'            : 119,
    'F9'            : 120,
    'F10'           : 121,
    'F11'           : 122,
    'F12'           : 123
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// key names // https://developer.mozilla.org/en-US/docs/Web/API/KeyboardEvent/key/Key_Values
export const keyNames : Record<string, string> = {
    //backspace
    '8'             : 'Backspace',
    '9'             : 'Tab',

    //enter
    '13'            : 'Enter',

    //space
    '32'            : 'Space',

    //special
    '16'            : 'Shift',
    '17'            : 'Control',
    '18'            : 'Alt',
    '91'            : 'Meta', // Mac Cmd

    '20'            : 'CapsLock',
    '27'            : 'Escape',
    '144'           : 'NumLock',
    '145'           : 'ScrollLock',
    '44'            : 'Print',

    //navigation
    '33'            : 'PageUp',
    '34'            : 'PageDown',
    '35'            : 'End',
    '36'            : 'Home',
    '37'            : 'ArrowLeft',
    '38'            : 'ArrowUp',
    '39'            : 'ArrowRight',
    '40'            : 'ArrowDown',
    '45'            : 'Insert',
    '46'            : 'Delete',

    '106'           : 'Multiply',
    '107'           : 'Add',

    '112'           : 'F1',
    '113'           : 'F2',
    '114'           : 'F3',
    '115'           : 'F4',
    '116'           : 'F5',
    '117'           : 'F6',
    '118'           : 'F7',
    '119'           : 'F8',
    '120'           : 'F9',
    '121'           : 'F10',
    '122'           : 'F11',
    '123'           : 'F12'
}
