import { it } from "../../../index.js"
import { verifyAllFailed } from "../@helpers.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Function property calls assertions should work', async t => {
    const scope       = {}

    const obj = {
        indirect        : function () {
            t.isStrict(this, scope, "Correct scope during indirect call")
        },
        direct          : function () {
            this.indirect.call(scope)
        },

        fnCalled        : function () {},
        fnNotCalled     : function () {},

        fn2             : function () {},
        fn3             : function () {}
    }

    t.isCalled(obj.indirect, obj, 'Indirect call detected')
    t.isCalled(obj.fnCalled, obj, 'isCalled')
    t.isntCalled(obj.fnNotCalled, obj, 'isntCalled')
    t.isCalledNTimes(obj.fn2, obj, 0, 'isCalledNTimes')
    t.isCalledNTimes(obj.fn3, obj, 1, 'isCalledNTimes')

    obj.fnCalled()
    obj.fn3()
    obj.direct()

    //------------------
    t.todo('Should all fail', async t => {

        const obj = {
            fnCalled        : function () {},
            fnNotCalled     : function () {},
            fn2             : function () {}
        }

        t.isCalled(obj.fnNotCalled, obj, 'isCalled failed OK')
        t.isntCalled(obj.fnCalled, obj, 'isntCalled failed OK')
        t.isCalledNTimes(obj.fn2, obj, 2, 'isCalledNTimes failed OK')

        obj.fnCalled()

    }).postFinishHook.on(todoTest => verifyAllFailed(todoTest, t))
})

