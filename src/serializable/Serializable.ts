import { AnyConstructor, Mixin } from "../class/Mixin.js"


//---------------------------------------------------------------------------------------------------------------------
export class Serializable extends Mixin(
    [],
    (base : AnyConstructor) =>

    class Serializable extends base {
        $class      : string


        toJSON (key : string) : Partial<this> {
            const json  = Object.assign({}, this)

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

    serializableClasses.set(id, cls)
}

export const lookupSerializableClass = (id : string) : typeof Serializable => {
    return serializableClasses.get(id)
}


//---------------------------------------------------------------------------------------------------------------------
export const reviver = function (key : string | number, value : number | string | boolean | object) {
    if (typeof value === 'object') {
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
