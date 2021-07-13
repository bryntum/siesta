/** @jsx ChronoGraphJSX.createElement */

import { globalGraph } from "@bryntum/chronograph/src/chrono2/graph/Graph.js"
import { field } from "@bryntum/chronograph/src/replica2/Entity.js"
import { it } from "../../index.js"
import { ChronoGraphJSX, querySelector } from "../../src/chronograph-jsx/ChronoGraphJSX.js"
import { Component } from "../../src/chronograph-jsx/Component.js"
import { ReactiveElement } from "../../src/chronograph-jsx/ElementReactivity.js"

ChronoGraphJSX

it('Should re-render the minimal subtree', async t => {
    let counter1 = 0

    class Comp1 extends Component {
        @field()
        state1          : number        = 0

        render () : ReactiveElement {
            return <div class="comp1">
                {
                    () => (counter1++, this.state1 >= 0
                        ? <Comp2 state2={ 0 }></Comp2>
                        : undefined)
                }
            </div>
        }
    }

    let counter2 = 0

    class Comp2 extends Component {
        props           : Component[ 'props' ] & { state2 : number }

        @field()
        state2          : number        = 0

        render () : ReactiveElement {
            return <div class="comp2">{ () => (counter2++, this.state2) }</div>
        }
    }

    const comp1     = Comp1.new()

    document.body.appendChild(comp1.el)

    globalGraph.commit()

    const comp2     = querySelector<Comp2>(comp1.el, '.comp2').comp

    t.is(counter1, 1)
    t.is(counter2, 1)

    //------------
    comp2.state2    = 1

    globalGraph.commit()

    t.is(counter1, 1)
    t.is(counter2, 2)
})


it('Should merge the `class` config', async t => {
    let counter1 = 0

    class Comp1 extends Component {
        @field()
        state1          : number        = 0

        render () : ReactiveElement {
            return <div class="comp1">
                {
                    () => this.state1
                }
            </div>
        }
    }

    const comp1     = Comp1.new({ class : "extra" })

    document.body.appendChild(comp1.el)

    globalGraph.commit()

    t.is(comp1.el.className, 'comp1 extra')
})
