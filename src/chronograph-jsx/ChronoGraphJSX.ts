import { CalculationFunction, CalculationModeSync } from '@bryntum/chronograph/src/chrono2/CalculationMode.js'
import { BoxUnbound } from '@bryntum/chronograph/src/chrono2/data/Box.js'
import { CalculableBox, CalculableBoxUnbound } from '@bryntum/chronograph/src/chrono2/data/CalculableBox.js'
import { AnyFunction } from "../class/Mixin.js"
import { isArray, isNumber, isString, isSyncFunction } from "../util/Typeguards.js"
import { Component } from "./WebComponent.js"


//---------------------------------------------------------------------------------------------------------------------
export class ElementReactivity extends CalculableBox {
    lazy        : boolean       = false

    element     : Element       = undefined


    setAttribute (name : string, value : string) {
        if (value == null)
            this.element.removeAttribute(name)
        else {
            // this.element.setAttribute(name, value)

            if (name === 'class')
                this.element.className = value
            else
                this.element[ name ] = value
        }
    }


    resolveAttributeSource (src : AttributeSource) : string {
        let source : AttributeSource        = src

        while (!isString(source)) {
            if (source instanceof BoxUnbound) {
                source  = source.read()
            }
            else if (isSyncFunction(source)) {
                source  = source()
            }
        }

        return source
    }


    applyAttributes (attributes : Record<string, AttributeSource>) : CalculableBoxUnbound[] {
        const boxes : CalculableBoxUnbound[]        = []

        Object.entries(attributes).forEach(([ name, source ] : [ string, AttributeSource ]) => {
            const eventMatch     = /on(\w+)/.exec(name)

            if (eventMatch) {
                this.element.addEventListener(eventMatch[ 1 ], source as AnyFunction)
            }
            else if (isString(source)) {
                this.setAttribute(name, source)
            }
            else {
                const box = CalculableBox.new({
                    persistent  : true,
                    lazy        : false,
                    calculation : () => {
                        return this.resolveAttributeSource(source)
                    }
                })

                box.onCommitValueOptimistic = (value) => this.setAttribute(name, value)
                // globalGraph.addAtom(box)

                boxes.push(box)
            }
        })

        return boxes
    }


    static from<T extends typeof ElementReactivity> (this : T, element : Element, attributes : Record<string, AttributeSource>, ...children : ElementSource[]) : InstanceType<T> {
        // @ts-ignore
        const reactivity        = this.new() as InstanceType<T>

        reactivity.element      = element

        const attributeEffects  = reactivity.applyAttributes(attributes || {})

        const childNodesList    = NodesListReactivity.from(children)

        // globalGraph.addAtom(childNodesList)

        reactivity.calculation  = () => {
            attributeEffects.forEach(effect => effect.read())

            const childNodes    = childNodesList.read()

            childNodes.forEach((childNode : ReactiveNode) => {
                if (childNode.reactivity) {
                    childNode.reactivity.persistent = false

                    childNode.reactivity.read()
                }
            })

            return childNodes
        }

        reactivity.onCommitValueOptimistic = (childNodes : ReactiveNode[]) => reconcileChildNodes(element, childNodes)

        return reactivity
    }
}


export interface ReactiveNode extends Node {
    reactivity      : CalculableBoxUnbound
}


export class NodesListReactivity extends CalculableBox<Node[]> {
    lazy                : boolean                               = false

    normalizedSources   : (Node | BoxUnbound<ElementSource>)[]       = undefined


    $calculation        : CalculationFunction<Node[], CalculationModeSync> =
        () => this.normalizedSources.flatMap(source => this.resolveElementSource(source))


    resolveElementSource (source : ElementSource) : Node[] {
        if (source instanceof Node) {
            return [ source ]
        }
        else if (source == null || source === true || source === false) {
            return []
        }
        else if (isNumber(source)) {
            return [ document.createTextNode(String(source)) ]
        }
        else if (isString(source)) {
            return [ document.createTextNode(source) ]
        }
        else if (isArray(source)) {
            return source.flatMap(this.resolveElementSource, this)
        }
        else if (isSyncFunction(source)) {
            return this.resolveElementSource(source())
        }
        else {
            return this.resolveElementSource(source.read())
        }
    }


    normalizeElementSource (source : ElementSource) : (Node | BoxUnbound<ElementSource>)[] {
        if (source instanceof Node) {
            return [ source ]
        }
        else if (source == null || source === true || source === false) {
            return []
        }
        else if (isNumber(source)) {
            return [ document.createTextNode(String(source)) ]
        }
        else if (isString(source)) {
            return [ document.createTextNode(source) ]
        }
        else if (isArray(source)) {
            return source.flatMap(this.normalizeElementSource, this)
        }
        else if (isSyncFunction(source)) {
            const box = CalculableBox.new({
                persistent  : true,
                lazy        : false,
                calculation : () => this.resolveElementSource(source)
            })
            // globalGraph.addAtom(box)

            return [ box ]
        }
        else {
            return [ source ]
        }
    }


    static from<T extends typeof NodesListReactivity> (this : T, source : ElementSource) : InstanceType<T> {
        // @ts-ignore
        const instance              = this.new() as InstanceType<T>

        instance.normalizedSources  = instance.normalizeElementSource(source)

        return instance
    }
}


export type AttributeSource =
    | string
    | (() => string)
    | BoxUnbound<AttributeSource>


export type PropertySource<V> =
    | V
    | (() => V)
    | BoxUnbound<V>

export type ElementSource =
    | Node
    | string
    | number
    | boolean
    | null
    | undefined
    | (() => ElementSource)
    | BoxUnbound<ElementSource>
    | ElementSource[]


// interface Component<Props extends Record<string, unknown> = Record<string, unknown>> {
//     render (props : Props) : Element
// }
//
//
// export type ComponentConstructor<Props extends Record<string, unknown> = Record<string, unknown>> = new () => Component<Props>


export namespace ChronoGraphJSX {

    export const FragmentSymbol  = Symbol('FragmentSymbol')

    export function createElement (
        tagName         : string | typeof FragmentSymbol | typeof Component,
        attributes      : Record<string, AttributeSource>,
        ...children     : ElementSource[]
    )
        : Element | NodesListReactivity
    {
        if (isString(tagName)) {
            const element       = document.createElement(tagName)

            const reactivity    = ElementReactivity.from(element, attributes, ...children)

            // globalGraph.addAtom(reactivity)

            // @ts-ignore
            element.reactivity  = reactivity

            // globalGraph.untracked(() => reactivity.read())
            reactivity.read()

            return element
        }
        else if (tagName === FragmentSymbol) {
            const childNodesList    = NodesListReactivity.from(children)

            // globalGraph.addAtom(childNodesList)

            return childNodesList
        }
        else if (isSyncFunction(tagName) && (tagName.prototype instanceof Component)) {
            const component     = tagName.new(Object.assign({}, attributes, { children }))

            return component.el
        }
    }
}


//---------------------------------------------------------------------------------------------------------------------
type DOMElement = Element

export declare namespace ChronoGraphJSX {
    namespace JSX {
        type Element        = DOMElement

        // interface ElementClass {
        //     render (props : any) : Element
        // }

        interface ElementAttributesProperty {
            props
        }

        // https://github.com/microsoft/TypeScript/issues/38108
        // interface ElementChildrenAttribute {
        //     childNodes
        // }
    }
}


// Slightly modified version of: https://github.com/ryansolid/dom-expressions/blob/main/packages/dom-expressions/src/reconcile.js
export function reconcileChildNodes (parentNode : Element, newNodes : Node[]) {
    const prevNodes     = Array.from(parentNode.childNodes)

    const bLength       = newNodes.length

    let aEnd            = prevNodes.length
    let bEnd            = bLength
    let aStart          = 0
    let bStart          = 0

    if (aEnd === 0 || bEnd === 0) {
        // @ts-ignore
        parentNode.replaceChildren(...newNodes)

        return
    }

    const after         = prevNodes[ aEnd - 1 ].nextSibling

    let map : Map<Node, number>     = null

    while (aStart < aEnd || bStart < bEnd) {
        // common prefix
        while (prevNodes[ aStart ] === newNodes[ bStart ]) {
            aStart++
            bStart++
            if (aStart >= aEnd && bStart >= bEnd) return
        }

        // common suffix
        while (prevNodes[ aEnd - 1 ] === newNodes[ bEnd - 1 ]) {
            aEnd--
            bEnd--
            if (aStart >= aEnd && bStart >= bEnd) return
        }

        // append
        if (aEnd === aStart) {
            const node = bEnd < bLength
                ?
                    bStart
                        ? newNodes[ bStart - 1 ].nextSibling
                        : newNodes[ bEnd - bStart ]
                :
                    after

            while (bStart < bEnd) parentNode.insertBefore(newNodes[ bStart++ ], node)
        }
        // remove
        else if (bEnd === bStart) {
            while (aStart < aEnd) {
                if (!map || !map.has(prevNodes[ aStart ])) parentNode.removeChild(prevNodes[ aStart ])
                aStart++
            }
        }
        // swap backward
        else if (prevNodes[ aStart ] === newNodes[ bEnd - 1 ] && newNodes[ bStart ] === prevNodes[ aEnd - 1 ]) {
            const node          = prevNodes[ --aEnd ].nextSibling

            parentNode.insertBefore(newNodes[ bStart++ ], prevNodes[ aStart++ ].nextSibling)
            parentNode.insertBefore(newNodes[ --bEnd ], node)

            // @ts-ignore
            prevNodes[ aEnd ]   = newNodes[ bEnd ]
        }
        // fallback to map
        else {
            if (!map) {
                map         = new Map()
                let i       = bStart

                while (i < bEnd) map.set(newNodes[ i ], i++)
            }

            const index     = map.get(prevNodes[ aStart ])

            if (index !== undefined) {
                if (bStart < index && index < bEnd) {
                    let i           = aStart
                    let sequence    = 1

                    while (++i < aEnd && i < bEnd) {
                        const t     = map.get(prevNodes[ i ])

                        if (t == null || t !== index + sequence) break

                        sequence++
                    }

                    if (sequence > index - bStart) {
                        const node = prevNodes[ aStart ]

                        // ??? multiple `insertBefore` calls with the same node?
                        while (bStart < index) parentNode.insertBefore(newNodes[ bStart++ ], node)
                    } else
                        parentNode.replaceChild(newNodes[ bStart++ ], prevNodes[ aStart++ ])
                } else
                    aStart++
            } else
                parentNode.removeChild(prevNodes[ aStart++ ])
        }
    }
}
