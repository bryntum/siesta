import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { DataVisitor } from "./DataVisitor.js"
import { ArbitraryObjectKey, constructorNameOf, typeOf, uppercaseFirst } from "./Helpers.js"


//---------------------------------------------------------------------------------------------------------------------
export class Serializer extends Mixin(
    [ DataVisitor, Base ],
    (base : ClassUnion<typeof DataVisitor, typeof Base>) =>

    class Serializer extends base {

        maxWide                 : number    = Number.MAX_SAFE_INTEGER
        // TODO
        includeFunctionSources  : boolean   = true

        outOfDepthSymbol    : string        = '🠗'
        outOfWideSymbol     : string        = '...'

        result              : string[]      = []

        refCounter          : number        = 1

        references          : Map<unknown, number>  = new Map()


        beforeVisit (value : unknown, depth : number) {
            this.visited.set(value, [ this.result.length, undefined ])
        }


        afterVisit (value : unknown, depth : number, visitResult : unknown) {
            const currentMarker     = this.visited.get(value)

            currentMarker[ 1 ]      = this.result.length - 1
        }


        write (str : string) {
            this.result.push(str)
        }


        visitOutOfDepthValue (value : unknown, depth : number) {
            this.write(`${ this.outOfDepthSymbol } ${ constructorNameOf(value) || typeOf(value) }`)
        }


        visitAtomicValue (value : unknown, depth : number) {
            this.write(String(value))
        }


        visitAlreadyVisited (value : unknown, depth : number) {
            const valueReference    = this.references.get(value)

            if (valueReference !== undefined) {
                this.write(`[Circular *${ valueReference }]`)
            } else {
                const currentMarker     = this.visited.get(value)

                const refCount          = this.refCounter++

                this.references.set(value, refCount)

                this.result[ currentMarker[ 0 ] ] = `<ref *${ refCount }> ${ this.result[ currentMarker[ 0 ] ] }`

                this.write(`[Circular *${ refCount }]`)
            }
        }


        getVisitMethodFor (value : unknown) : Function {
            const type      = typeOf(value)

            if (type === 'RegExp' || 'Symbol') return this.visitAtomicValue

            if (/Function$/.test(type)) return this.visitFunction

            const specificVisitorMethod     = `visit${ uppercaseFirst(typeOf(value)) }`

            return this[ specificVisitorMethod ] || this.visitObject
        }


        visitString (value : string, depth : number) {
            this.write(`"${ value.replace(/\n/g, '\\n') }"`)
        }


        visitDate (value : Date, depth : number) {
            this.write(dateToString(value))
        }


        visitRegExp (value : RegExp, depth : number) {
            this.write(String(value))
        }


        visitAsyncGeneratorFunction (value : AsyncGeneratorFunction, depth : number) {
            this.visitFunction(value, depth)
        }


        visitGeneratorFunction (value : GeneratorFunction, depth : number) {
            this.visitFunction(value, depth)
        }


        visitAsyncFunction (value : Function, depth : number) {
            this.visitFunction(value, depth)
        }


        visitFunction (value : Function, depth : number) {
            this.write(functionSources(value)/*.replace(/\{.*\}$/, '{ ... }')*/)
        }


        visitObject (object : object, depth : number) : any {
            const constructorName   = constructorNameOf(object)

            this.write(constructorName !== 'Object' ? constructorName + ' {' : '{')

            super.visitObject(object, depth)

            this.write('}')
        }

        visitObjectEntryKey (
            key : ArbitraryObjectKey, value : unknown, object : object, index : number,
            entries : [ ArbitraryObjectKey, unknown ][], depth : number
        ) {
            if (index === 0) this.write(' ')

            if (index < this.maxWide) {
                this.write('"')

                super.visitObjectEntryKey(key, value, object, index, entries, depth)

                this.write('": ')
            }
        }

        visitObjectEntryValue (
            key : ArbitraryObjectKey, value : unknown, object : object, index : number,
            entries : [ ArbitraryObjectKey, unknown ][], depth : number
        ) {
            const lastEntryIndex    = entries.length - 1

            if (index < this.maxWide) super.visitObjectEntryValue(key, value, object, index, entries, depth)

            if (index === this.maxWide && this.maxWide <= lastEntryIndex) {
                this.write(this.outOfWideSymbol)
            }

            if (index === this.maxWide || this.maxWide > lastEntryIndex && index === lastEntryIndex) {
                this.write(' ')
            }

            if (index < this.maxWide - 1 && index < lastEntryIndex) this.write(', ')
        }


        visitArray (array : unknown[], depth : number) : any {
            this.write('[')

            super.visitArray(array, depth)

            this.write(']')
        }

        visitArrayEntry<V> (value : V, array : V[], index : number, depth : number) {
            if (index < this.maxWide) super.visitArrayEntry(value, array, index, depth)

            if (index === this.maxWide) this.write(this.outOfWideSymbol)

            if (index < this.maxWide - 1 && index < array.length - 1) this.write(', ')
        }


        visitSet (set : Set<unknown>, depth : number) : any {
            this.write('Set(' + set.size + ') {')

            super.visitSet(set, depth)

            this.write('}')
        }

        visitSetElement<V> (value : V, set : Set<V>, index : number, depth : number) {
            if (index < this.maxWide) super.visitSetElement(value, set, index, depth)

            if (index === this.maxWide) this.write(this.outOfWideSymbol)

            if (index < this.maxWide - 1 && index < set.size - 1) this.write(', ')
        }


        visitMap (map : Map<unknown, unknown>, depth : number) : any {
            this.write('Map(' + map.size + ') {')

            super.visitMap(map, depth)

            this.write('}')
        }

        visitMapEntryKey<K, V> (key : K, value : V, map : Map<K, V>, index : number, depth : number) {
            if (index < this.maxWide) {
                this.write('[')

                super.visitMapEntryKey(key, value, map, index, depth)

                this.write('] => ')
            }
        }

        visitMapEntryValue<K, V> (key : K, value : V, map : Map<K, V>, index : number, depth : number) {
            if (index < this.maxWide) super.visitMapEntryValue(key, value, map, index, depth)

            if (index === this.maxWide) this.write(this.outOfWideSymbol)

            if (index < this.maxWide - 1 && index < map.size - 1) this.write(', ')
        }

        // TODO should accept an object of properties for Serializer class instead of an argument for every property
        static serialize (value : unknown, maxDepth : number = Number.MAX_SAFE_INTEGER, maxWide : number = Number.MAX_SAFE_INTEGER) : string {
            const serializer = this.new({ maxDepth, maxWide })

            serializer.visit(value)

            return serializer.result.join('')
        }
    }
){}


const functionSources = (func : Function) : string => {
    const sources                       = func.toString().split('\n')

    let minCommonLeadingWhitespace      = Infinity

    sources.forEach((line, index) => {
        // ignore first line, which won't have the common leading whitespace
        if (index === 0) return

        const leadingWhitespaceMatch  = /^(\s*)/.exec(line)

        if (leadingWhitespaceMatch) {
            const leadingWhitespace   = leadingWhitespaceMatch[ 1 ]

            // ignore whitespace-only lines
            if (leadingWhitespace === line) return

            if (leadingWhitespace.length < minCommonLeadingWhitespace) minCommonLeadingWhitespace  = leadingWhitespace.length
        }
    })

    if (minCommonLeadingWhitespace < Infinity) sources.forEach((line, index) => {
        // ignore first line, which won't have the common leading whitespace
        if (index === 0) return

        sources[ index ]    = line.slice(minCommonLeadingWhitespace)
    })

    return sources.join('\n')
}


const dateToString = (date : Date) : string => {
    return `${ date.getFullYear() }-${ date.getMonth() }-${ date.getDate() } ${ date.getHours() }:${ date.getMinutes() }:${ date.getSeconds() }.${ date.getMilliseconds() }`
}
