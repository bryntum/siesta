export class PromiseSync<V> extends Promise<V> {

    resolved        : V         = undefined
    rejected        : any       = undefined


    constructor (executor : (resolve : (value : V | PromiseLike<V>) => void, reject : (reason? : any) => void) => void) {
        super(
            (resolve, reject) => executor(
                (value : V) => {
                    this.resolved       = value

                    resolve(value)
                },
                (reason? : any) => {
                    this.rejected       = reason

                    reject(reason)
                }
            )
        )
    }


    isResolved () : boolean {
        return this.resolved !== undefined
    }


    isRejected () : boolean {
        return this.rejected !== undefined
    }

    // derived instances are regular Promises
    static get [Symbol.species] () {
        return Promise
    }
}
