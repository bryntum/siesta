import { AnyConstructor, ClassUnion, Mixin } from "../class/Mixin.js"
import { DataVisitor } from "./DataVisitor.js"
import { ArbitraryObjectKey, constructorNameOf, isAtomicValue, typeOf, uppercaseFirst } from "./Helpers.js"


//---------------------------------------------------------------------------------------------------------------------
export class Serializer extends Mixin(
    [ DataVisitor ],
    (base : ClassUnion<typeof DataVisitor>) =>

    class Serializer extends base {

        maxDepth        : number        = 4

        maxWide         : number        = 5

        circularSymbol      : string        = '[Circular]'
        outOfDepthSymbol    : string        = '🠗'
        outOfWideSymbol     : string        = '...'

        result          : string[]      = []


        write (str : string) {
            this.result.push(str)
        }


        visitOutOfDepthValue (value : unknown, depth : number) {
            this.write(`${ this.outOfDepthSymbol } ${ constructorNameOf(value) }`)
        }


        visitAtomicValue (value : unknown, depth : number) {
            this.write(String(value))
        }


        visitAlreadyVisited (value : unknown, depth : number) {
        }


//---------------------------------------------------------------------------------------------------------------------


        visitNotVisited (value : unknown, depth : number) {
            this.visited.add(value)

            const specificVisitorMethod     = `visit${ uppercaseFirst(typeOf(value)) }`

            const visitMethod       = this[ specificVisitorMethod ] || this.visitObject

            visitMethod.call(this, value, depth)
        }


        visitObject (object : object, depth : number) {
            Object.entries(object).forEach(([ key, value ], index) => {
                this.visitObjectEntryKey(key, value, object, index, depth)
                this.visitObjectEntryKey(key, value, object, index, depth)
            })
        }

        visitObjectEntryKey (key : ArbitraryObjectKey, value : unknown, object : object, index : number, depth : number) {
            this.visitAtomicValue(key, depth)
        }

        visitObjectEntryValue (key : ArbitraryObjectKey, value : unknown, object : object, index : number, depth : number) {
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

