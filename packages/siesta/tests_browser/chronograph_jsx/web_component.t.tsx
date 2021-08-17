/** @jsx ChronoGraphJSX.createElement */

import { Box } from "@bryntum/chronograph/src/chrono2/data/Box.js"
import { globalGraph } from "@bryntum/chronograph/src/chrono2/graph/Graph.js"
import { field } from "@bryntum/chronograph/src/replica2/Entity.js"
import { iit, it } from "../../browser.js"
import { ChronoGraphJSX, querySelector } from "../../src/chronograph-jsx/ChronoGraphJSX.js"
import { Component, custom_element, WebComponent } from "../../src/chronograph-jsx/Component.js"
import { ReactiveElement } from "../../src/chronograph-jsx/ElementReactivity.js"

ChronoGraphJSX

it('Should render the minimal web component correctly', async t => {
    let counter1 = 0

    @custom_element('custom-comp1')
    class Comp1 extends WebComponent {
        // render () : ReactiveElement {
        //     // return <div class="comp1">
        //     //     {
        //     //         () => (
        //     //             counter1++,
        //     //             this.state1 >= 0 ? <Comp2 state2={ 0 }></Comp2> : undefined
        //     //         )
        //     //     }
        //     // </div>
        // }
    }

    // let counter2 = 0
    //
    // class Comp2 extends Component {
    //     props           : Component[ 'props' ] & { state2 : number }
    //
    //     @field()
    //     state2          : number        = 0
    //
    //     render () : ReactiveElement {
    //         return <div class="comp2">{ () => (counter2++, this.state2) }</div>
    //     }
    // }

    const comp1     = Comp1.new()

    document.body.appendChild(comp1)

    const comp2     = <Comp1>Content</Comp1>

    document.body.appendChild(comp2)

    // globalGraph.commit()
    //
    // const comp2     = querySelector<Comp2>(comp1.el, '.comp2').comp
    //
    // t.is(counter1, 1)
    // t.is(counter2, 1)
    //
    // //------------
    // comp2.state2    = 1
    //
    // globalGraph.commit()
    //
    // t.is(counter1, 1)
    // t.is(counter2, 2)
})

