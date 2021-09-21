//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
type DedicatedWorkerGlobalScope = any

declare const self : DedicatedWorkerGlobalScope

// poor-man, zero-dep `evaluate` handler
self.addEventListener('message', async event => {
    if (event.data.__SIESTA_CONTEXT_EVALUATE_REQUEST__) {
        const func      = globalThis.eval('(' + event.data.functionSource + ')')

        try {
            const result    = await func(...event.data.arguments)

            self.postMessage({ __SIESTA_CONTEXT_EVALUATE_RESPONSE__ : true, status : 'resolved', result })
        } catch (rejected) {
            const stack         = String(rejected.stack || '')
            const message       = String(rejected.message || '')

            self.postMessage({ __SIESTA_CONTEXT_EVALUATE_RESPONSE__ : true, status : 'rejected', result : { stack, message } })
        }
    }
})


export {}
