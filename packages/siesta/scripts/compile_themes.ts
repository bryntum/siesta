import cssom from 'cssom'
import fs from 'fs'
import path from 'path'
import sass from 'sass'
import url from 'url'

//---------------------------------------------------------------------------------------------------------------------
const scriptDir             = path.dirname(url.fileURLToPath(import.meta.url))
const stylingDir            = path.resolve(scriptDir, '../resources/styling/terminal')
const typescriptOutputDir   = path.resolve(scriptDir, '../src/siesta/reporter/styling')

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
                const styleMutations    = []

                for (let i = 0; i < rule.style.length; i++) {
                    const styleName     = rule.style[ i ]

                    const mutation      = styleToMutation(styleName, rule.style[ styleName ])

                    if (mutation === undefined) {
                        console.log(`Ignoring unrecognized style : ${ styleName } : ${ rule.style[ styleName ] }`)
                    } else
                        styleMutations.push(mutation)
                }

                output.push(`styles.set('${ match[ 1 ] }', style => { ${ (styleMutations.join('; '))  } })`)

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
        path.resolve(typescriptOutputDir, themeFilename.replace(/\.\w+$/, '.ts')),
        output.join('\n')
    )
}

compileTheme('theme_dark.scss')
compileTheme('theme_light.scss')
compileTheme('theme_universal.scss')
compileTheme('theme_accessible.scss')

//---------------------------------------------------------------------------------------------------------------------
function styleToMutation (styleName : string, styleValue : string) : string | undefined {
    switch (styleName) {
        case 'color':
            if (styleValue === 'inherit')
                return `style.color = undefined`
            else
                return `style.color = ${ colorToArray(styleValue )}`
        case 'background-color':
            return `style.backgroundColor = ${ colorToArray(styleValue )}`

        case 'text-decoration':
            if (styleValue === 'underline')
                return `style.underline = true`
            if (styleValue === 'inverse')
                return `style.inverse = true`

            // any other values of `text-decoration` are not recognized
            return undefined

        case 'font-weight':
            if (styleValue === 'bolder')
                return `style.bold = true`

            // any other values of `font-weight` are not recognized
            return undefined
    }

    return undefined
}


function colorToArray (colorStyleValue : string) : string {
    const match     = /^#(\w\w)(\w\w)(\w\w)/.exec(colorStyleValue)

    if (match)
        return `[ 0x${ match[ 1 ] }, 0x${ match[ 2 ] }, 0x${ match[ 3 ] } ]`
    else
        throw new Error(`Unrecognized color: ${ colorStyleValue }`)
}
