import { Project } from "../../main.js"
import { Test as CustomTestClass } from "../../src/siesta/test/Test.js"

const project = Project.new({
    name                    : 'Siesta test suite',

    // global test-specific options
    options                 : { testClass : CustomTestClass }
})

project.planDir('basic', { tags : [ 'tag_dir' ], testClass : CustomTestClass })

project.planFile('basic/assertions.t.js', { tags : [ 'tag_file' ] })


project.planGlob('advanced/**/*.t.js', { tags : [ 'tag_glob' ] })

project.planFile('advanced/assertions.t.js', { testClass : CustomTestClass })

project.start()

