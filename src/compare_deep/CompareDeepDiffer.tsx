// import { Base } from "../class/Base.js"
// import { ClassUnion, Mixin } from "../class/Mixin.js"
// import { TextJSX } from "../jsx/TextJSX.js"
// import { XmlElement } from "../jsx/XmlElement.js"
// import { SerializerXml } from "../serializer/SerializerXml.js"
// import { ArbitraryObjectKey, isAtomicValue, typeOf, uppercaseFirst } from "../util/Helpers.js"
// import { Difference } from "./CompareDeepDiff.js"
// import { DifferenceTemplateRoot, DifferenceTemplateValue, MissingValue } from "./CompareDeepDiffRendering.js"
//
//
// //---------------------------------------------------------------------------------------------------------------------
// export type DifferenceType = 'both' | 'onlyIn1' | 'onlyIn2'
//
// const getDifferenceType = (value1 : unknown | Missing, value2 : unknown | Missing) : DifferenceType => {
//     const has1  = value1 !== Missing
//     const has2  = value2 !== Missing
//
//     return has1 && has2 ? 'both' : has1 ? 'onlyIn1' : 'onlyIn2'
// }
//
//
// //---------------------------------------------------------------------------------------------------------------------
// export type CompareDeepResult = { equal : boolean, difference? : DifferenceTemplateRoot }
//
// //---------------------------------------------------------------------------------------------------------------------
// const Missing   = Symbol('Missing')
// type Missing    = typeof Missing
//
// //---------------------------------------------------------------------------------------------------------------------
// export const visitorVisitSymbol = Symbol('internalVisitSymbol')
//
// //---------------------------------------------------------------------------------------------------------------------
// export class CompareDeepDiffer extends Mixin(
//     [ Base ],
//     (base : ClassUnion<typeof Base>) =>
//
//     class CompareDeepDiffer extends base {
//         createDiffView      : boolean                   = false
//
//         omitEqual           : boolean                   = false
//
//         serializer1         : SerializerXml             = undefined
//         serializer2         : SerializerXml             = undefined
//
//         equal               : boolean                   = true
//
//         result              : DifferenceTemplateRoot    = <DifferenceTemplateRoot></DifferenceTemplateRoot> as DifferenceTemplateRoot
//
//         currentElement      : XmlElement                = this.result
//
//         internalVisitSymbol : symbol                    = visitorVisitSymbol
//
//
//         beforeVisit (value : unknown, depth : number) {
//             this.beforeVisitEl  = value
//
//             this.visited.set(value, value)
//
//             return value
//         }
//
//
//         afterVisit (value : unknown, depth : number, visitResult : unknown) : unknown {
//             this.visited1.set(value, visitResult)
//
//             return visitResult
//         }
//
//
//         write (el : XmlElement) {
//             this.currentElement.appendChild(el)
//
//             // if (!this.valueToEl.has(this.beforeVisitEl)) this.valueToEl.set(this.beforeVisitEl, el)
//         }
//
//
//         push (el : XmlElement) {
//             this.write(el)
//
//             this.currentElement = el
//         }
//
//
//         pop () {
//             this.currentElement = this.currentElement.parent
//         }
//
//
//         visit (value1 : unknown | Missing, value2 : unknown) {
//             const type1             = typeOf(value1)
//             const type2             = typeOf(value2)
//
//             const value1IsAtomic    = isAtomicValue(value1)
//             const value2IsAtomic    = isAtomicValue(value2)
//
//             if (type1 !== type2) {
//                 this.equal      = false
//
//                 if (this.createDiffView) {
//                     this.write(<DifferenceTemplateValue type={ getDifferenceType(value1, value2) }>
//                         { value1 === Missing ? <MissingValue></MissingValue> : this.serializer1.serialize(value1) }
//                         { value2 === Missing ? <MissingValue></MissingValue> : this.serializer2.serialize(value2) }
//                     </DifferenceTemplateValue>)
//                 }
//             }
//             else if (value1IsAtomic && value2IsAtomic) {
//                 this.visitAtomicValueEntry(value1, value2)
//             }
//             else if (this.serializer1.visited.has(value1)) {
//                 this.visitAlreadyVisited(value1, depth + 1)
//             } else {
//                 this.visitNotVisited(value1, depth + 1)
//             }
//         }
//
//
//         visitOutOfDepthValue (value : unknown, depth : number) {
//             return value
//         }
//
//
//         visitAtomicValue (value1 : unknown, value2 : unknown) {
//         }
//
//
//         visitAtomicValueEntry (value1 : unknown, value2 : unknown) {
//             const specificVisitorMethod     = `visit${ uppercaseFirst(typeOf(value1)) }`
//
//             const visitMethod       = this[ specificVisitorMethod ] || this.visitAtomicValue
//
//             return visitMethod.call(this, value1, value2)
//         }
//
//
//         visitAlreadyVisited (value : unknown, depth : number) {
//             return value
//         }
//
//
//         visitNotVisited (value : unknown, depth : number) {
//             const newValue                  = this.beforeVisit(value, depth)
//
//             if (newValue[ this.internalVisitSymbol ]) {
//                 const visitResult               = newValue[ this.internalVisitSymbol ](this, depth)
//
//                 return this.afterVisit(newValue, depth, visitResult)
//             } else {
//                 const specificVisitorMethod     = `visit${ uppercaseFirst(typeOf(newValue)) }`
//
//                 const visitMethod               = this[ specificVisitorMethod ] || this.visitObject
//
//                 const visitResult               = visitMethod.call(this, newValue, depth)
//
//                 return this.afterVisit(newValue, depth, visitResult)
//             }
//         }
//
//
//         visitObject (object : object, depth : number) : any {
//             const entries = Object.entries(object)
//
//             entries.forEach(([ key, value ], index) => {
//                 this.visitObjectEntryKey(key, value, object, index, entries, depth)
//                 this.visitObjectEntryValue(key, value, object, index, entries, depth)
//             })
//
//             return object
//         }
//
//         visitObjectEntryKey (
//             key     : ArbitraryObjectKey, value : unknown, object : object, index : number,
//             entries : [ ArbitraryObjectKey, unknown ][], depth : number
//         ) : any {
//             return this.visitAtomicValueEntry(key, depth)
//         }
//
//         visitObjectEntryValue (
//             key     : ArbitraryObjectKey, value : unknown, object : object, index : number,
//             entries : [ ArbitraryObjectKey, unknown ][], depth : number
//         ) {
//             return this.visit(value, depth)
//         }
//
//
//         visitArray (array : unknown[], depth : number) : any {
//             array.forEach((value, index) => this.visitArrayEntry(value, array, index, depth))
//
//             return array
//         }
//
//         visitArrayEntry<V> (value : V, array : V[], index : number, depth : number) {
//             return this.visit(value, depth)
//         }
//
//
//         visitSet (set : Set<unknown>, depth : number) : any {
//             let index : number      = 0
//
//             for (const value of set) this.visitSetElement(value, set, index++, depth)
//
//             return set
//         }
//
//         visitSetElement<V> (value : V, set : Set<V>, index : number, depth : number) {
//             return this.visit(value, depth)
//         }
//
//
//         visitMap (map : Map<unknown, unknown>, depth : number) : any {
//             let index : number      = 0
//
//             for (const [ key, value ] of map) {
//                 this.visitMapEntryKey(key, value, map, index, depth)
//                 this.visitMapEntryValue(key, value, map, index++, depth)
//             }
//
//             return map
//         }
//
//         visitMapEntryKey<K, V> (key : K, value : V, map : Map<K, V>, index : number, depth : number) {
//             return this.visit(key, depth)
//         }
//
//         visitMapEntryValue<K, V> (key : K, value : V, map : Map<K, V>, index : number, depth : number) {
//             return this.visit(value, depth)
//         }
//
//
//         visitDate (date : Date, depth : number) : any {
//             return date
//         }
//
//
//         static compareDeep <T extends typeof CompareDeepDiffer> (this : T, value1 : unknown, value2 : unknown, props? : Partial<InstanceType<T>>) : CompareDeepResult {
//             const differ = this.new(props)
//
//             differ.visit(value1, value2)
//
//             return { equal : differ.equal, difference : differ.createDiffView ? differ.result : undefined }
//         }
//     }
// ){}
