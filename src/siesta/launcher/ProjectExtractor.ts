import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { local, Port, remote } from "../../port/Port.js"
import { Channel } from "../channel/Channel.js"
import { Project } from "../project/Project.js"

//---------------------------------------------------------------------------------------------------------------------
interface ProjectExtractor {
    extractProject (projectUrl : string, options : Map<string, unknown>) : Promise<Project>
}

//---------------------------------------------------------------------------------------------------------------------
export class ProjectExtractorParent extends Mixin(
    [ Port ],
    (base : ClassUnion<typeof Port>) => {

        class ProjectExtractorParent extends base implements ProjectExtractor {

            @remote()
            extractProject : (projectUrl : string, options : Map<string, unknown>) => Promise<Project>
        }

        return ProjectExtractorParent
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class ProjectExtractorChild extends Mixin(
    [ Port ],
    (base : ClassUnion<typeof Port>) => {

        class ProjectExtractorChild extends base implements ProjectExtractor {
            @local()
            async extractProject (projectUrl : string, options : Map<string, unknown>) : Promise<Project> {
                return 123

                // globalThis.__SIESTA_PROJECT_EXTRACTOR_CONTEXT__ = true
                //
                // let res : Project
                //
                // try {
                //     await import(projectUrl)
                //
                //     res     = globalThis.__SIESTA_PROJECT_EXTRACTOR_CONTEXT__
                // } catch (e) {
                //     //debugger
                //     console.log(e)
                // } finally {
                // }
                //
                // return res
            }
        }

        return ProjectExtractorChild
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class ChannelProjectExtractor extends Mixin(
    [ Channel, Base ],
    (base : ClassUnion<typeof Channel, typeof Base>) => {

        class ChannelProjectExtractor extends base {
            parentPort              : ProjectExtractorParent     = undefined

            parentPortClass         : typeof ProjectExtractorParent  = ProjectExtractorParent
        }

        return ChannelProjectExtractor
    }
) {}
