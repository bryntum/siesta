import { CalculableBox } from "@bryntum/chronograph/src/chrono2/data/CalculableBox.js"
import { globalGraph } from "@bryntum/chronograph/src/chrono2/graph/Graph.js"
import { Base } from "@bryntum/chronograph/src/class/Base.js"
import { Entity } from "@bryntum/chronograph/src/replica2/Entity.js"
import { Replica } from "@bryntum/chronograph/src/replica2/Replica.js"
import { AnyConstructor, ClassUnion, Mixin } from "typescript-mixin-class"
import { categorizeProperties, ElementSource, Listener, PropertiesCategorizationResult, PropertySourceNormalized } from "./ChronoGraphJSX.js"
import { ElementReactivity, ReactiveElement } from "./ElementReactivity.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class ComponentCommon extends Mixin(
    [],
    (base : ClassUnion) =>

    class ComponentCommon extends base {
        props : {
            class?          : PropertySourceNormalized<string>
            style?          : PropertySourceNormalized<string>
        } & {
            [ key in `style:${ string }` ]? : PropertySourceNormalized<string>
        } & {
            [ key in `class:${ string }` ]? : PropertySourceNormalized<boolean>
        } & {
            [ key in `on${ string }` | `listen:${ string }` | `capture:${ string }` ]? : Listener
        }
        class           : PropertySourceNormalized<string>
        style           : PropertySourceNormalized<string>

        // TODO unify with `children` in Component
        childrenNodes   : ElementSource         = []

        categorizedProperties    : PropertiesCategorizationResult     = undefined
    }
) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class Component extends Mixin(
    [ ComponentCommon, Entity, ElementReactivity, Base ],
    (base : ClassUnion<typeof ComponentCommon, typeof Entity, typeof ElementReactivity, typeof Base>) =>

    class Component extends base {

        children        : ElementSource[]       = []

        get el () : ReactiveElement {
            if (this.$el !== undefined) return this.$el

            const el                    = this.$el = this.render()

            let plainElement            = !el.reactivity

            if (plainElement) el.reactivity = this

            const reactivity            = el.reactivity

            const categorizedProperties = this.categorizedProperties
            this.categorizedProperties  = undefined

            reactivity.adoptReactiveProperties(categorizedProperties)

            if (plainElement) {
                const existingClasses   = Array.from(el.classList)
                existingClasses.reverse()

                existingClasses.forEach(cls => reactivity.addClassAttributeSource(cls, true))

                reactivity.addStyleAttributeSource(el.getAttribute('style'), true)

                reactivity.$effect = super.effect
            } else
                reactivity.effect

            // @ts-ignore
            el.comp                     = this

            return el
        }

        set el (value : Element) {
        }

        override get effect () : CalculableBox<Node[]> {
            if (this.$effect !== undefined) return this.$effect

            return this.$effect = this.el.reactivity.effect
        }


        initialize (props? : Partial<Component>) {
            const categorizedProperties     = this.categorizedProperties = categorizeProperties(props)

            // TODO should filter the reactive sources from the `otherProperties`
            super.initialize(Object.fromEntries(categorizedProperties.otherProperties))
            categorizedProperties.otherProperties   = []

            this.enterGraph(globalGraph as Replica)
        }


        render () : ReactiveElement {
            throw new Error("Abstract method called")
        }


        destroy () {
        }
    }
) {}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class WebComponent extends Mixin(
    [ ComponentCommon, Entity, HTMLElement ],
    (base : ClassUnion<typeof ComponentCommon, typeof HTMLElement, typeof Entity>) =>

    class WebComponent extends base {

        reactivity      : ElementReactivity         = undefined


        initialize (props? : Partial<this>) {
            this.attachShadow({ mode : 'open' })

            const categorizedProperties     = this.categorizedProperties = categorizeProperties(props)

            Object.assign(this, Object.fromEntries(categorizedProperties.otherProperties))
            categorizedProperties.otherProperties   = []

            this.enterGraph(globalGraph as Replica)

            const reactivity    = this.reactivity     = new ElementReactivity()

            reactivity.el       = this

            reactivity.adoptReactiveProperties(categorizedProperties)
        }


        static new<T extends typeof WebComponent> (this : T, props? : Partial<InstanceType<T>>) : InstanceType<T> {
            const instance      = new this() as InstanceType<T>

            instance.initialize(props)

            return instance
        }


        render () : ElementSource {
            return undefined
        }


        connectedCallback () {

        }


        disconnectedCallback () {

        }
    }
) {}


export const custom_element = (tagName : string) : ClassDecorator => {
    // @ts-ignore : https://github.com/Microsoft/TypeScript/issues/29828
    return <T extends typeof WebComponent>(target : T) : T => {
        customElements.define(tagName, target)

        return target
    }
}
