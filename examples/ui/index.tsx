/** @jsx ChronoGraphJSX.createElement */
/** @jsxFrag ChronoGraphJSX.FragmentSymbol */

import { ReactiveArray } from "@bryntum/chronograph/src/chrono2/data/Array.js"
import { Box } from "@bryntum/chronograph/src/chrono2/data/Box.js"
import { globalGraph } from "@bryntum/chronograph/src/chrono2/graph/Graph.js"
import { ClassUnion, Mixin } from "@bryntum/chronograph/src/class/Mixin.js"
import { field } from "@bryntum/chronograph/src/replica2/Entity.js"
import { ChronoGraphJSX, ElementSource, NodesListReactivity } from "../../src/chronograph-jsx/ChronoGraphJSX.js"
import { Component, tag, WebComponent } from "../../src/chronograph-jsx/WebComponent.js"

ChronoGraphJSX

// Dashboard.new().start()

globalGraph.autoCommit      = true
globalGraph.historyLimit    = 1

// @ts-ignore
window.globalGraph = globalGraph

await new Promise(resolve => window.addEventListener('load', resolve))


// @ts-ignore
const fragmentCondition = window.fragmentCondition = Box.new(true)

const fragment = <>
    <div>Fragment content</div>
    { () => fragmentCondition.read() ? <div>Fragment condition true</div> : <div>Fragment condition false</div> }
</>

// @ts-ignore
const classBox = window.classBox = Box.new('cls')
// @ts-ignore
const condition = window.condition = Box.new(true)
// @ts-ignore
const numbers = window.numbers = new Array(10).fill(null).map((el, index) => Box.new(String(index)))
// @ts-ignore
const numbers2 = window.numbers2 = ReactiveArray.new<number>()

globalGraph.addAtom(numbers2)

numbers2.push(...numbers)

// @ts-ignore
const numbersMapped = window.numbersMapped = numbers2.map(el => el + '/')

// @ts-ignore
const numbersMapped2 = window.numbersMapped2 = numbersMapped.map(el => <div>mapped2 : { el }</div>)


// const el = <div class={ () => 'prefix_' + classBox.read() }>
//     Div content
//     { fragment }
//     { () => condition.read() ? <div>Condition true</div> : <div>Condition false</div> }
//
//     { () => numbers.map(number => <div>{ number }</div>) }
// </div>


@tag('c-counter')
export class Counter extends Mixin(
    [ WebComponent, HTMLElement ],
    (base : ClassUnion<typeof WebComponent, typeof HTMLElement>) => {

        class Counter extends base {

            constructor () {
                super()

                // @ts-ignore
                this.enterGraph(globalGraph)

                const children      = NodesListReactivity.from(this.render())

                const shadowRoot    = this.attachShadow({ mode : 'open' })

                shadowRoot.append(...children.read())

                // setInterval(() => this.counter++, 1000)
            }

            @field()
            counter     : number            = 0

            render () : ElementSource {
                return <div class={ () => 'prefix_' + classBox.read() }>
                    {/*Div content*/}
                    {/*<p>{ this.$.counter }</p>*/}
                    {/*{ fragment }*/}
                    {/*{ () => condition.read() ? <div>Condition true</div> : <div>Condition false</div> }*/}

                    {/*{ () => numbers.map(number => <div>{ number }</div>) }*/}
                    { numbers2 }
                    { numbersMapped }
                    { numbersMapped2 }
                </div>
            }
        }

        return Counter
    }
) {}


export class Counter2 extends Mixin(
    [ Component ],
    (base : ClassUnion<typeof Component>) => {

        class Counter2 extends base {
            props       : Component[ 'props' ] & { counter : number }

            @field()
            counter     : number            = 0

            initialize (props? : Partial<Counter2>) {
                super.initialize(props)

                setInterval(() => this.counter++, 1000)
            }


            render () : Element {
                return <p>{ this.$.counter }{ () => this.children }</p>
            }
        }

        return Counter2
    }
) {}


document.body.appendChild(<c-counter></c-counter>)

// document.body.appendChild(<Counter2 counter={ 100 }>Some text</Counter2>)
