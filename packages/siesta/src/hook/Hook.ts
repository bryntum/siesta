// Hooks are type-safe, super-efficient, tiny implementation of the observable pattern.
// Every hook is just an array of listeners, no extra objects are created

// Hooks are not events, do not expect the usual event features from it.
// Those features always can be emulated with just a little change of programming habits.
// for example:
// - common "event" feature is filtering the same listeners
//   but how often did you actually experience a case when you had to subscribe to event
//   with same listener? Its most probably code smell. If its still a valid concern, then solve it
//   with a flag
// - another common "event" feature is having "scope" argument for listener
//   then you may have same listeners with different scope, which makes implementation
//   more complex (= slower). Just use `listener.bind()` where needed
// - another "event" feature is listener "options", for example "delay"
//   this again makes the implementation more complex for no reason - just
//   create higher-level "delay" function and use: `hook.on(delay(listener))` instead of
//   `event.on(listener, { delay })`

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type Listener<Payload extends unknown[]> = (...payload : Payload) => any

export type Disposer = () => any

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class Hook<Payload extends unknown[] = []> extends Array<Listener<Payload>> {

    // when doing `this.slice()` we want the regular array, instead of the Hook instance
    // (might have some logic in constructor)
    static get [Symbol.species] () {
        return Array
    }


    get hooks () : Listener<Payload>[] {
        return this
    }


    on (listener : Listener<Payload>) : Disposer {
        this.hooks.push(listener)

        return () => this.un(listener)
    }


    once (listener : Listener<Payload>) : Disposer {
        const actualListener = (...payload : Payload) => {
            this.un(actualListener)

            // return the value from listener as it might be a Promise
            return listener(...payload)
        }

        return this.on(actualListener)
    }


    un (listener : Listener<Payload>) {
        const index = this.hooks.indexOf(listener)

        if (index !== -1) this.hooks.splice(index, 1)
    }


    trigger (...payload : Payload) {
        if (this.hooks.length === 0) return

        const listeners     = this.hooks.slice()

        for (let i = 0; i < listeners.length; ++i) {
            listeners[ i ](...payload)
        }
    }


    async triggerAsyncSequential (...payload : Payload) {
        if (this.hooks.length === 0) return

        const listeners     = this.hooks.slice()

        for (let i = 0; i < listeners.length; ++i) {
            await listeners[ i ](...payload)
        }
    }


    async triggerAsyncParallel (...payload : Payload) {
        if (this.hooks.length === 0) return

        const listeners     = this.hooks.slice()

        await Promise.allSettled(listeners.map(listener => listener(...payload)))
    }
}
