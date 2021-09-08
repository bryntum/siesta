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
