import { AnyConstructor, ClassUnion, Mixin } from "../class/Mixin.js"
import { ArbitraryObjectKey, isAtomicValue, typeOf, uppercaseFirst } from "../util/Helpers.js"

//---------------------------------------------------------------------------------------------------------------------
export const visitorVisitSymbol = Symbol('internalVisitSymbol')

export const PreVisit = Symbol('PreVisit')

//---------------------------------------------------------------------------------------------------------------------
export class Visitor extends Mixin(
    [],
    (base : AnyConstructor) =>

    class Visitor extends base {

        maxDepth                : number                    = Number.MAX_SAFE_INTEGER

        visited                 : Map<unknown, unknown>     = new Map()

        internalVisitSymbol     : symbol                    = visitorVisitSymbol


        isVisited (value : unknown) : boolean {
            return this.visited.has(value)
        }


        markPreVisited (value : unknown) {
            this.visited.set(value, PreVisit)
        }


        markPostVisited (value : unknown, depth : number, visitResult : unknown) : unknown {
            this.visited.set(value, visitResult)

            return visitResult
        }


        visit (value : unknown, depth : number = 0) {
            if (depth >= this.maxDepth) {
                return this.visitOutOfDepthValue(value, depth + 1)
            }
            else if (isAtomicValue(value)) {
                return this.visitAtomicValueEntry(value, depth + 1)
            }
            else if (this.isVisited(value)) {
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
            this.markPreVisited(value)

            if (value[ this.internalVisitSymbol ]) {
                const visitResult               = value[ this.internalVisitSymbol ](this, depth)

                return this.markPostVisited(value, depth, visitResult)
            } else {
                const specificVisitorMethod     = `visit${ uppercaseFirst(typeOf(value)) }`

                const visitMethod               = this[ specificVisitorMethod ] || this.visitObject

                const visitResult               = visitMethod.call(this, value, depth)

                return this.markPostVisited(value, depth, visitResult)
            }
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
        ) : any {
            return this.visitAtomicValueEntry(key, depth)
        }

        visitObjectEntryValue (
            key     : ArbitraryObjectKey, value : unknown, object : object, index : number,
            entries : [ ArbitraryObjectKey, unknown ][], depth : number
        ) {
            return this.visit(value, depth)
        }


        visitArray (array : unknown[], depth : number) : any {
            array.forEach((value, index) => this.visitArrayEntry(value, array, index, depth))

            return array
        }

        visitArrayEntry<V> (value : V, array : V[], index : number, depth : number) {
            return this.visit(value, depth)
        }


        visitSet (set : Set<unknown>, depth : number) : any {
            let index : number      = 0

            for (const value of set) this.visitSetElement(value, set, index++, depth)

            return set
        }

        visitSetElement<V> (value : V, set : Set<V>, index : number, depth : number) {
            return this.visit(value, depth)
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
            return this.visit(key, depth)
        }

        visitMapEntryValue<K, V> (key : K, value : V, map : Map<K, V>, index : number, depth : number) {
            return this.visit(value, depth)
        }


        visitDate (date : Date, depth : number) : any {
            return date
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class Mapper extends Mixin(
    [ Visitor ],
    (base : ClassUnion<typeof Visitor>) =>

    class Mapper extends base {

        visitObject (object : object, depth : number) : unknown {
            const entries   = Object.entries(object)

            const newObject = Object.create(Object.getPrototypeOf(object))

            entries.forEach(([ key, value ], index) => {
                newObject[ this.visitObjectEntryKey(key, value, object, index, entries, depth) ] =
                    this.visitObjectEntryValue(key, value, object, index, entries, depth)
            })

            return newObject
        }


        visitArray (array : unknown[], depth : number) : unknown {
            return array.map((value, index) => this.visitArrayEntry(value, array, index, depth))
        }


        visitSet (set : Set<unknown>, depth : number) : unknown {
            let index : number      = 0

            const newSet            = new Set()

            for (const value of set) {
                newSet.add(this.visitSetElement(value, set, index++, depth))
            }

            return newSet
        }


        visitMap (map : Map<unknown, unknown>, depth : number) : unknown {
            let index : number      = 0

            const newMap            = new Map()

            for (const [ key, value ] of map) {
                newMap.set(
                    this.visitMapEntryKey(key, value, map, index, depth),
                    this.visitMapEntryValue(key, value, map, index++, depth)
                )
            }

            return newMap
        }


        visitDate (date : Date, depth : number) : any {
            return new Date(date)
        }
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class Mutator extends Mixin(
    [ Visitor ],
    (base : ClassUnion<typeof Visitor>) =>

    class Mutator extends base {

        visitObject (object : object, depth : number) : any {
            const entries   = Object.entries(object)

            entries.forEach(([ key, value ], index) => {
                const visitedKey    = this.visitObjectEntryKey(key, value, object, index, entries, depth)
                const visitedValue  = this.visitObjectEntryValue(key, value, object, index, entries, depth)

                if (visitedKey !== key) {
                    delete object[ key ]
                    object[ visitedKey ] = visitedValue
                }
                else if (visitedValue !== value) {
                    object[ visitedKey ] = visitedValue
                }
            })

            return object
        }


        visitArray (array : unknown[], depth : number) : any {
            array.forEach((value, index) => array[ index ] = this.visitArrayEntry(value, array, index, depth))

            return array
        }


        visitSet (set : Set<unknown>, depth : number) : any {
            let index : number      = 0

            // prefetch the collection before mutating it
            const elements          = Array.from(set)

            elements.forEach(value => {
                const visited       = this.visitSetElement(value, set, index++, depth)

                if (visited !== value) {
                    set.delete(value)
                    set.add(visited)
                }
            })

            return set
        }


        visitMap (map : Map<unknown, unknown>, depth : number) : any {
            let index : number      = 0

            // prefetch the collection before mutating it
            const entries          = Array.from(map.entries())

            entries.forEach(([ key, value ]) => {
                const visitedKey    = this.visitMapEntryKey(key, value, map, index, depth)
                const visitedValue  = this.visitMapEntryValue(visitedKey, value, map, index++, depth)

                if (visitedKey !== key) {
                    map.delete(key)
                    map.set(visitedKey, visitedValue)
                }
                else if (visitedValue !== value) {
                    map.set(visitedKey, visitedValue)
                }
            })

            return map
        }
    }
) {}
