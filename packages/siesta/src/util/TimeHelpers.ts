import { AnyFunction } from "typescript-mixin-class/src/class/Mixin.js"
import { OrPromise, SetTimeoutHandler } from "./Helpers.js"
import { isPromise } from "./Typeguards.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// Promise<void> is more typesafe than Promise<any> and more convenient than Promise<unknown>
// setTimeout calls the scheduled function with the elapsed time argument, because of that
// we wrap the call to `resolve` to another function
export const delay = (timeout : number) : Promise<void> => new Promise(resolve => setTimeout(() => resolve(), timeout))


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const measure = async <T>(promise : Promise<T>) : Promise<{ elapsed : number, resolved : T }> => {
    const start     = Date.now()
    const resolved  = await promise

    return { elapsed : Date.now() - start, resolved }
}

/*
A naive waiting, like:
    setTimeout(() => container.setHidden(false), defaultDelay)

    const result        = await measure(t.waitForComponentVisible(container))

    t.isGreaterOrEqual(result.elapsed, defaultDelay)

Is giving sporadic failures like

    Received:
      97 (99 more often)
    Expect value greater or equal than:
      100

The reason I guess is that `setTimeout` starts _before_ the promise, so it might take a ms or more before the
promise method will start.

To fix it, we start the promise first, then timer, then trigger the `setTimeout`
*/
export const measureTrigger = async <T>(promise : Promise<T>, trigger : AnyFunction) : Promise<{ elapsed : number, resolved : T }> => {
    const start     = Date.now()

    trigger()

    const resolved  = await promise

    return { elapsed : Date.now() - start, resolved }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// it is recommended, that the error instance, to throw on timeout, to be provided from the call site of this method
// this way, the stack trace will point to the `timeout` call, instead of the `timeout` internals
export const timeout = <T>(promise : Promise<T>, timeout : number, error : any = new Error(`Timeout of ${ timeout }ms exceeded`)) : Promise<T> => {

    return new Promise((resolve, reject) => {
        let timeOutHappened     = false
        let promiseSettled      = false

        promise.then(resolved => {
            promiseSettled      = true

            if (!timeOutHappened) {
                clearTimeout(timeoutHandler)
                resolve(resolved)
            }

        }, rejected => {
            promiseSettled      = true

            if (!timeOutHappened) {
                clearTimeout(timeoutHandler)
                reject(rejected)
            }
        })

        const timeoutHandler    = setTimeout(() => {
            timeOutHappened     = true

            if (!promiseSettled) reject(error)
        }, timeout)
    })
}

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export const buffer = <Args extends unknown[]>(func : (...args : Args) => unknown, timeout : number) : (...args : Args) => void => {
    let timeoutHandler : SetTimeoutHandler  = undefined

    return (...args : Args) => {
        if (timeoutHandler !== undefined) clearTimeout(timeoutHandler)

        timeoutHandler      = setTimeout(() => func(...args), timeout)
    }
}


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export type WaitForResult<R> = { conditionIsMet : boolean, result : R, exception : unknown, elapsedTime : number }

export const waitFor  = async <R> (condition : () => OrPromise<R>, waitTimeout : number, interval : number)
    : Promise<WaitForResult<R>> =>
{
    const start             = Date.now()
    const end               = start + waitTimeout

    const timeoutSymbol     = Symbol()

    let result  : OrPromise<R>
    let value   : R

    do {
        try {
            result      = condition()

            value       = isPromise(result) ? await timeout(result, Math.max(0, end - Date.now()), timeoutSymbol) : result
        } catch (e) {
            return {
                conditionIsMet  : false,
                result          : undefined,
                exception       : e === timeoutSymbol ? undefined : e,
                elapsedTime     : Date.now() - start
            }
        }

        if (value)
            break
        else {
            const elapsedTime   = Date.now() - start

            if (elapsedTime >= waitTimeout) {
                return { conditionIsMet : false, result : undefined, exception : undefined, elapsedTime }
            }

            await delay(interval)
        }

    } while (!value)

    return { conditionIsMet : true, result : value, exception : undefined, elapsedTime : Date.now() - start }
}
