import { Entity } from "@bryntum/chronograph/src/replica2/Entity.js"
import { ClassUnion, Mixin } from "@bryntum/chronograph/src/class/Mixin.js"
import { Base } from "@bryntum/chronograph/src/class/Base.js"
import { globalGraph } from "@bryntum/chronograph/src/chrono2/graph/Graph.js"
import { Replica } from "@bryntum/chronograph/src/replica2/Replica.js"
import { ChronoGraphJSX, ElementSource } from "./ChronoGraphJSX.js"


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


export class Component extends Mixin(
    [ Entity, Base ],
    (base : ClassUnion<typeof Entity, typeof Base>) =>

    class Component extends base {

        children    : ElementSource[]       = []

        $el         : Element               = undefined

        get el () : Element {
            if (this.$el !== undefined) return this.$el

            return this.$el = this.render()
        }

        set el (value : Element) {
            this.$el    = value
        }


        initialize (props? : Partial<Component>) {
            super.initialize(props)

            this.enterGraph(globalGraph as Replica)
        }


        render () : Element {
            throw new Error("Abstract method called")
        }


        destroy () {
        }
    }
) {}


