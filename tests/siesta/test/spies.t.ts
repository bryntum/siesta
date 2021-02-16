import { describe } from "../../../main.js"
import { Spy } from "../../../src/siesta/test/Spy.js"

describe('Spy executing strategies', t => {
    let obj : { someProp : any, setSomeProp : (...args) => typeof obj }
    let obj2 : { someProp : any, setSomeProp : (...args) => typeof obj2 }

    t.beforeEach(t => {
        obj     = {
            someProp            : null,
            setSomeProp         : function (value) { this.someProp = value; return this }
        }
    })


    t.it("Spy should track the calls to it", t => {
        const spy = t.spyOn(obj, 'setSomeProp')

        obj.setSomeProp()
        obj.setSomeProp(0, 1, 1)
        obj.setSomeProp(0, 1)

        t.expect(obj.setSomeProp).toHaveBeenCalled()
        t.expect(obj.setSomeProp).toHaveBeenCalledWith(0, 1, t.any(Number))

        t.is(obj.someProp, 0, "`someProp` has change")

        t.isInstanceOf(spy, Spy)

        t.is(spy.calls.any(), true)
        t.is(spy.calls.count(), 3)

        t.equal(spy.calls.argsFor(2), [ 0, 1 ])
        t.equal(spy.calls.allArgs(), [ [], [ 0, 1, 1 ], [ 0, 1 ] ])
        t.equal(spy.calls.mostRecent(), { object : obj, args : [ 0, 1 ], returnValue : obj })
        t.equal(spy.calls.first(), { object : obj, args : [], returnValue : obj })

        spy.calls.reset()

        t.is(spy.calls.any(), false)
        t.is(spy.calls.count(), 0)
    })


    t.it("Spy should be able to call through and stub", t => {
        const spy = t.spyOn(obj, 'setSomeProp').callThrough()

        obj.setSomeProp(1)

        t.expect(obj.setSomeProp).toHaveBeenCalled()

        t.is(obj.someProp, 1, "`someProp` has changed")

        spy.stub()

        obj.setSomeProp(11)

        t.is(obj.someProp, 1, "`someProp` hasn't changed")
    })


    t.it("Spy should be able to call fake", t => {
        const spy = t.spyOn(obj, 'setSomeProp').callFake(function (this : typeof obj) { this.someProp = 11; return obj2 })

        t.is(obj.setSomeProp(1), obj2, 'Return value from fake function')

        t.expect(spy).toHaveBeenCalledWith(1)

        t.is(obj.someProp, 11, "`someProp` has been changed by the fake function")
    })


    t.it("Spy should be able to throw", t => {
        t.spyOn(obj, 'setSomeProp').throwError('wrong')

        t.expect(() => obj.setSomeProp(1)).toThrow('wrong')
    })


    t.it("Spy should be able to return value", t => {
        t.spyOn(obj, 'setSomeProp').returnValue(obj2)

        t.is(obj.setSomeProp(1), obj2, "`someProp` has been changed by the fake function")
        t.is(obj.someProp, null, "`someProp` hasn't change")
    })
})


describe('Standalone spies', t => {

    t.it("Should be able to create a spy", t => {
        const spy     = t.createSpy('007')

        spy()
        spy(0, 1)
        spy(0, 1, '1')

        t.expect(spy).toHaveBeenCalled()
        t.expect(spy).toHaveBeenCalledWith(0, t.any(Number), t.any(String))

        t.isInstanceOf(spy.spy, Spy)

        t.is(spy.spy.calls.any(), true)
        t.is(spy.spy.calls.count(), 3)

        spy.spy.calls.reset()

        t.is(spy.spy.calls.any(), false)
        t.is(spy.spy.calls.count(), 0)
    })

    t.it("Should be able to create a spy object", t => {
        const spyObj  = t.createSpyObj([ 'shoot', 'seduce'])

        // @ts-ignore
        t.equal(spyObj, { shoot : t.any(Function), seduce : t.any(Function) })

        spyObj.shoot('gun')
        spyObj.seduce('Girl1')
        spyObj.seduce('Girl2')

        t.expect(spyObj.shoot).toHaveBeenCalledWith('gun')
        t.expect(spyObj.seduce).toHaveBeenCalledWith('Girl1')
        t.expect(spyObj.seduce).toHaveBeenCalledWith('Girl2')
    })
})


describe('Spies removal after the spec', t => {
    const obj     = {
        someProp            : null,
        setSomeProp         : function (...args : unknown[]) { this.someProp = args[ 0 ]; return this }
    }

    t.it("Setting up the spy", t => {
        const spy     = t.spyOn(obj, 'setSomeProp').stub()

        obj.setSomeProp()
        obj.setSomeProp(0, 1, '1')
        obj.setSomeProp(0, '1')

        t.is(obj.someProp, null, "`someProp` has not change")

        t.expect(spy).toHaveBeenCalled()
        t.expect(spy).toHaveBeenCalledWith(0, t.any(Number), t.any(String))
    })

    t.it("Spy should be removed in this spec", t => {
        obj.setSomeProp(0)

        t.is(obj.someProp, 0, "`someProp` has change - spy has been removed")
    })
})
