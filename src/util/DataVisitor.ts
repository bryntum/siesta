import { AnyConstructor, Mixin } from "../class/Mixin.js"
import { ArbitraryObjectKey, isAtomicValue, typeOf, uppercaseFirst } from "./Helpers.js"

// TODO should return from every method similar to how its done in the Data.Visitor2
// this will allow to clone the structure for example

const VisitInProgress = Symbol('VisitInProgress')

//---------------------------------------------------------------------------------------------------------------------
export class DataVisitor extends Mixin(
    [],
    (base : AnyConstructor) =>

    class DataVisitor extends base {

        maxDepth        : number                    = Number.MAX_SAFE_INTEGER

        visited         : Map<unknown, unknown>     = new Map()


        beforeVisit (value : unknown, depth : number) {
            this.visited.set(value, VisitInProgress)
        }


        afterVisit (value : unknown, depth : number, visitResult : unknown) {
            this.visited.set(value, visitResult)
        }


        visit (value : unknown, depth : number = 0) {
            if (depth > this.maxDepth) {
                return this.visitOutOfDepthValue(value, depth + 1)
            }
            else if (isAtomicValue(value)) {
                return this.visitAtomicValueEntry(value, depth + 1)
            }
            else if (this.visited.has(value)) {
                return this.visitAlreadyVisited(value, depth + 1)
            } else {
                return this.visitNotVisited(value, depth + 1)
            }
        }


        visitOutOfDepthValue (value : unknown, depth : number) {
            return value
        }


        visitAtomicValue (value : unknown, depth : number) {
            return value
        }


        visitAtomicValueEntry (value : unknown, depth : number) {
            const specificVisitorMethod     = `visit${ uppercaseFirst(typeOf(value)) }`

            const visitMethod       = this[ specificVisitorMethod ] || this.visitAtomicValue

            return visitMethod.call(this, value, depth)
        }


        visitAlreadyVisited (value : unknown, depth : number) {
            return value
        }


        visitNotVisited (value : unknown, depth : number) {
            this.beforeVisit(value, depth)

            const specificVisitorMethod     = `visit${ uppercaseFirst(typeOf(value)) }`

            const visitMethod               = this[ specificVisitorMethod ] || this.visitObject

            const visitResult               = visitMethod.call(this, value, depth)

            this.afterVisit(value, depth, visitResult)

            return visitResult
        }


        visitObject (object : object, depth : number) : any {
            const entries = Object.entries(object)

            entries.forEach(([ key, value ], index) => {
                this.visitObjectEntryKey(key, value, object, index, entries, depth)
                this.visitObjectEntryValue(key, value, object, index, entries, depth)
            })

            return object
        }

        visitObjectEntryKey (
            key     : ArbitraryObjectKey, value : unknown, object : object, index : number,
            entries : [ ArbitraryObjectKey, unknown ][], depth : number
        ) {
            this.visitAtomicValue(key, depth)
        }

        visitObjectEntryValue (
            key     : ArbitraryObjectKey, value : unknown, object : object, index : number,
            entries : [ ArbitraryObjectKey, unknown ][], depth : number
        ) {
            this.visit(value, depth)
        }


        visitArray (array : unknown[], depth : number) : any {
            array.forEach((value, index) => this.visitArrayEntry(value, array, index, depth))

            return array
        }

        visitArrayEntry<V> (value : V, array : V[], index : number, depth : number) {
            this.visit(value, depth)
        }


        visitSet (set : Set<unknown>, depth : number) : any {
            let index : number      = 0

            for (const value of set) this.visitSetElement(value, set, index++, depth)

            return set
        }

        visitSetElement<V> (value : V, set : Set<V>, index : number, depth : number) {
            this.visit(value, depth)
        }


        visitMap (map : Map<unknown, unknown>, depth : number) : any {
            let index : number      = 0

            for (const [ key, value ] of map) {
                this.visitMapEntryKey(key, value, map, index, depth)
                this.visitMapEntryValue(key, value, map, index++, depth)
            }

            return map
        }

        visitMapEntryKey<K, V> (key : K, value : V, map : Map<K, V>, index : number, depth : number) {
            this.visit(value, depth)
        }

        visitMapEntryValue<K, V> (key : K, value : V, map : Map<K, V>, index : number, depth : number) {
            this.visit(value, depth)
        }
    }
){}

