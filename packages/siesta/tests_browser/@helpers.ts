import { isString, isObject } from "../src/util/Typeguards.js"

export type Position = { left : number, top : number, width : number, height : number }


export const createPositionedElement = (doc : Document, tag : string, pos : Position) : HTMLElement => {
    const el            = document.createElement(tag)

    el.style.position   = 'absolute'
    el.style.left       = pos.left + 'px'
    el.style.top        = pos.top + 'px'
    el.style.width      = pos.width + 'px'
    el.style.height     = pos.height + 'px'

    return el
}


export const createPositionedIframe = async (doc : Document, url : string = 'about:blank', pos : Position) : Promise<HTMLIFrameElement> => {
    const iframe        = createPositionedElement(doc, 'iframe', pos) as HTMLIFrameElement

    iframe.style.border = '0 solid'

    return new Promise(resolve => {
        iframe.addEventListener('load', () => {
            iframe.contentDocument.body.style.margin = '0'

            resolve(iframe)
        }, { once : true })

        iframe.src          = url

        doc.body.appendChild(iframe)
    })
}


export const createElement = (
    doc : Document, tag : string, options? : { id? : string, style? : string | object, class? : string, text? : string, attributes? : object }
)
    : HTMLElement =>
{
    const el            = document.createElement(tag)

    const style         = options?.style

    if (isString(style)) {
        el.style.cssText    = style
    } else if (isObject(style)) {
        Object.assign(el.style, style)
    }

    if (options?.id !== undefined) el.id = options?.id

    if (options?.attributes) Object.assign(el, options.attributes)

    if (isString(options?.class)) el.className = options.class

    if (isString(options?.text)) el.innerText = options.text

    return el
}
