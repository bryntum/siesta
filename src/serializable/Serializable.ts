import { AnyConstructor, Mixin } from "../class/Mixin.js"


//---------------------------------------------------------------------------------------------------------------------
export class Serializable extends Mixin(
    [],
    (base : AnyConstructor) =>

    class Serializable extends base {
        $class      : string

        $excludedProperties     : object


        toJSON (key : string) : Partial<this> {
            if (!this.$class) throw new Error(`Missing serializable class id: ${this.constructor}`)

            const json : Partial<this> = {}

            for (const [ key, propValue ] of Object.entries(this)) {
                if (!this.$excludedProperties || !this.$excludedProperties[ key ]) json[ key ] = propValue
            }

            json.$class = this.$class

            return json
        }


        static fromJSON<T extends typeof Serializable> (this : T, json : string) : InstanceType<T> {
            return JSON.parse(json, reviver)
        }
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
const serializableClasses = new Map<string, typeof Serializable>()

export const registerSerializableClass = (id : string, cls : typeof Serializable) => {
    cls.prototype.$class        = id

    if (serializableClasses.has(id) && serializableClasses.get(id) !== cls) {
        throw new Error(`Serializable class with id: [${id}] already registered`)
    }

    serializableClasses.set(id, cls)
}

export const lookupSerializableClass = (id : string) : typeof Serializable => {
    return serializableClasses.get(id)
}


//---------------------------------------------------------------------------------------------------------------------
export const exclude = () : PropertyDecorator => {

    return function (target : Serializable, propertyKey : string) : void {
        if (!target.hasOwnProperty('$excludedProperties')) {
            target.$excludedProperties = Object.create(target.$excludedProperties || null)
        }

        target.$excludedProperties[ propertyKey ] = true
    }
}


//---------------------------------------------------------------------------------------------------------------------
export const reviver = function (key : string | number, value : number | string | boolean | object) {
    if (typeof value === 'object' && value !== null) {
        const $class        = (value as any).$class

        if ($class !== undefined) {
            const cls       = lookupSerializableClass($class)

            if (!cls) throw new Error(`Unknown serializable class id: ${$class}`)

            const instance  = Object.create(cls.prototype)

            for (const [ key, propValue ] of Object.entries(value)) {
                if (key !== '$class') instance[ key ] = propValue
            }

            return instance
        }
    }

    return value
}
