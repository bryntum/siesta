//---------------------------------------------------------------------------------------------------------------------
import { SetTimeoutHandler } from "./Helpers.js"

export const delay = (timeout : number) : Promise<any> => new Promise(resolve => setTimeout(resolve, timeout))

//---------------------------------------------------------------------------------------------------------------------
// it is recommended that the error instance, to throw on timeout, to be provided at the call site of this method
// this way, the stack trace will point to the `timeout` call, instead of the `timeout` internals
export const timeout = <T>(promise : Promise<T>, timeout : number, error : Error = new Error(`Timeout of ${ timeout }ms exceeded`)) : Promise<T> => {

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

//---------------------------------------------------------------------------------------------------------------------
export const buffer = <Args extends unknown[]>(func : (...args : Args) => unknown, timeout : number) : (...args : Args) => void => {
    let timeoutHandler : SetTimeoutHandler  = undefined

    return (...args : Args) => {
        if (timeoutHandler) clearTimeout(timeoutHandler)

        timeoutHandler      = setTimeout(() => {
            func(...args)
        }, timeout)
    }
}
