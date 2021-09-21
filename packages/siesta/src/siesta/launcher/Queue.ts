import { Base } from "../../class/Base.js"
import { Hook } from "../../hook/Hook.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class Queue extends Base {
    maxWorkers                  : number                = 5

    slots                       : Promise<unknown>[]    = []

    freeSlots                   : number[]              = []

    onFreeSlotAvailableHook     : Hook<[ this ]>        = new Hook()

    onSlotSettledHook           : Hook<[ this, unknown, PromiseSettledResult<unknown> ]>        = new Hook()

    onCompletedHook             : Hook<[ this ]>        = new Hook()


    initialize (props? : Partial<Queue>) {
        super.initialize(props)

        for (let i = 0; i < this.maxWorkers; i++) {
            this.slots.push(null)
            this.freeSlots.push(i)
        }
    }


    get isEmpty () : boolean {
        return this.freeSlots.length === this.maxWorkers
    }


    pullSingle () {
        if (this.freeSlots.length > 0) this.onFreeSlotAvailableHook.trigger(this)

        if (this.isEmpty) this.onCompletedHook.trigger(this)
    }


    pull () {
        while (this.freeSlots.length) {
            const before        = this.freeSlots.length

            this.onFreeSlotAvailableHook.trigger(this)

            if (this.isEmpty) {
                this.onCompletedHook.trigger(this)
                break
            }

            if (before === this.freeSlots.length) break
        }
    }


    async push (task : unknown, promise : Promise<unknown>) {
        if (this.freeSlots.length === 0) throw new Error("All slots are busy")

        const freeSlot          = this.freeSlots.pop()

        let value, reason

        let thrown : boolean    = false

        try {
            value   = await promise
        } catch (e) {
            reason  = e
            thrown  = true
        }

        this.freeSlots.push(freeSlot)

        if (thrown)
            this.onSlotSettledHook.trigger(this, task, { status : 'rejected', reason })
        else
            this.onSlotSettledHook.trigger(this, task, { status : 'fulfilled', value })
    }
}
