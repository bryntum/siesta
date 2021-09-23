import { beforeEach, it } from "../../../browser.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    document.body.innerHTML = ''
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should be possible to press modifier keys when typing', async t => {
    document.body.innerHTML = '<input id="txt" type="text">'

    const field     = t.$('#txt') as HTMLInputElement

    const doAssert  = (e : KeyboardEvent) => {
        if (e.key === 'z') {
            t.true(e.ctrlKey, e.type + ': Ctrl key detected')
            t.true(e.shiftKey, e.type + ': Shift key detected')
            t.true(e.altKey, e.type + ': Alt key detected')
            t.true(e.metaKey, e.type + ': Meta key detected')
        }
    }

    field.addEventListener('keydown', doAssert)
    field.addEventListener('keypress', doAssert)
    field.addEventListener('keyup', doAssert)

    await t.type('#txt', 'z', { shiftKey : true, ctrlKey : true, altKey : true, metaKey : true })
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should not type any chars when Cmd/Ctrl are pressed', async t => {
    document.body.innerHTML = '<input type="text" id="foo"/>'

    const field     = t.$('#foo') as HTMLInputElement

    const isMac = t.env.isMac

    await t.type('#foo', 'z', { [ isMac ? 'metaKey' : 'ctrlKey' ] : true })

    t.expect(field.value).toBe('')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Typing F4', async t => {
    document.body.innerHTML = '<input type="text" id="foo"/>'

    const field     = t.$('#foo') as HTMLInputElement

    await t.type('#foo', '[F4]')

    t.expect(field.value).toBe('')
})


// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// it('Typing [something]', async t => {
//     document.body.innerHTML = '<input type="text" id="foo2"/>'
//
//     t.chain(
//         { click : '#foo2' },
//
//         { type : '[test]', target : '#foo2' },
//
//         function () {
//             t.expect($('#foo2').val()).toBe('[test]')
//         }
//     )
// })
//
// //━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// it('Typing `[F3]` (as text)', async t => {
//     document.body.innerHTML = '<input type="text" id="foo3"/>'
//
//     t.chain(
//         { click : '#foo3' },
//
//         { type : '[[F3]]', target : '#foo3' },
//
//         function (next) {
//             t.expect($('#foo3').val()).toBe('[F3]')
//
//             next()
//         },
//
//         { type : '[[[F3]]]', target : '#foo3', clearExisting : true },
//
//         function (next) {
//             t.expect($('#foo3').val()).toBe('[[F3]]')
//
//             next()
//         },
//
//         { type : '[[[BACKSPACE]]', target : '#foo3', clearExisting : true },
//
//         function (next) {
//             t.expect($('#foo3').val()).toBe('[[BACKSPACE]')
//
//             next()
//         },
//
//         { type : '[[something]]', target : '#foo3', clearExisting : true },
//
//         function (next) {
//             t.expect($('#foo3').val()).toBe('[[something]]')
//
//             next()
//         }
//     )
// })
//
