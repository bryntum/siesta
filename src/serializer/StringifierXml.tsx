import { Base } from "../class/Base.js"
import { ClassUnion, Mixin } from "../class/Mixin.js"
import { TextBlock } from "../jsx/TextBlock.js"
import { XmlElement } from "../jsx/XmlElement.js"

//---------------------------------------------------------------------------------------------------------------------
export class StringifierXml extends Mixin(
    [ Base ],
    (base : ClassUnion<typeof Base>) =>

    class StringifierXml extends base {
        maxLen                  : number        = Number.MAX_SAFE_INTEGER

        outOfDepthSymbol        : string        = '▼'
        outOfWideSymbol         : string        = '...'

        indentLevel             : number        = 0

        prettyPrint             : boolean       = false

        output                  : TextBlock     = TextBlock.new()

        leafNodes               : Set<string>   = new Set([
            'number', 'string', 'date', 'regexp', 'symbol', 'function', 'special'
        ])


        write (str : string) {
            this.output.push(str)
        }


        stringify (value : XmlElement) {
            this.output.maxLen          = this.maxLen
            this.output.indentLevel     = this.indentLevel

            this.output.initIndent()

            this.walk(value.childNodes[ 0 ] as XmlElement, 0, value)
        }


        stringifyToProvidedOutput (value : XmlElement) {
            this.walk(value.childNodes[ 0 ] as XmlElement, 0, value)
        }


        checkForReferenceId (el : XmlElement) {
            const refId = el.getAttribute('refId')

            if (refId !== undefined) this.write(`<ref *${ refId }> `)
        }


        walk (value : XmlElement, index : number, parentEl : XmlElement) {
            if (this.leafNodes.has(value.tagName)) {
                this.write(value.childNodes[ 0 ] as string)
            }
            else if (value.tagName === 'undefined') {
                this.write(`undefined`)
            }
            else if (value.tagName === 'null') {
                this.write(`null`)
            }
            else if (value.tagName === 'reference') {
                this.write(`[Circular *${ value.getAttribute('refId') }]`)
            }
            else if (value.tagName === 'out_of_depth') {
                this.write(`${ this.outOfDepthSymbol } ${ value.getAttribute('constructorName') } { ... }`)
            }
            else if (value.tagName === 'map') {
                this.checkForReferenceId(value)

                this.write(`Map (${ value.getAttribute('size') }) {`)

                this.output.indent()

                value.childNodes.forEach((childNode, index, childNodes) => {
                    if (index === 0) this.write(this.prettyPrint ? '\n' : ' ')

                    const childElement  = childNode as XmlElement

                    if (childElement.tagName === 'out_of_wide') {
                        this.write(`...`)
                    } else {
                        this.walk(childElement.childNodes[ 0 ] as XmlElement, index, value)

                        this.write(' => ')

                        this.walk(childElement.childNodes[ 1 ] as XmlElement, index, value)
                    }

                    if (index !== childNodes.length - 1)
                        this.write(this.prettyPrint ? ',\n' : ', ')
                    else
                        this.write(this.prettyPrint ? '\n' : ' ')
                })

                this.output.outdent()

                this.write('}')
            }
            else if (value.tagName === 'set') {
                this.checkForReferenceId(value)

                this.write(`Set (${ value.getAttribute('size') }) {`)

                this.output.indent()

                value.childNodes.forEach((childNode, index, childNodes) => {
                    if (index === 0) this.write(this.prettyPrint ? '\n' : ' ')

                    const childElement  = childNode as XmlElement

                    if (childElement.tagName === 'out_of_wide') {
                        this.write(`...`)
                    } else {
                        this.walk(childElement, index, value)
                    }

                    if (index !== childNodes.length - 1)
                        this.write(this.prettyPrint ? ',\n' : ', ')
                    else
                        this.write(this.prettyPrint ? '\n' : ' ')
                })

                this.output.outdent()

                this.write('}')
            }
            else if (value.tagName === 'array') {
                this.checkForReferenceId(value)
                this.write('[')

                this.output.indent()

                value.childNodes.forEach((childNode, index, childNodes) => {
                    if (index === 0) this.write(this.prettyPrint ? '\n' : '')

                    const childElement  = childNode as XmlElement

                    if (childElement.tagName === 'out_of_wide') {
                        this.write(`... (${ value.getAttribute('length') - value.childNodes.length + 1 } more)`)
                    } else {
                        this.walk(childElement, index, value)
                    }

                    if (index !== childNodes.length - 1)
                        this.write(this.prettyPrint ? ',\n' : '')
                    else
                        this.write(this.prettyPrint ? '\n' : '')
                })

                this.output.outdent()

                this.write(']')
            }
            else if (value.tagName === 'object') {
                const className     = value.getAttribute('constructorName')

                if (className && className !== 'Object') this.write(className + ' ')

                this.checkForReferenceId(value)

                this.write(`{`)

                this.output.indent()

                value.childNodes.forEach((childNode, index, childNodes) => {
                    if (index === 0) this.write(this.prettyPrint ? '\n' : ' ')

                    const childElement  = childNode as XmlElement

                    if (childElement.tagName === 'out_of_wide') {
                        this.write(`... (${ value.getAttribute('size') - value.childNodes.length + 1 } more)`)
                    } else {
                        const keyEl     = childElement.childNodes[ 0 ] as XmlElement
                        const valueEl   = childElement.childNodes[ 1 ] as XmlElement

                        this.walk(keyEl, index, value)

                        this.write(': ')

                        const valueIsAtomic     = this.leafNodes.has((valueEl.childNodes[ 0 ] as XmlElement).tagName)

                        if (valueIsAtomic) this.output.indent()

                        this.walk(valueEl, index, value)

                        if (valueIsAtomic) this.output.outdent()
                    }

                    if (index !== childNodes.length - 1)
                        this.write(this.prettyPrint ? ',\n' : ', ')
                    else
                        this.write(this.prettyPrint ? '\n' : ' ')
                })

                this.output.outdent()

                this.write('}')
            }
            else
                value.childNodes.forEach((childNode, index) => this.walk(childNode as XmlElement, index, value))
        }


        toString () : string {
            return this.output.toString()
        }


        toTextBlock () : TextBlock {
            return this.output
        }


        static stringify <T extends typeof StringifierXml> (this : T, value : XmlElement, props? : Partial<InstanceType<T>>) : string {
            const stringifier = this.new(props)

            stringifier.stringify(value)

            return stringifier.toString()
        }


        static stringifyToProvidedOutput <T extends typeof StringifierXml> (this : T, value : XmlElement, props? : Partial<InstanceType<T>>) {
            if (!props.output) throw new Error("`output` config is required")

            const stringifier = this.new(props)

            stringifier.stringifyToProvidedOutput(value)
        }


        static stringifyToTextBlock <T extends typeof StringifierXml> (this : T, value : XmlElement, props? : Partial<InstanceType<T>>) : TextBlock {
            const stringifier = this.new(props)

            stringifier.stringify(value)

            return stringifier.toTextBlock()
        }
    }
) {}
