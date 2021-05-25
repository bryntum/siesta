import cssom from 'cssom'
import fs from 'fs'
import path from 'path'
import sass from 'sass'
import url from 'url'

//---------------------------------------------------------------------------------------------------------------------
const scriptDir     = path.dirname(url.fileURLToPath(import.meta.url))
const stylingDir    = path.resolve(scriptDir, '../src/siesta/reporter/styling')

export const compileTheme = (themeFilename : string) => {
    const css           = sass.renderSync({ file : path.resolve(stylingDir, themeFilename) })

    const stylesheet    = cssom.parse(css.css.toString())

    //---------------------------------------------------------------------------------------------------------------------
    const output                = [ 'export const styles = new Map()', '' ]

    for (const rule of stylesheet.cssRules) {
        if (rule instanceof cssom.CSSStyleRule) {
            const selector      = rule.selectorText

            const match         = /^\.([^.]*)$/.exec(selector)

            if (match) {
                const colorer   = [ 'c => c' ]

                for (let i = 0; i < rule.style.length; i++) {
                    const styleName     = rule.style[ i ]

                    const colorerCall   = styleToColorer(styleName, rule.style[ styleName ])

                    if (colorerCall === undefined) {
                        console.log(`Ignoring unrecognized style : ${ styleName } : ${ rule.style[ styleName ] }`)
                    } else
                        colorer.push(colorerCall)
                }

                output.push(`styles.set('${ match[ 1 ] }', ${ colorer.join('') })`)

            } else {
                console.log("//----------------------")
                console.log("Ignoring css rule - only single class selectors are supported: ", rule)
            }
        } else {
            console.log("//----------------------")
            console.log("Ignoring css rule - only style rules are processed: ", rule)
        }
    }

    //--------------------------
    fs.writeFileSync(
        path.resolve(stylingDir, themeFilename.replace(/\.\w+$/, '.ts')),
        output.join('\n')
    )
}

compileTheme('theme_dark.scss')
compileTheme('theme_light.scss')
compileTheme('theme_universal.scss')
compileTheme('theme_accessible.scss')

//---------------------------------------------------------------------------------------------------------------------
function styleToColorer (styleName : string, styleValue : string) : string | undefined {
    switch (styleName) {
        case 'color':
            return colorToColorer(styleValue, false)
        case 'background-color':
            return colorToColorer(styleValue, true)

        case 'text-decoration':
            if (styleValue === 'underline') return '.underline'

            return undefined

        case 'font-weight':
            if (styleValue === 'bold') return '.bold'

            return undefined
    }

    return undefined
}


function colorToColorer (colorStyleValue : string, isBackground : boolean = false) : string {
    let match   = /^rgb(.*)/.exec(colorStyleValue)

    if (match) return `.${ isBackground ? 'bgRgb' : 'rgb' }${ match[ 1 ] }`

    match       = /^#(\w\w)(\w\w)(\w\w)/.exec(colorStyleValue)

    if (match) return `.${ isBackground ? 'bgRgb' : 'rgb' }(0x${ match[ 1 ] }, 0x${ match[ 2 ] }, 0x${ match[ 3 ] })`

    return `.${ isBackground ? 'bgKeyword' : 'keyword' }("${ colorStyleValue }")`
}
