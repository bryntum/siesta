import { Project } from "./src/siesta/project/Project.js"
import { isNodejs } from "./src/util/Helpers.js"

export { it, describe } from "./src/siesta/test/Test.js"

export const GetIsomorphicProjectClass = async () : Promise<typeof Project> => {
    if (isNodejs())
        return (await import('./src/siesta/project/ProjectNodejs.js')).ProjectNodejs
    else
        return (await import('./src/siesta/project/ProjectBrowser.js')).ProjectBrowser
}
