import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { XmlNode } from "../../jsx/XmlElement.js"
import { LogLevel, LogMethod } from "../../logger/Logger.js"
import { LoggerHookable } from "../../logger/LoggerHookable.js"
import { parse } from "../../serializable/Serializable.js"
import { SerializerXml } from "../../serializer/SerializerXml.js"
import { isString } from "../../util/Typeguards.js"
import { EnvironmentType } from "../common/Environment.js"
import { Context } from "../context/Context.js"
import { option } from "../option/Option.js"
import { ProjectSerializableData } from "../project/ProjectDescriptor.js"
import { LogMessage } from "../test/TestResult.js"
import { ExitCodes, Launcher, LauncherError, OptionsGroupOutput, OptionsGroupPrimary } from "./Launcher.js"
import { extractProjectInfo } from "./ProjectExtractor.js"

// generic sever-side, cross Node/Deno functionality
// DO NOT USE THE NODE.JS/NPM/DENO MODULES HERE

//---------------------------------------------------------------------------------------------------------------------
export class LauncherTerminal extends Mixin(
    [ Launcher ],
    (base : ClassUnion<typeof Launcher>) => {

    class LauncherTerminal extends base {
        logger                  : LoggerHookable            = LoggerHookable.new({ logLevel : LogLevel.warn })

        // region options
        @option({
            type        : 'string',
            group       : OptionsGroupPrimary,
            help        : <span>
                Project file url. Can be either a regular filesystem path, or http-based URL, or a `file://` url
            </span>
        })
        project             : string            = ''

        @option({
            type        : 'boolean',
            group       : OptionsGroupOutput,
            defaultValue : () => false,
            help        : <div>
                Whether to suppress the output coloring. Also suppresses the progress bar and spinner.
                Automatically enforced if output stream is not a terminal.
            </div>
        })
        noColor         : boolean               = false

        @option({
            type        : 'string',
            structure   : 'enum',
            enumeration : [ 'dark', 'light', 'universal' ],
            defaultValue : () => 'universal',
            group       : OptionsGroupOutput,
            help        : <span>
                The output theme.
            </span>
        })
        theme           : string            = 'universal'

        // endregion


        initialize (props? : Partial<LauncherTerminal>) {
            super.initialize(props)

            this.logger.onLogMessageHook.on((method : LogMethod, message : unknown[]) => {
                this.write(LogMessage.new({
                    type        : 'log',
                    level       : LogLevel[ method ],
                    message     : this.prepareLogMessage(...message)
                }).template(false))
            })
        }


        prepareLogMessage (...messages : unknown[]) : XmlNode[] {
            // if (messages.length === 1)
                return messages.map(message => isString(message) ? message : SerializerXml.serialize(message/*, this.descriptor.serializerConfig*/))
            // else
            //     return [ SerializerXml.serialize(messages/*, this.descriptor.serializerConfig*/) ]
        }


        getEnvironmentByUrl (url : string) : EnvironmentType {
            return /^https?:/.test(url) ? 'browser' : 'nodejs'
        }


        async onLauncherOptionsAvailable () {
            // setup theme as early as possible to have right styling of error messages, which might
            // appear right in this method
            await this.setupTheme()

            await super.onLauncherOptionsAvailable()

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
        }


        async extractProjectData (context : Context, projectUrl : string) : Promise<ProjectSerializableData> {
            try {
                return parse(await context.evaluateBasic(extractProjectInfo, projectUrl))
            } catch (e) {
                const [ message, stack ]    = e.message.split(String.fromCharCode(0))

                throw LauncherError.new({
                    annotation      : <div>
                        <span class="log_message_error"> ERROR </span> <span class="accented">{ message }</span>
                        <div>
                            { stack }
                        </div>
                    </div>,
                    exitCode        : ExitCodes.EXCEPTION_IN_PROJECT_FILE
                })
            } finally {
                await context.destroy()
            }
        }


        async setupTheme () {
            this.styles         = (await import(`../reporter/styling/theme_${ this.theme }.js`)).styles
        }
    }

    return LauncherTerminal
}) {}
