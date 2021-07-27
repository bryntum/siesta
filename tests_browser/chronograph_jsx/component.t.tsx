/** @jsx ChronoGraphJSX.createElement */

import { Box } from "@bryntum/chronograph/src/chrono2/data/Box.js"
import { globalGraph } from "@bryntum/chronograph/src/chrono2/graph/Graph.js"
import { field } from "@bryntum/chronograph/src/replica2/Entity.js"
import { iit, it } from "../../browser.js"
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
                    () => (
                        counter1++,
                        this.state1 >= 0 ? <Comp2 state2={ 0 }></Comp2> : undefined
                    )
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
    class Comp1 extends Component {
        render () : ReactiveElement {
            return <div class="comp1"></div>
        }
    }

    const comp1     = Comp1.new({ class : "extra" })

    document.body.appendChild(comp1.el)

    globalGraph.commit()

    t.is(comp1.el.className, 'comp1 extra')
})


it('Should merge the `class` config #2', async t => {
    class Comp1 extends Component {
        render () : ReactiveElement {
            return <div class="comp1"></div>
        }
    }

    document.body.appendChild(<div id="class_merge_2">
        <Comp1 class="extra"></Comp1>
    </div>)

    globalGraph.commit()

    t.is(document.getElementById('class_merge_2').firstElementChild.className, 'comp1 extra')
})


it('Should merge the class activators', async t => {

    class Comp1 extends Component {
        @field()
        clsClass        : boolean        = true

        render () : ReactiveElement {
            return <div class="comp1" class:cls={ this.$.clsClass }></div>
        }
    }

    const boxCls    = Box.new(true)

    // @ts-ignore
    const comp1     = Comp1.new({ 'class:cls' : boxCls })

    document.body.appendChild(comp1.el)

    globalGraph.commit()

    t.is(comp1.el.className, 'comp1 cls')

    //---------------------
    boxCls.write(false)

    globalGraph.commit()

    t.is(comp1.el.className, 'comp1', 'Activator from config should overwrite the inner activator')

    //---------------------
    boxCls.write(true)
    comp1.clsClass  = false

    globalGraph.commit()

    t.is(comp1.el.className, 'comp1 cls', 'Activator from config should overwrite the inner activator #2')
})


it('Should merge the `style` config', async t => {
    class Comp1 extends Component {
        render () : ReactiveElement {
            return <div style="width: 10px"></div>
        }
    }

    const comp1     = Comp1.new({ style : "height: 10px" })

    const el        = comp1.el as HTMLElement

    document.body.appendChild(el)

    globalGraph.commit()

    t.is(el.style.width, '10px')
    t.is(el.style.height, '10px')
})
