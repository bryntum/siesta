import { BoxUnbound } from '@bryntum/chronograph/src/chrono2/data/Box.js'
import { CalculableBox } from '@bryntum/chronograph/src/chrono2/data/CalculableBox.js'
import { ClassUnion, Mixin } from "@bryntum/chronograph/src/class/Mixin.js"
import {
    ElementSourceNormalizationResult,
    ElementSourceNormalized,
    isReactive,
    Listener,
    PropertiesCategorizationResult,
    PropertySourceNormalized,
    resolveElementSource,
    resolvePropertySource,
    setProperty
} from "./ChronoGraphJSX.js"
import { Component } from "./Component.js"


//---------------------------------------------------------------------------------------------------------------------
export class ElementReactivity extends Mixin(
    [],
    (base : ClassUnion) =>

    class ElementReactivity extends base {
        $el         : ReactiveElement               = undefined

        get el () : ReactiveElement {
            return this.$el
        }

        set el (value : Element) {
            this.$el    = value
        }

        eventListeners          : [ string, Listener ][]                = undefined

        classAttributeSources   : PropertySourceNormalized<string>[]    = undefined
        styleAttributeSources   : PropertySourceNormalized<string>[]    = undefined

        classActivators         : Record<string, PropertySourceNormalized<boolean>> = undefined
        styleProperties         : Record<string, PropertySourceNormalized<string>>  = undefined

        reactiveChildren        : ElementSourceNormalized[]     = undefined


        addEventListener (entry : [ string, Listener ]) {
            if (!this.eventListeners) this.eventListeners = []

            this.eventListeners.push(entry)
        }


        addClassAttributeSource (source : PropertySourceNormalized<string>) {
            if (!this.classAttributeSources) this.classAttributeSources = []

            this.classAttributeSources.push(source)
        }


        addStyleAttributeSource (source : PropertySourceNormalized<string>) {
            if (!this.styleAttributeSources) this.styleAttributeSources = []

            this.styleAttributeSources.push(source)
        }


        addClassActivator (className : string, source : PropertySourceNormalized<boolean>) {
            if (!this.classActivators) this.classActivators = {}

            this.classActivators[ className ] = source
        }


        addStyleProperty (propertyName : string, source : PropertySourceNormalized<string>) {
            if (!this.styleProperties) this.styleProperties = {}

            this.styleProperties[ propertyName ] = source
        }


        adoptReactiveProperties (categorizedProperties : PropertiesCategorizationResult) {
            categorizedProperties.events.forEach(entry => this.addEventListener(entry))

            categorizedProperties.classActivators.forEach(([ key, source ]) => this.addClassActivator(key, source))
            categorizedProperties.styleProperties.forEach(([ key, source ]) => this.addStyleProperty(key, source))

            if (categorizedProperties.classAttribute) this.addClassAttributeSource(categorizedProperties.classAttribute)
            if (categorizedProperties.styleAttribute) this.addStyleAttributeSource(categorizedProperties.styleAttribute)
        }


        $classAttributeBox          : BoxUnbound<string>            = undefined

        get classAttributeBox () : BoxUnbound<string> | null {
            if (this.$classAttributeBox !== undefined) return this.$classAttributeBox

            if (!this.classAttributeSources) return this.$classAttributeBox = null

            if (this.classAttributeSources.every(source => !isReactive(source))) {
                setProperty(this.el, 'class', this.classAttributeSources.join(' '))

                return this.$classAttributeBox = null
            } else {
                const box       = CalculableBox.new({
                    calculation : () => this.classAttributeSources.map(resolvePropertySource).join(' ')
                })

                box.commitValueOptimisticHook.on((self, newValue, oldValue) => setProperty(this.el, 'class', newValue))

                return this.$classAttributeBox = box
            }
        }

        $styleAttributeBox      : BoxUnbound<string>            = undefined

        get styleAttributeBox () : BoxUnbound<string> | null {
            if (this.$styleAttributeBox !== undefined) return this.$styleAttributeBox

            if (!this.styleAttributeSources) return this.$styleAttributeBox = null

            if (this.styleAttributeSources.every(source => !isReactive(source))) {
                setProperty(this.el, 'style', this.styleAttributeSources.join(';'))

                return this.$styleAttributeBox = null
            } else {
                const box       = CalculableBox.new({
                    calculation : () => this.styleAttributeSources.map(resolvePropertySource).join(';')
                })

                box.commitValueOptimisticHook.on((self, newValue, oldValue) => setProperty(this.el, 'style', newValue))

                return this.$styleAttributeBox = box
            }
        }


        getClassActivatorBoxes () : BoxUnbound<boolean>[] {
            if (!this.classActivators) return []

            const reactive : BoxUnbound<boolean>[]      = []

            Object.entries(this.classActivators).forEach(([ prop, source ]) => {
                if (!isReactive(source)) {
                    setProperty(this.el, prop, source)
                }
                else {
                    const box       = CalculableBox.new({
                        calculation : () => {
                            if (this.classAttributeBox) this.classAttributeBox.read()

                            return resolvePropertySource(source)
                        }
                    })

                    box.commitValueOptimisticHook.on(
                        (self, newValue, oldValue) => this.el.classList.toggle(prop, newValue)
                    )

                    reactive.push(box)
                }
            })

            return reactive
        }


        getStylePropertiesBoxes () : BoxUnbound<string>[] {
            if (!this.styleProperties) return []

            const reactive : BoxUnbound<string>[]      = []

            Object.entries(this.styleProperties).forEach(([ prop, source ]) => {
                if (!isReactive(source)) {
                    setProperty(this.el, prop, source)
                }
                else {
                    const box       = CalculableBox.new({
                        calculation : () => {
                            if (this.styleAttributeBox) this.styleAttributeBox.read()

                            return resolvePropertySource(source)
                        }
                    })

                    box.commitValueOptimisticHook.on(
                        (self, newValue, oldValue) => (this.el as HTMLElement).style.setProperty(prop, newValue)
                    )

                    reactive.push(box)
                }
            })

            return reactive
        }


        $effect : CalculableBox<Node[]>   = undefined

        get effect () : CalculableBox<Node[]> {
            if (this.$effect !== undefined) return this.$effect

            let reactiveProperties : BoxUnbound<unknown>[]  = [
                this.classAttributeBox,
                this.styleAttributeBox,
                ...this.getClassActivatorBoxes(),
                ...this.getStylePropertiesBoxes()
            ]

            this.$effect = CalculableBox.new<Node[]>({
                lazy        : false,

                // HACK, in theory should not trigger the `commitValueOptimisticHook` on the same value
                // this is to avoid recalculating parent effects
                equality    : () => true,

                calculation : () => {
                    reactiveProperties.forEach(box => box && box.read())

                    if (this.reactiveChildren) {
                        const children  = resolveElementSource(this.reactiveChildren)

                        children.forEach((childNode : ReactiveNode) => {
                            if (childNode.reactivity) childNode.reactivity.effect.read()
                        })

                        return children
                    }
                }
            })

            if (this.reactiveChildren) this.$effect.commitValueOptimisticHook.on(
                (self, newValue, oldValue) => reconcileChildNodes(this.el, newValue)
            )

            return this.$effect
        }


        static fromJSX<T extends typeof ElementReactivity> (
            this                    : T,
            element                 : Element,
            categorizedProperties   : PropertiesCategorizationResult,
            normalizedChildren      : ElementSourceNormalizationResult
        )
            : InstanceType<T>
        {
            const reactivity                = new this as InstanceType<T>

            // @ts-ignore
            element.reactivity              = reactivity
            reactivity.el                   = element

            reactivity.adoptReactiveProperties(categorizedProperties)

            if (normalizedChildren.hasReactivity) {
                reactivity.reactiveChildren = normalizedChildren.normalized
            } else {
                element.append(...normalizedChildren.normalized as Node[])
            }

            reactivity.effect

            return reactivity
        }
    }
) {}


export interface ReactiveNode extends Node {
    reactivity?     : ElementReactivity
}

export interface ReactiveElement extends Element {
    reactivity?     : ElementReactivity
}

export interface ComponentElement<C extends Component> extends ReactiveElement {
    comp            : C
}

//---------------------------------------------------------------------------------------------------------------------
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
