declare let Siesta : any

let project : any

if (typeof process !== 'undefined' && typeof require !== 'undefined') {
    Siesta          = require('siesta-lite')

    project         = new Siesta.Project.NodeJS()
} else {
    project         = new Siesta.Project.Browser()
}

project.configure({
    title                   : 'Siesta test suite',
    isEcmaModule            : true
})


project.start(
    {
        group       : 'Deep compare',

        items       : [
            'deep_compare/deep_compare.t.js'
        ]
    },
    {
        group       : 'Serializer',

        items       : [
            'serializer/serializer.t.js'
        ]
    },
    {
        group       : 'Util',

        items       : [
            'util/uniqable.t.js'
        ]
    },
    {
        group       : 'Events',

        items       : [
            'event/events.t.js'
        ]
    }
)
