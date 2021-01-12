import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { isNodejs } from "../../util/Helpers.js"
import { Project } from "./Project.js"


//---------------------------------------------------------------------------------------------------------------------
export class ProjectIsomorphic extends Mixin(
    [ Project ],
    (base : ClassUnion<typeof Project>) => {

    class ProjectIsomorphic extends base {
        actualProject       : Project       = undefined


        async start () {
            if (!this.actualProject) {
                const cls           = await this.getIsomorphicProjectClass()

                const config        = Object.assign({}, this)

                delete config.launcherClass

                this.actualProject  = cls.new(config)
            }

            return this.actualProject.start()
        }


        async getIsomorphicProjectClass () : Promise<typeof Project> {
            if (isNodejs())
                return (await import('./ProjectNodejs.js')).ProjectNodejs
            else
                return (await import('./ProjectBrowser.js')).ProjectBrowser
        }
    }

    return ProjectIsomorphic
}) {}
