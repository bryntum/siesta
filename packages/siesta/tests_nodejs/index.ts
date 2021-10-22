import { Project } from "../nodejs.js"

const project = Project.new({
    title                   : 'Siesta 6 Node.js specific test suite',

    testDescriptor          : {}
})

project.includeDir('./')
project.excludeDir('./@sample_test_suites')

project.start()

