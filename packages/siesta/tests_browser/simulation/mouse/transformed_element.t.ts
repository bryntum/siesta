import { beforeEach, it } from "../../../browser.js"

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
beforeEach(() => {
    document.body.innerHTML = ''
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should support clicking on the rotated element, 90 deg', async t => {
    document.body.innerHTML =
        "<div style='width: 400px; height: 20px; transform: rotate(90deg); transform-origin: left bottom'>" +
            "<p id='p1'>Some long text</p>" +
        "</div>"

    t.firesOnce('#p1', 'click')

    await t.click('#p1')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should support clicking on the rotated element, 45 deg', async t => {
    document.body.innerHTML =
        "<div style='width: 400px; height: 20px; transform: rotate(45deg); transform-origin: left bottom'>" +
            "<p id='p2'>Some long text</p>" +
        "</div>"

    t.firesOnce('#p2', 'click')

    await t.click('#p2')
})


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
it('Should support clicking on the rotated element, 30 deg', async t => {
    document.body.innerHTML =
        "<div style='width: 400px; height: 20px; transform: rotate(15deg); transform-origin: left bottom'>" +
            "<p id='p3'>Some very very very long text, yes, very long</p>" +
        "</div>"

    t.firesOnce('#p3', 'click')

    await t.click('#p3')
})
