import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { XmlNode } from "../../jsx/XmlElement.js"
import { LogLevel, LogMethod } from "../../logger/Logger.js"
import { LoggerHookable } from "../../logger/LoggerHookable.js"
import { parse } from "../../serializable/Serializable.js"
import { SerializerXml } from "../../serializer/SerializerXml.js"
import { isDeno, isNodejs } from "../../util/Helpers.js"
import { stripBasename } from "../../util/Path.js"
import { isString } from "../../util/Typeguards.js"
import { EnvironmentType } from "../common/Environment.js"
import { Context } from "../context/Context.js"
import { option } from "../option/Option.js"
import { ProjectSerializableData } from "../project/ProjectDescriptor.js"
import { ProjectTerminal } from "../project/ProjectTerminal.js"
import { LogMessage } from "../test/TestResult.js"
import { ExitCodes, Launcher, LauncherError, OptionsGroupOutput } from "./Launcher.js"
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
            enumeration : [ 'dark', 'light', 'universal', 'accessible' ],
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


        async setupProjectData () {
            await super.setupProjectData()

            // `projectDescriptor` might be already provided
            // if project file is launched directly as node executable
            if (!this.projectData) {
                const projectUrl                = this.project
                const projectClass              = await this.getProjectClass()

                // what is passed as the 1st argument for the launcher?
                if (this.runtime.isGlob(projectUrl)) {
                    // glob for test files
                    const project               = projectClass.new({ title : projectUrl, baseUrl : this.runtime.cwd() })

                    project.planGlob(projectUrl)

                    this.projectData                    = project.asProjectSerializableData()
                    this.projectData.projectPlan.url    = this.runtime.cwd()
                }
                else {
                    // non-glob - either project file url (https: or file:) or test file name

                    const projectUrl            = this.project = this.prepareProjectFileUrl(this.project)

                    if (/^https?:/i.test(projectUrl)) {
                        const contextProvider       = this.contextProviderBrowser[ 0 ]

                        const context               = await contextProvider.createContext()

                        await context.navigate(projectUrl)

                        this.projectData                    = await this.extractProjectData(context, projectUrl)
                        this.projectData.projectPlan.url    = stripBasename(this.project)
                    } else {
                        if (this.runtime.isDirectory(projectUrl)) {
                            const project               = projectClass.new({ title : projectUrl, baseUrl : this.runtime.cwd() })

                            project.planDir(projectUrl)

                            this.projectData                    = project.asProjectSerializableData()
                            this.projectData.projectPlan.url    = this.runtime.cwd()
                        }
                        else if (this.runtime.isFile(projectUrl)) {
                            if (/\.t\.m?js/.test(projectUrl)) {
                                // test file name
                                const project                       = projectClass.new({ title : projectUrl, launchType : 'test', baseUrl : this.runtime.cwd() })

                                project.planFile(projectUrl)

                                this.projectData                    = project.asProjectSerializableData()
                                this.projectData.projectPlan.url    = this.runtime.cwd()
                            } else {
                                // finally - project file name
                                const contextProvider               = this.contextProviderSameContext

                                const context                       = await contextProvider.createContext()

                                this.projectData                    = await this.extractProjectData(context, projectUrl)
                                this.projectData.projectPlan.url    = stripBasename(this.project)
                            }
                        }
                    }
                }
            }
        }


        prepareProjectFileUrl (url : string) : string {
            if (/^https?:/i.test(url)) {
                return url
            }
            else if (/^file:/.test(url)) {
                return this.runtime.pathResolve(this.runtime.fileURLToPath(url))
            }
            else {
                // assume plain fs path here
                return this.runtime.pathResolve(url)
            }
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


        async getProjectClass () : Promise<typeof ProjectTerminal> {
            if (isNodejs())
                return (await import(/* @vite-ignore */''.concat('../project/ProjectNodejs.js'))).ProjectNodejs
            else if (isDeno())
                return (await import(/* @vite-ignore */''.concat('../project/ProjectDeno.js'))).ProjectDeno
            else
                throw new Error("Should not reach this line")
        }
    }

    return LauncherTerminal
}) {}
