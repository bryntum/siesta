import { BoxUnbound } from '@bryntum/chronograph/src/chrono2/data/Box.js'
import { XmlElement } from "../jsx/XmlElement.js"
import { isArray, isFunction, isNumber, isString, isSyncFunction } from "../util/Typeguards.js"
import { Component } from "./Component.js"
import { ComponentElement, ElementReactivity, ReactiveElement, ReactiveNode } from "./ElementReactivity.js"

//---------------------------------------------------------------------------------------------------------------------
export type Listener = (event : Event) => any

export type PropertySource<V> =
    | V
    | (() => V)
    | Listener
    | BoxUnbound<V>

export type PropertySourceNormalized<V> =
    | V
    | (() => V)
    | BoxUnbound<V>


//---------------------------------------------------------------------------------------------------------------------
export const resolvePropertySource = <V>(src : PropertySourceNormalized<V>) : V => {
    let source : PropertySourceNormalized<V>        = src

    while (true) {
        if (source instanceof BoxUnbound) {
            source  = source.read()
        }
        else if (isSyncFunction(source)) {
            source  = source()
        }
        else
            break
    }

    return source
}

//---------------------------------------------------------------------------------------------------------------------
export type PropertiesCategorizationResult = {
    events                  : [ string, Listener ][],

    classAttribute          : PropertySourceNormalized<string>,
    styleAttribute          : PropertySourceNormalized<string>,

    classActivators         : [ string, PropertySourceNormalized<boolean> ][],
    styleProperties         : [ string, PropertySourceNormalized<string> ][]

    otherProperties         : [ string, PropertySourceNormalized<unknown> ][],

    reactiveCounter         : number
}


export const isReactive = <V>(source : PropertySourceNormalized<V>) : boolean => {
    return isSyncFunction(source) || (source instanceof BoxUnbound)
}


const isEventHandler = (propertyName : string) : boolean => {
    return /^(on:?|listen:|capture:).*/.test(propertyName)
}

type EventHandlerMatch = { type : 'listeningEventHandler' | 'capturingEventHandler', eventName : string }

const matchEventHandler = (propertyName : string) : EventHandlerMatch | undefined => {
    const match = /^(on:?|listen:|capture:)(.*)/.exec(propertyName)

    return match
        ? {
            type        : match[ 1 ] === 'on:' || match[ 1 ] === 'on' || match[ 1 ] === 'listen:' ? 'listeningEventHandler' : 'capturingEventHandler',
            eventName   : match[ 2 ]
        }
        : undefined
}


export const matchSpecialProperty = (propertyName : string) : [ 'classActivator' | 'styleProperty', string ] | undefined => {
    const match = /(.*?):(.*)/.exec(propertyName)

    if (match) {
        if (match[ 1 ] === 'class') return [ 'classActivator', match[ 2 ] ]
        if (match[ 1 ] === 'style') return [ 'styleProperty', match[ 2 ] ]

        return undefined
    } else
        return undefined
}


export const categorizeProperties = <V>(properties  : Record<string, PropertySource<V>>) : PropertiesCategorizationResult =>
{
    const result      : PropertiesCategorizationResult = {
        events                  : [],
        classAttribute          : undefined,
        styleAttribute          : undefined,
        classActivators         : [],
        styleProperties         : [],
        otherProperties         : [],
        reactiveCounter         : 0
    }

    properties && Object.entries(properties).forEach(entry => {
        const [ key, source ] = entry

        if (isEventHandler(key)) {
            if (!isFunction(source)) throw new Error("Not a function supplied for a event listener property")

            result.events.push(entry as [ string, Listener ])
        }
        else if (key === 'class') {
            result.classAttribute   = source as PropertySourceNormalized<string>

            if (isReactive(source)) result.reactiveCounter++
        }
        else if (key === 'style') {
            result.styleAttribute   = source as PropertySourceNormalized<string>

            if (isReactive(source)) result.reactiveCounter++
        }
        else {
            const specialProperty   = matchSpecialProperty(key)

            if (specialProperty) {
                if (specialProperty[ 0 ] === 'styleProperty') {
                    result.styleProperties.push([ specialProperty[ 1 ], source as PropertySourceNormalized<string>])
                }
                else if (specialProperty[ 0 ] === 'classActivator') {
                    result.classActivators.push([ specialProperty[ 1 ], source as PropertySourceNormalized<boolean> ])
                }
            }
            else {
                result.otherProperties.push(entry)
            }

            if (isReactive(source)) result.reactiveCounter++
        }
    })

    return result
}


//---------------------------------------------------------------------------------------------------------------------
export const addEventListener = (element : Element, name : string, listener : (even : Event) => any) => {
    let eventHandlerMatch : EventHandlerMatch = matchEventHandler(name)

    if (eventHandlerMatch)
        element.addEventListener(eventHandlerMatch.eventName, listener, eventHandlerMatch.type === 'capturingEventHandler')
}


//---------------------------------------------------------------------------------------------------------------------
export const setProperty = (element : Element, name : string, value : unknown) => {
    const specialProperty  = matchSpecialProperty(name)

    if (specialProperty) {
        if (specialProperty[ 0 ] === 'styleProperty') {
            (element as HTMLElement).style.setProperty(specialProperty[ 1 ], value as string)
        }
        else if (specialProperty[ 0 ] === 'classActivator') {
            element.classList.toggle(specialProperty[ 1 ], value as boolean)
        }
    } else {
        if (name === 'class')
            element.className   = value as string
        else
            element[ name ]     = value
    }
}


//---------------------------------------------------------------------------------------------------------------------
export const applyStaticProperties = (element : Element, categorizedProperties : PropertiesCategorizationResult) => {
    if (categorizedProperties.reactiveCounter > 0) throw new Error("Should only be called for static-only properties")

    categorizedProperties.events.forEach(
        ([ propertyName, listener ]) => addEventListener(element, propertyName, listener)
    )

    if (categorizedProperties.classAttribute) setProperty(element, 'class', categorizedProperties.classAttribute)
    if (categorizedProperties.styleAttribute) setProperty(element, 'style', categorizedProperties.styleAttribute);

    [
        ...categorizedProperties.classActivators,
        ...categorizedProperties.styleProperties,
        ...categorizedProperties.otherProperties
    ].forEach(
        ([ propertyName, value ]) => setProperty(element, propertyName, value)
    )
}

export const applyStaticChildren = (element : Element, children : ReactiveNode[]) => {
    children.forEach(child => {
        if (child.reactivity) child.reactivity.effect.read()
    })

    element.append(...children)
}

//---------------------------------------------------------------------------------------------------------------------
export type ElementSource =
    | XmlElement
    | Node
    | string
    | number
    | boolean
    | null
    | undefined
    | (() => ElementSource)
    | BoxUnbound<ElementSource>
    | ElementSource[]

//---------------------------------------------------------------------------------------------------------------------
export type ElementSourceNormalized =
    | Node
    | (() => ElementSource)
    | BoxUnbound<ElementSource>

export type ElementSourceNormalizationResult = { normalized : ElementSourceNormalized[], hasReactivity : boolean }

export const normalizeElementSource = (
    source : ElementSource, result : ElementSourceNormalizationResult = { normalized : [], hasReactivity : false }
)
    : ElementSourceNormalizationResult =>
{
    const normalized        = result.normalized

    if (source instanceof Node) {
        normalized.push(source)
    }
    else if (source == null || source === true || source === false) {
    }
    else if (isNumber(source)) {
        normalized.push(document.createTextNode(String(source)))
    }
    else if (isString(source)) {
        normalized.push(document.createTextNode(source))
    }
    else if (isArray(source)) {
        source.forEach(source => normalizeElementSource(source, result))
    }
    else if (isSyncFunction(source) || (source instanceof BoxUnbound)) {
        normalized.push(source)

        result.hasReactivity = true
    }
    else if (source instanceof XmlElement) {
        normalized.push(convertXmlElement(source))
    }
    else {
        const check : never = source

        throw new Error("Unknown JSX element source")
    }

    return result
}


export const resolveElementSource = (source : ElementSource, result : Node[] = []) : Node[] => {
    if (source instanceof Node) {
        result.push(source)
    }
    else if (source == null || source === true || source === false) {
    }
    else if (isNumber(source)) {
        result.push(document.createTextNode(String(source)))
    }
    else if (isString(source)) {
        result.push(document.createTextNode(source))
    }
    else if (isArray(source)) {
        source.forEach(source => resolveElementSource(source, result))
    }
    else if (source instanceof XmlElement) {
        result.push(convertXmlElement(source))
    }
    else if (isSyncFunction(source)) {
        resolveElementSource(source(), result)
    }
    else {
        resolveElementSource(source.read(), result)
    }

    return result
}


export const convertXmlElement = (source : XmlElement) : Element => {
    const el        = document.createElement(source.tagName)

    Object.entries(source.$attributes || {}).forEach(
        ([ key, value ]) => setProperty(el, key, value)
    )

    el.append(...Array.from(source.childNodes).map(childNode =>
        isString(childNode) ? document.createTextNode(childNode) : convertXmlElement(childNode)
    ))

    return el
}

//---------------------------------------------------------------------------------------------------------------------
export const querySelector = <C extends Component>(el : Element, selector : string) : ComponentElement<C> => el.querySelector(selector)

//---------------------------------------------------------------------------------------------------------------------
export namespace ChronoGraphJSX {

    export const FragmentSymbol  = Symbol('FragmentSymbol')

    export function createElement (
        tagName         : string | typeof FragmentSymbol | typeof Component,
        attributes      : Record<string, PropertySource<unknown>>,
        ...children     : ElementSource[]
    )
        : ReactiveElement | (() => Node[]) | Node[]
    {
        if (isString(tagName)) {
            const element               = document.createElement(tagName)

            const categorizedProperties = categorizeProperties(attributes)
            const normalizedChildren    = normalizeElementSource(children)

            if (categorizedProperties.reactiveCounter === 0 && !normalizedChildren.hasReactivity) {
                applyStaticProperties(element, categorizedProperties)

                applyStaticChildren(element, normalizedChildren.normalized as ReactiveNode[])
            }
            else {
                ElementReactivity.fromJSX(element, categorizedProperties, normalizedChildren)
            }

            return element
        }
        else if (tagName === FragmentSymbol) {
            const normalizedChildren    = normalizeElementSource(children)

            if (normalizedChildren.hasReactivity) {
                return () => resolveElementSource(normalizedChildren.normalized)
            } else {
                return normalizedChildren.normalized as Node[]
            }
        }
        else if (isSyncFunction(tagName) && (tagName.prototype instanceof Component)) {
            const component     = tagName.new(Object.assign({}, attributes, { children }))

            return component.el
        }
        else {
            throw new Error("Unknown JSX source")
        }
    }
}


//---------------------------------------------------------------------------------------------------------------------
type DOMElement = Element

export declare namespace ChronoGraphJSX {
    namespace JSX {
        type Element        = DOMElement

        interface ElementClass extends Component {
        }

        interface ElementAttributesProperty {
            props
        }

        // https://github.com/microsoft/TypeScript/issues/38108
        // interface ElementChildrenAttribute {
        //     childNodes
        // }
    }
}


