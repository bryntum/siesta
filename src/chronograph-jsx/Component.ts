import { CalculableBox } from "@bryntum/chronograph/src/chrono2/data/CalculableBox.js"
import { globalGraph } from "@bryntum/chronograph/src/chrono2/graph/Graph.js"
import { Base } from "@bryntum/chronograph/src/class/Base.js"
import { ClassUnion, Mixin } from "@bryntum/chronograph/src/class/Mixin.js"
import { Entity } from "@bryntum/chronograph/src/replica2/Entity.js"
import { Replica } from "@bryntum/chronograph/src/replica2/Replica.js"
import { categorizeProperties, ElementSource, Listener, PropertiesCategorizationResult, PropertySourceNormalized } from "./ChronoGraphJSX.js"
import { ElementReactivity, ReactiveElement } from "./ElementReactivity.js"


//---------------------------------------------------------------------------------------------------------------------
export class Component extends Mixin(
    [ Entity, ElementReactivity, Base ],
    (base : ClassUnion<typeof Entity, typeof ElementReactivity, typeof Base>) =>

    class Component extends base {
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

        children    : ElementSource[]       = []

        get el () : ReactiveElement {
            if (this.$el !== undefined) return this.$el

            const el                    = this.$el = this.render()

            let plainElement            = !el.reactivity

            if (plainElement) el.reactivity = this

            const reactivity            = el.reactivity

            const categorizedProperties = this.categorizedProperties
            this.categorizedProperties  = undefined

            reactivity.adoptReactiveProperties(categorizedProperties)

            if (plainElement)
                reactivity.$effect      = super.effect
            else
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

        categorizedProperties    : PropertiesCategorizationResult     = undefined


        initialize (props? : Partial<Component>) {
            const categorizedProperties     = this.categorizedProperties = categorizeProperties(props)

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


//---------------------------------------------------------------------------------------------------------------------
export class WebComponent extends Mixin(
    [ Entity, HTMLElement ],
    (base : ClassUnion<typeof HTMLElement, typeof Entity>) =>

    class WebComponent extends base {

        initialize (props? : Partial<this>) {
            props && Object.assign(this, props)

            this.enterGraph(globalGraph as Replica)
        }


        static new<T extends typeof Base> (this : T, props? : Partial<InstanceType<T>>) : InstanceType<T> {
            const instance      = new this() as InstanceType<T>

            instance.initialize(props)

            return instance
        }
    }
) {}


export const tag = (tagName : string) : ClassDecorator => {
    // @ts-ignore : https://github.com/Microsoft/TypeScript/issues/29828
    return <T extends typeof WebComponent>(target : T) : T => {
        customElements.define(tagName, target)

        return target
    }
}
