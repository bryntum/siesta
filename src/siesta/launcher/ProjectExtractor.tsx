import { TextJSX } from "../../jsx/TextJSX.js"
import { Project } from "../project/Project.js"

//---------------------------------------------------------------------------------------------------------------------
export const extractProjectInfo     = async (projectUrl : string) : Promise<string> => {

    Object.defineProperty(globalThis, '__SIESTA_PROJECT_EXTRACTION__', {
        enumerable      : false,
        value           : { resolve : undefined }
    })

    const extraction    = globalThis.__SIESTA_PROJECT_EXTRACTION__

    const promise       = new Promise<Project>(resolve => extraction.resolve = resolve)

    try {
        await import(projectUrl)
    } catch (e) {
        throw new Error('Exception importing project file - wrong path/URL?' + String.fromCharCode(0) + e.stack)
    }

    let project : Project

    try {
        project             = await promise
    } catch (e) {
        throw new Error('Exception while running the project file' + String.fromCharCode(0) + e.stack)
    }

    return project.asProjectDataSerialized()
}
