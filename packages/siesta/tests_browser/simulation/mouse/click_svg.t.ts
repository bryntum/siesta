import { beforeEach, it } from "../../../browser.js"


beforeEach(() => {
    document.body.innerHTML = ''
})


it("should support clicking SVG element with float values", async t => {
    document.body.innerHTML =
        '<svg width="800px" height="800px">' +
            '<rect id="myrect" x="50.5" y="50.5" width="100.2" height="100.1"></rect>' +
        '</svg>'

    const firstRect = t.$('#myrect')

    t.firesOnce(firstRect, [
        'mouseover',
        'mouseout',
        'mouseenter',
        'mouseleave',
        'mousedown',
        'mouseup',
        'click',
    ])

    await t.click('#myrect')

    // Should trigger inner element 'mouseout' event + 'mouseleave' event
    await t.moveMouse([ 2, 150 ])
})


it("should support clicking SVG element with translate values", async t => {
    document.body.innerHTML =
        '<svg width="800px" height="800px">' +
        '   <g transform="translate(0.5,0.5)"><rect id="myrect" x="50" y="50" width="100" height="100"></rect></g>' +
        '</svg>'

    const firstRect = t.$('svg > g rect')

    t.firesOnce(firstRect, [
        'mouseover',
        'mouseout',
        'mouseenter',
        'mouseleave',
        'mousedown',
        'mouseup',
        'click',
    ])

    await t.click('#myrect')

    // Should trigger inner element 'mouseout' event + 'mouseleave' event
    await t.moveMouse([ 2, 150 ])
})


// OLD code: !bowser.msie && !bowser.msedge && !bowser.gecko && it("should
// seems not supposed to work in Firefox?
it("should support clicking SVG element with scaled values", async t => {
    document.body.innerHTML =
        '<svg width="800px" height="800px" style="position:absolute;left:100px;top:100px">' +
        '   <g transform="scale(0.5)"><rect id="myrect" x="50" y="50" width="100" height="100"></rect>' +
        '   </g>' +
        '</svg>'

    const firstRect = t.$('svg > g rect')

    t.firesOnce(firstRect, [
        'mouseover',
        'mouseout',
        'mouseenter',
        'mouseleave',
        'mousedown',
        'mouseup',
        'click',
    ])

    await t.click('#myrect')

    // Should trigger inner element 'mouseout' event + 'mouseleave' event
    await t.moveMouse([ 2, 150 ])
})


it("should support clicking a polyline", async t => {
    document.body.innerHTML =
        '<svg style="width: 1px;height: 1px;overflow: visible;position: absolute;pointer-events: none;">' +
            '<marker id="arrowStart" markerWidth="12" markerHeight="12" refX="1" refY="3" viewBox="0 0 9 6" orient="auto" markerUnits="userSpaceOnUse">' +
                '<path d="M0,3 L9,6 L9,0 z"></path>' +
            '</marker>' +
            '<marker id="arrowEnd" markerWidth="12" markerHeight="12" refX="8" refY="3" viewBox="0 0 9 6" orient="auto" markerUnits="userSpaceOnUse">' +
                '<path d="M0,0 L0,6 L9,3 z"></path>' +
            '</marker>' +
            '<polyline ' +
                'style="pointer-events:all;fill: transparent;marker-end: url(#arrowEnd);stroke: #999;stroke-width: 1;" ' +
                'class="b-sch-dependency" depId="1" points="300,22.5 312,22.5 312,22.5 312,37 312,37 188,37 188,37 188,68.5 188,68.5 200,68.5">' +
            '</polyline>' +
        '</svg>'

    t.firesOk({
        observable      : '.b-sch-dependency',
        events          : {
            click   : 1
        }
    })

    await t.click('.b-sch-dependency', [ 0, '50%' ])
})


it('moving mouse to svg element should work', async t => {
    document.body.innerHTML = [
        '<svg>',
            '<marker ' +
                'xmlns="http://www.w3.org/2000/svg" id="arrowEnd" viewBox="0 0 9 6" refX="8" refY="3" ' +
                'markerUnits="userSpaceOnUse" markerWidth="12" markerHeight="12" orient="auto"><path d="M 0 0 L 0 6 L 9 3 Z" />' +
            '</marker>',
            '<polyline style="stroke:#999; marker-end:url(#arrowEnd)" class="target-line" points="100,100 120,120"></polyline>',
        '</svg>'
    ].join('')

    t.firesOnce('.target-line', [ 'mouseover', 'mouseenter', 'click' ])

    await t.click('.target-line')
})
