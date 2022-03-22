// import { ReactiveHTMLElement } from "../../../src/chronograph-jsx/ElementReactivity.js"
// import { SerialComponent } from "../../../src/serializer/SerialComponent.js"
//
// const difference1     = serialize(new Set([ { a : 1 } ]))
// const difference2     = serialize([ 1, 2 ])
//
//     // [1], [2]
//     // new Set([ 1, 2, 3, 4 ]), new Set([ 1, 2, 3, 4 ])
//     // { a : '0'.repeat(100) }, { a : '1'.repeat(300) }
//
//     // { a : 1, b : { c : { d : { e : 4 } } } }, { a : 1, b : { c : { d : { e : 5 } } } }
//     // /a/, /a/i
//     // 1, 2
//     // [ { a : { b : 2 } }, new Set([ 1 ]) ], [ 1, { c : 2 } ]
//
//     // new Map([ [ { a : 1 }, { aa : 2 } ], [ { b : 2 }, 2 ] ]),
//     // new Map([ [ { a : 1 }, { aa : 2 } ], [ { c : 3 }, 3 ] ])
//     // child, parent
//     // [ { a : 1 } ], [ 3 ]
//     // { a : 1, b : [ 2, 3 ], c : [ 6, 7 ] }, { a : 1, b : [ 3, 4, 5 ] }
//     // [ [ '1' ] ],
//     // [ [ '33333333333' ] ]
//
//     // [ [ '1', '2', [ [ '1', '2' ], 2, 3 ] ], 2, 3 ],
//     // [ [ '333333333333333333333333333333333333333333333333333333', '1', [ [ '1', '2' ], 2, 3 ] ], 2, 1 ]
//
// const comp      = SerialComponent.new({
//     serial        : difference1
// })
//
// // const comp      = SerialPairComponent.new({
// //     serial1        : difference1,
// //     serial2        : difference2
// // })
//
// const el        = comp.el as ReactiveHTMLElement
//
// // el.style.width = '800px'
// el.style.flex = '1'
// el.style.height = '400px'
// el.style.margin = '10px'
//
// document.body.appendChild(el)
