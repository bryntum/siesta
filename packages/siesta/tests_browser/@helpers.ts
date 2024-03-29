import { isString, isObject } from "../src/util/Typeguards.js"

export type Position = { left : number, top : number, width : number, height : number }


export const createPositionedElement = (tag : string, pos : Position, doc : Document = document) : HTMLElement => {
    const el            = doc.createElement(tag)

    el.style.position   = 'absolute'
    el.style.left       = pos.left + 'px'
    el.style.top        = pos.top + 'px'
    el.style.width      = pos.width + 'px'
    el.style.height     = pos.height + 'px'

    return el
}


const forceStandardsMode = (iframe : HTMLIFrameElement) => {
    const doc           = iframe.contentDocument

    doc.open()

    doc.write([
        '<!DOCTYPE html>',
        '<html style="width: 100%; height: 100%; margin: 0; padding: 0;">',
            '<head>',
            '</head>',
            '<body style="width: 100%; height: 100%; margin: 0; padding: 0;">',
            '</body>',
        '</html>'
    ].join(''))

    doc.close()
}


export const createPositionedIframe = async (url : string = 'about:blank', pos : Position, doc : Document = document) : Promise<HTMLIFrameElement> => {
    const iframe        = createPositionedElement('iframe', pos, doc) as HTMLIFrameElement

    iframe.style.border = '0 solid'

    return new Promise(resolve => {
        iframe.addEventListener('load', () => {
            if (url === 'about:blank') forceStandardsMode(iframe)

            resolve(iframe)
        }, { once : true })

        iframe.src          = url

        doc.body.appendChild(iframe)
    })
}


export type CreateElementDesc = {
    tag?                : string,
    id?                 : string,
    style?              : string | object,
    class?              : string,
    text?               : string,
    html?               : string,
    attributes?         : object,
    children?           : CreateElementDesc[]
    doc?                : Document,
    parent?             : Element
}

export function createElement (desc : CreateElementDesc) : HTMLElement
export function createElement (tag : string, desc? : CreateElementDesc) : HTMLElement
export function createElement (...args : [ desc : CreateElementDesc ] | [ tag : string, desc? : CreateElementDesc ]) : HTMLElement {
    const desc          = args.length === 2 ? args[ 1 ] : isString(args[ 0 ]) ? { tag : args[ 0 ] } : args[ 0 ]
    const tag           = (args.length === 2 ? args[ 0 ] : desc.tag) ?? 'div'

    const doc           = desc?.doc || document
    const el            = doc.createElement(tag)

    const style         = desc?.style

    if (isString(style)) {
        el.style.cssText    = style
    } else if (isObject(style)) {
        Object.assign(el.style, style)
    }

    if (desc?.id !== undefined) el.id = desc?.id

    if (desc?.attributes) Object.assign(el, desc.attributes)

    if (isString(desc?.class)) el.className = desc.class

    if (isString(desc?.text)) el.innerText = desc.text

    if (isString(desc?.html)) el.innerHTML = desc.html

    desc?.children?.forEach(childDesc => el.appendChild(createElement(childDesc)))

    desc?.parent?.appendChild(el)

    return el
}
