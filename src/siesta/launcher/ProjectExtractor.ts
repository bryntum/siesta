import { Project } from "../project/Project.js"

//---------------------------------------------------------------------------------------------------------------------
type ProjectExtractionState  = 'extraction_requested' | 'project_created' | 'project_ready'

export type SiestaProjectExtraction  = { state : ProjectExtractionState, resolve : (project : Project) => any }

//---------------------------------------------------------------------------------------------------------------------
export const extractProjectInfo     = async (projectUrl : string) : Promise<string> => {

    Object.defineProperty(globalThis, '__SIESTA_PROJECT_EXTRACTION__', {
        enumerable      : false,
        value           : {
            state       : 'extraction_requested',
            resolve     : undefined
        } as SiestaProjectExtraction
    })

    const extraction    = globalThis.__SIESTA_PROJECT_EXTRACTION__ as SiestaProjectExtraction

    const promise       = new Promise<Project>(resolve => extraction.resolve = resolve)

    try {
        await import(projectUrl)
    } catch (e) {
        throw new Error('Exception importing project file - wrong path/URL?' + String.fromCharCode(0) + e.stack)
    }

    if (extraction.state === 'extraction_requested') {
        throw new Error('The project instance has not been created during importing of project file - wrong path/URL?')
    }

    let project : Project

    try {
        project             = await promise
    } catch (e) {
        throw new Error('Exception while running the project file' + String.fromCharCode(0) + e.stack)
    }

    return project.asProjectDataSerialized()
}
