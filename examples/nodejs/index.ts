import { Project } from "../../main.js"
import { Test as CustomTestClass } from "../../src/siesta/test/Test.js"

const project = Project.new({
    name                    : 'Siesta test suite',

    // global options
    options                 : { testClass : CustomTestClass }
})


project.planGlob('**/*.t.js')

project.planDir('tests', { testClass : CustomTestClass })

project.planFile('tests2/some_test.t.js', { testClass : CustomTestClass })

project.start()

