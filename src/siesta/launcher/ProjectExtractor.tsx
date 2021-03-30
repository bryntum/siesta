import { Base } from "../../class/Base.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { local, remote } from "../../port/Port.js"
import { PortHandshakeChild, PortHandshakeParent } from "../../port/PortHandshake.js"
import { Channel } from "../../channel/Channel.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { Project, projectExtraction } from "../project/Project.js"
import { ProjectSerializableData } from "../project/ProjectDescriptor.js"
import { ExitCodes, LauncherError } from "./Launcher.js"

//---------------------------------------------------------------------------------------------------------------------
interface ProjectExtractor {
    extractProject (projectUrl : string) : Promise<ProjectSerializableData>
}

//---------------------------------------------------------------------------------------------------------------------
export class ProjectExtractorParent extends Mixin(
    [ PortHandshakeParent ],
    (base : ClassUnion<typeof PortHandshakeParent>) => {

        class ProjectExtractorParent extends base implements ProjectExtractor {

            @remote()
            extractProject : (projectUrl : string) => Promise<ProjectSerializableData>
        }

        return ProjectExtractorParent
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class ProjectExtractorChild extends Mixin(
    [ PortHandshakeChild ],
    (base : ClassUnion<typeof PortHandshakeChild>) => {

        class ProjectExtractorChild extends base implements ProjectExtractor {
            @local()
            async extractProject (projectUrl : string) : Promise<ProjectSerializableData> {
                const promise                   = new Promise<Project>(resolve => projectExtraction.resolve = resolve)

                let res : Project

                try {
                    await import(projectUrl)
                } catch (e) {
                    throw LauncherError.new({
                        annotation      : <div>
                            <span class="log_message_error"> ERROR </span> <span class="accented">Exception importing project file - wrong path/URL?</span>
                            <div>
                                { e.stack }
                            </div>
                        </div>,
                        exitCode        : ExitCodes.EXCEPTION_IN_PROJECT_FILE
                    })
                }

                try {
                    res                         = await promise
                } catch (e) {
                    throw LauncherError.new({
                        annotation      : <div>
                            <span class="log_message_error"> ERROR </span> <span class="accented">Exception while running the project file</span>
                            <div>
                                { e.stack }
                            </div>
                        </div>,
                        exitCode        : ExitCodes.EXCEPTION_IN_PROJECT_FILE
                    })
                }

                return res.asProjectSerializableData()
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
            parentPort              : ProjectExtractorParent            = undefined
            parentPortClass         : typeof ProjectExtractorParent     = ProjectExtractorParent

            childPortClassUrl       : string                            = import.meta.url
            childPortClassSymbol    : string                            = 'ProjectExtractorChild'
        }

        return ChannelProjectExtractor
    }
) {}
