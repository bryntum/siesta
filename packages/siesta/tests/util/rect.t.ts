import { it } from "../../index.js"
import { Rect } from "../../src/util/Rect.js"

let rect1        = Rect.new({
    left        : 10,
    top         : 10,
    width       : 1,
    height      : 1
})

let rect2       = Rect.new({
    left        : 100,
    top         : 100,
    right       : 109,
    bottom      : 109
})

let rect3       = Rect.new({
    left        : 105,
    top         : 105,
    right       : 107,
    bottom      : 118
})


it("Should calculate missing properties", t => {
    t.is(rect1.right, 10)
    t.is(rect1.bottom, 10)

    t.is(rect2.width, 10)
    t.is(rect2.height, 10)
})


it("`Contains` should work", t => {
    t.true(rect1.contains(10, 10), "Rect contains own px")
    t.false(rect1.contains(11, 10), "Rect does not contain different px")

    t.true(rect2.contains(105, 108))

    t.false(rect2.contains(110, 108))
})


it("`intersect` should work", t => {
    let result1         = rect1.intersect(rect2)
    let result2         = rect2.intersect(rect1)

    t.isInstanceOf(result1, Rect, "Result of interesection is a new rectangle instance")
    t.isInstanceOf(result2, Rect, "Result of interesection is a new rectangle instance")

    t.true(result1.isEmpty(), "And its empty")
    t.true(result2.isEmpty(), "And its empty")


    let result3         = rect2.intersect(rect3)
    let result4         = rect3.intersect(rect2)

    t.true(result3.isEqual(result4), "Both intersections have produced same results")

    t.is(result3.left, 105)
    t.is(result3.right, 107)
    t.is(result3.top, 105)
    t.is(result3.bottom, 109)
})


it("`cropLeftRight` should work", t => {
    let result1         = rect2.cropLeftRight(rect3)

    t.isInstanceOf(result1, Rect, "Result of `cropLeftRight` is a new rectangle instance")

    t.is(result1.left, 105)
    t.is(result1.right, 107)
    t.is(result1.top, 100)
    t.is(result1.bottom, 109)
})


it("`cropTopBottom` should work", t => {
    let result1         = rect2.cropTopBottom(rect3)

    t.isInstanceOf(result1, Rect, "Result of `cropTopBottom` is a new rectangle instance")

    t.is(result1.left, 100)
    t.is(result1.right, 109)
    t.is(result1.top, 105)
    t.is(result1.bottom, 109)
})
