//---------------------------------------------------------------------------------------------------------------------
export const awaitDomReady = async () : Promise<void> => {
    if (document.readyState === 'complete') return

    await new Promise<Event>(resolve => window.addEventListener('load', resolve, { once : true }))
}


//---------------------------------------------------------------------------------------------------------------------
export const awaitDomInteractive = async () : Promise<void> => {
    if (document.readyState === 'interactive' || document.readyState === 'complete') return

    await new Promise<void>(resolve => {
        document.addEventListener(
            'readystatechange',
            () => {
                if (document.readyState === 'interactive' || document.readyState === 'complete') resolve()
            },
            { once : true }
        )
    })
}


//---------------------------------------------------------------------------------------------------------------------
// TODO not clear if this property returns `true` for element,
// connected to the shadow root of the unconnected web component el
export const isElementConnected = (el : Element) : boolean => {
    return el.isConnected
}


//---------------------------------------------------------------------------------------------------------------------
export const isElementVisible = (el : Element) : boolean => {
    if (!isElementConnected(el)) return false

    const style     = getComputedStyle(el)

    if (style.display === 'none' || style.visibility === 'hidden') return false

    const rect      = el.getBoundingClientRect()

    return rect.width > 0 || rect.height > 0
}
