import { AnyConstructor, Mixin } from "../class/Mixin.js"
import { ArbitraryObjectKey, isAtomicValue, typeOf, uppercaseFirst } from "./Helpers.js"


//---------------------------------------------------------------------------------------------------------------------
export class DataVisitor extends Mixin(
    [],
    (base : AnyConstructor) =>

    class DataVisitor extends base {

        maxDepth        : number        = Number.MAX_SAFE_INTEGER

        visited         : Set<unknown>  = new Set()


        visit (value : unknown, depth : number = 0) {
            if (depth > this.maxDepth) {
                this.visitOutOfDepthValue(value, depth + 1)
            }
            else if (isAtomicValue(value)) {
                this.visitAtomicValueEntry(value, depth + 1)
            }
            else if (this.visited.has(value)) {
                this.visitAlreadyVisited(value, depth + 1)
            } else {
                this.visitNotVisited(value, depth + 1)
            }
        }


        visitOutOfDepthValue (value : unknown, depth : number) {
        }


        visitAtomicValue (value : unknown, depth : number) {
        }


        visitAtomicValueEntry (value : unknown, depth : number) {
            const specificVisitorMethod     = `visit${ uppercaseFirst(typeOf(value)) }`

            const visitMethod       = this[ specificVisitorMethod ] || this.visitAtomicValue

            visitMethod.call(this, value, depth)
        }


        visitAlreadyVisited (value : unknown, depth : number) {
        }


        visitNotVisited (value : unknown, depth : number) {
            this.visited.add(value)

            const specificVisitorMethod     = `visit${ uppercaseFirst(typeOf(value)) }`

            const visitMethod       = this[ specificVisitorMethod ] || this.visitObject

            visitMethod.call(this, value, depth)
        }


        visitObject (object : object, depth : number) {
            const entries = Object.entries(object)

            entries.forEach(([ key, value ], index) => {
                this.visitObjectEntryKey(key, value, object, index, entries, depth)
                this.visitObjectEntryValue(key, value, object, index, entries, depth)
            })
        }

        visitObjectEntryKey (
            key : ArbitraryObjectKey, value : unknown, object : object, index : number,
            entries : [ ArbitraryObjectKey, unknown ][], depth : number
        ) {
            this.visitAtomicValue(key, depth)
        }

        visitObjectEntryValue (
            key : ArbitraryObjectKey, value : unknown, object : object, index : number,
            entries : [ ArbitraryObjectKey, unknown ][], depth : number
        ) {
            this.visit(value, depth)
        }


        visitArray (array : unknown[], depth : number) {
            array.forEach((value, index) => this.visitArrayEntry(value, array, index, depth))
        }

        visitArrayEntry<V> (value : V, array : V[], index : number, depth : number) {
            this.visit(value, depth)
        }


        visitSet (set : Set<unknown>, depth : number) {
            let index : number      = 0

            for (const value of set) this.visitSetElement(value, set, index++, depth)
        }

        visitSetElement<V> (value : V, set : Set<V>, index : number, depth : number) {
            this.visit(value, depth)
        }


        visitMap (map : Map<unknown, unknown>, depth : number) {
            let index : number      = 0

            for (const [ key, value ] of map) {
                this.visitMapEntryKey(key, value, map, index, depth)
                this.visitMapEntryValue(key, value, map, index, depth)
            }
        }

        visitMapEntryKey<K, V> (key : K, value : V, map : Map<K, V>, index : number, depth : number) {
            this.visit(value, depth)
        }

        visitMapEntryValue<K, V> (key : K, value : V, map : Map<K, V>, index : number, depth : number) {
            this.visit(value, depth)
        }
    }
){}

