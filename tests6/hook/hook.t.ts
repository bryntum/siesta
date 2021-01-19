import { it } from "../../main.js"
import { AnyConstructor, Mixin } from "../../src/class/Mixin.js"
import { Hook } from "../../src/hook/Hook.js"

//---------------------------------------------------------------------------------------------------------------------
export class ManagedArray<Element> extends Mixin(
    [ Array ],
    <Element>(base : AnyConstructor<Array<Element>, typeof Array>) => {

    class ManagedArray extends base {
        Element                 : Element

        slice : (start? : number, end? : number) => this[ 'Element' ][]

        // `spliceHook` start
        $spliceHook    : Hook<[ this, number, number, this[ 'Element' ][] ]>  = undefined
        get spliceHook () : Hook<[ this, number, number, this[ 'Element' ][] ]> {
            if (this.$spliceHook !== undefined) return this.$spliceHook

            return this.$spliceHook    = new Hook()
        }
        // `spliceHook` end

        push (...args : this[ 'Element' ][]) : number {
            this.spliceHook.trigger(this, this.length, 0, args)

            return super.push(...args)
        }


        pop () : this[ 'Element' ] {
            if (this.length > 0) {
                this.spliceHook.trigger(this, this.length - 1, 1, [])
            }

            return super.pop()
        }
    }

    return ManagedArray
}){}

export interface ManagedArray<Element> {
    Element : Element
}


it('Listening to hook should work', t => {
    const arr = new ManagedArray<number>()

    let counter = 0

    const disposer = arr.spliceHook.on((array, pos, howManyToRemove, newElements) => {
        counter++

        t.is(array, arr)
        t.is(pos, 0)
        t.is(howManyToRemove, 0)
        t.isDeeply(newElements, [ 11 ])
    })

    //-----------------
    arr.push(11)

    t.is(counter, 1)

    //-----------------
    disposer()

    arr.push(12)

    t.is(counter, 1)
})
