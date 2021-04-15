//---------------------------------------------------------------------------------------------------------------------
type ProjectExtractionState  = 'extraction_requested' | 'project_created' | 'project_ready'

export type SiestaProjectExtraction  = {
    projectUrl  : string,
    state       : ProjectExtractionState,
    resolve     : (projectData : string) => any
}

//---------------------------------------------------------------------------------------------------------------------
export const extractProjectInfo     = async (projectUrl : string) : Promise<string> => {

    Object.defineProperty(globalThis, '__SIESTA_PROJECT_EXTRACTION__', {
        enumerable      : false,
        value           : {
            projectUrl,
            state       : 'extraction_requested',
            resolve     : undefined
        } as SiestaProjectExtraction
    })

    const extraction    = globalThis.__SIESTA_PROJECT_EXTRACTION__ as SiestaProjectExtraction

    const promise       = new Promise<string>(resolve => extraction.resolve = resolve)

    try {
        await import(projectUrl)
    } catch (e) {
        throw new Error('Exception when importing a project file - wrong path/URL?' + String.fromCharCode(0) + e.stack)
    }

    if (extraction.state === 'extraction_requested') {
        throw new Error('The project instance has not been created during importing of project file - wrong path/URL?')
    }

    let projectData : string

    try {
        projectData     = await promise
    } catch (e) {
        throw new Error('Exception when running a project file' + String.fromCharCode(0) + e.stack)
    }

    return projectData
}
