import path from 'path'
import { fileURLToPath } from "url"
import { Channel } from "../../rpc/channel/Channel.js"
import { ChannelNodeIpc } from "../../rpc/channel/ChannelNodeIpc.js"
import { ChannelSameContext } from "../../rpc/channel/ChannelSameContext.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { Colorer } from "../../jsx/Colorer.js"
import { ColorerNodejs } from "../../jsx/ColorerNodejs.js"
import { ColorerNoop } from "../../jsx/ColorerNoop.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { ProjectDescriptorNodejs } from "../project/ProjectDescriptor.js"
import { ReporterNodejs } from "../reporter/ReporterNodejs.js"
import { ReporterNodejsTerminal } from "../reporter/ReporterNodejsTerminal.js"
import { TestDescriptorNodejs } from "../test/TestDescriptorNodejs.js"
import { ExitCodes, Launcher, LauncherError, OptionsGroupOutput, OptionsGroupPrimary, PrepareOptionsResult } from "./Launcher.js"
import { option } from "../option/Option.js"
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
                Project file url.
            </span>
        })
        project             : string            = ''

        @option({
            type        : 'boolean',
            group       : OptionsGroupOutput,
            help        : <div>
                Whether to suppress the output coloring. Also suppresses the progress bar and spinner.
                Automatically enforced if output stream is not a terminal.
            </div>
        })
        noColor         : boolean               = false


        reporterClass   : typeof ReporterNodejs             = ReporterNodejsTerminal
        colorerClass    : typeof Colorer                    = ColorerNodejs

        projectDescriptorClass : typeof ProjectDescriptorNodejs   = ProjectDescriptorNodejs
        testDescriptorClass : typeof TestDescriptorNodejs   = TestDescriptorNodejs



        get targetContextChannelClass () : typeof Channel {
            return ChannelNodeIpc
        }


        getMaxLen () : number {
            return process.stdout.columns ?? Number.MAX_SAFE_INTEGER
        }


        print (str : string) {
            process.stdout.write(str)
        }


        $projectExtractorChannelClass : typeof ChannelProjectExtractor  = undefined

        get projectExtractorChannelClass () : typeof ChannelProjectExtractor {
            if (this.$projectExtractorChannelClass !== undefined) return this.$projectExtractorChannelClass

            // TODO this should use other channel, when launching browser project
            return this.$projectExtractorChannelClass = class ChannelProjectExtractorImplementation extends Mixin(
                [ ChannelProjectExtractor, ChannelSameContext ],
                (base : ClassUnion<typeof ChannelProjectExtractor, typeof ChannelSameContext>) =>

                class ChannelProjectExtractorImplementation extends base {}
            ) {}
        }


        onLauncherOptionsAvailable () {
            super.onLauncherOptionsAvailable()

            if (this.noColor || !process.stdout.isTTY) {
                this.colorerClass       = ColorerNoop
                this.reporterClass      = ReporterNodejs
            }
        }


        prepareLauncherOptions () : PrepareOptionsResult {
            const res               = super.prepareLauncherOptions()

            const projectFileUrl    = this.project || this.argv[ 0 ]

            if (!projectFileUrl && !this.projectData) throw LauncherError.new({
                exitCode        : ExitCodes.INCORRECT_ARGUMENTS,
                annotation      : <div>
                    <p><span class="log_message_error"> ERROR </span> <span class="accented">No argument for project file url </span></p>
                    <div>
                        You can specify the project file location with <span class="option_name">--project</span> option
                        or by providing a positional argument:
                        <p class="indented">
                            npx siesta --project ./siesta.js
                        </p>
                        <p class="indented">
                            npx siesta ./siesta.js
                        </p>
                    </div>
                </div>
            })

            if (!this.project) this.project = this.argv[ 0 ]

            return res
        }


        onLauncherError (e : LauncherError) {
            super.onLauncherError(e)

            process.exitCode = e.exitCode
        }


        onUnknownError (e : unknown) {
            super.onUnknownError(e)

            console.log('Unhandled exception:', e)

            process.exit(ExitCodes.UNHANLED_EXCEPTION)
        }


        async setupProjectData () {
            await super.setupProjectData()

            // `projectDescriptor` might be already provided
            // if project file is launched directly as node executable
            if (!this.projectData) {
                const projectUrl            = this.project = this.prepareProjectFileUrl(this.project)

                const channel : ChannelProjectExtractor    = this.projectExtractorChannelClass.new()

                await channel.setup()

                const parentPort            = channel.parentPort

                try {
                    this.projectData  = await parentPort.extractProject(projectUrl)
                } finally {
                    await parentPort.disconnect()
                }
            }

            if (this.project) {
                this.projectData.projectPlan.url   = this.project.replace(/\/[^/]*?$/, '')
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


        static async run () {
            process.on('unhandledRejection', (reason, promise) => {
                console.log('Unhandled promise rejection, reason:', reason)

                process.exit(ExitCodes.UNHANLED_EXCEPTION)
            })

            const launcher  = this.new({
                inputArguments      : process.argv.slice(2)
            })


            const launch        = await launcher.start()

            // we just set the `exitCode` property and not call `process.exit()` directly,
            // because some output might not be processed yet
            // slight risk of leaking some async cyclic process
            process.exitCode    = process.exitCode ?? launch.getExitCode()
        }
    }

    return LauncherNodejs
}) {}
