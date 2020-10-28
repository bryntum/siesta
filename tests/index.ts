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
        group       : 'Class',

        items       : [
            'class/020_mixin.t.js',
            'class/030_mixin_caching.t.js'
        ]
    },
    {
        group       : 'Iterator',

        items       : [
            'collection/010_chained_iterator.t.js',
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
