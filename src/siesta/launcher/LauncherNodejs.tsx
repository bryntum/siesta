import path from 'path'
import { fileURLToPath } from "url"
import { Channel } from "../../channel/Channel.js"
import { ChannelNodeIpc } from "../../channel/ChannelNodeIpc.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { SiestaJSX } from "../jsx/Factory.js"
import { Colorer } from "../reporter/Colorer.js"
import { ColorerNodejs } from "../reporter/ColorerNodejs.js"
import { Reporter } from "../reporter/Reporter.js"
import { ReporterNodejs } from "../reporter/ReporterNodejs.js"
import { ExitCodes, Launcher, LauncherError, OptionsGroupOutput, OptionsGroupPrimary } from "./Launcher.js"
import { option } from "./Option.js"
import { ChannelProjectExtractor } from "./ProjectExtractor.js"


//---------------------------------------------------------------------------------------------------------------------
export class LauncherNodejs extends Mixin(
    [ Launcher ],
    (base : ClassUnion<typeof Launcher>) => {

    class LauncherNodejs extends base {

        @option({
            type        : 'string',
            group       : OptionsGroupPrimary,
            help        : <span>
                Project file url
            </span>
        })
        project             : string            = ''

        @option({
            type        : 'boolean',
            group       : OptionsGroupOutput,
            help        : <span>
                Project file url
            </span>
        })
        noColor         : boolean           = false


        c               : Colorer               = ColorerNodejs.new()

        reporterClass   : typeof Reporter       = ReporterNodejs
        colorerClass    : typeof Colorer        = ColorerNodejs


        // channelConstructors     : (typeof Channel)[]      = [ ChannelNodeIpc ]


        get targetContextChannelClass () : typeof Channel {
            return ChannelNodeIpc
        }


        print (str : string) {
            process.stdout.write(str)
        }


        $projectExtractorChannelClass : typeof ChannelProjectExtractor  = undefined

        get projectExtractorChannelClass () : typeof ChannelProjectExtractor {
            if (this.$projectExtractorChannelClass !== undefined) return this.$projectExtractorChannelClass

            return this.$projectExtractorChannelClass = class ChannelProjectExtractorImplementation extends Mixin(
                [ ChannelProjectExtractor, this.targetContextChannelClass ],
                (base : ClassUnion<typeof ChannelProjectExtractor, typeof Channel>) =>

                class ChannelProjectExtractorImplementation extends base {}
            ) {}
        }


        prepareLauncherOptions () {
            super.prepareLauncherOptions()

            const projectFileUrl    = this.project || this.argv[ 0 ]

            if (!projectFileUrl) throw LauncherError.new({
                exitCode        : ExitCodes.INCORRECT_ARGUMENTS,
                annotation      : <div>
                    <p><span class="log_message_error"> ERROR </span> <span class="accented">No argument for project file url </span></p>
                    <unl>
                        You can specify the project file location with <span class="option_name">--project</span> option
                        or by providing a positional argument:
                        <li>
                            npx siesta --project ./siesta.js
                        </li>
                        <li>
                            npx siesta ./siesta.js --some_option=1
                        </li>
                    </unl>
                </div>,
            })

            if (!this.project) this.project = this.argv[ 0 ]
        }


        prepareProjectOptions () {
            super.prepareProjectOptions()
        }


        async setupInner () {
            await super.setupInner()

            // `projectDescriptor` might be already provided
            // if project file is launched directly as node executable
            if (!this.projectDescriptor) {
                const channel : ChannelProjectExtractor    = this.projectExtractorChannelClass.new()

                await channel.setup()

                const parentPort            = channel.parentPort

                try {
                    const projectUrl        = this.prepareProjectFileUrl(this.project)

                    this.projectDescriptor  = await parentPort.extractProject(projectUrl)

                    this.projectDescriptor.projectPlan.descriptor.url   = projectUrl.replace(/\/[^/]*?$/, '')
                } finally {
                    await parentPort.disconnect()
                }
            }
        }


        prepareProjectFileUrl (url : string) : string {
            if (/https?:/i.test(url)) {

            }
            else if (/file:/.test(url)) {
                return path.resolve(fileURLToPath(url))
            }
            else {
                // assume plain fs path here
                return path.resolve(url)
            }

            return url
        }
    }

    return LauncherNodejs
}) {}
