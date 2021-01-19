// Hooks are not events
// do not expect the usual event features from it
// (which always can be emulated with just a bit different thinking
// for example:
// - common "event" feature is filtering the same listeners
//   but how often did you actually experience a case when you had to subscribe to event
//   with same listener? Its most probably code smell. If its still valid, then solve it
//   with a flag
// - another common "event" feature is having "scope" argument for listener
//   then you may have same listeners with different scope, which makes implementation
//   more complex (= slower). Just use `listener.bind()` where needed
// - another "event" feature is listener "options", for example "delay"
//   this again makes the implementation more complex for no reason - just
//   create higher-level "delay" function and use: `hook.on(delay(listener))` instead of
//   `event.on(listener, { delay })`

//---------------------------------------------------------------------------------------------------------------------
export type Listener<Payload extends unknown[]> = (...payload : Payload) => any

export type Disposer = () => any

//---------------------------------------------------------------------------------------------------------------------
export class Hook<Payload extends unknown[]> {
    hooks       : Listener<Payload> []  = []


    on (listener : Listener<Payload>) : Disposer {
        this.hooks.push(listener)

        return () => this.un(listener)
    }


    un (listener : Listener<Payload>) {
        const index = this.hooks.indexOf(listener)

        if (index !== -1) this.hooks.splice(index, 1)
    }


    trigger (...payload : Payload) {
        const listeners     = this.hooks.slice()

        for (let i = 0; i < listeners.length; ++i) {
            listeners[ i ](...payload)
        }
    }
}
