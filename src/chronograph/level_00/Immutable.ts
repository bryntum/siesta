import { AnyConstructor, ClassUnion, Mixin } from "../../class/Mixin.js"


//---------------------------------------------------------------------------------------------------------------------
export class Immutable extends Mixin(
    [],
    (base : AnyConstructor) =>

    class Immutable extends base {
        owner       : Owner         = undefined

        previous    : this          = undefined

        frozen      : boolean       = false


        freeze () {
            this.frozen = true
        }


        createNext (owner? : Owner) : this {
            this.freeze()

            const next      = new this.immutableCls()

            next.previous   = this
            next.owner      = owner || this.owner

            return next
        }


        get immutableCls () : AnyConstructor<this, typeof Immutable> {
            return this.constructor as AnyConstructor<this, typeof Immutable>
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class Owner extends Mixin(
    [],
    (base : AnyConstructor) =>

    class Owner extends base {
        immutable   : Immutable     = undefined


        immutableForWrite () : this[ 'immutable' ] {
            if (this.immutable.frozen) this.setCurrent(this.immutable.createNext())

            return this.immutable
        }


        setCurrent (immutable : this[ 'immutable' ]) {
            if (this.immutable && immutable && immutable.previous !== this.immutable) throw new Error("Invalid state thread")

            this.immutable = immutable
        }
    }
){}


//---------------------------------------------------------------------------------------------------------------------
export class CombinedOwnerAndImmutable extends Mixin(
    [ Immutable, Owner ],
    (base : ClassUnion<typeof Immutable, typeof Owner>) =>

    class CombinedOwnerAndImmutable extends base {
        owner           : Owner             = this

        immutable       : Immutable         = this


        get immutableCls () : AnyConstructor<this, typeof Immutable> {
            throw new Error("Abstract method called")
        }
    }
){}
