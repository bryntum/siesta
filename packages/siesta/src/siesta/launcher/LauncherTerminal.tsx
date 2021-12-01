import { siestaPackageRootUrl } from "../../../index.js"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { importer } from "../../Importer.js"
import { TextJSX } from "../../jsx/TextJSX.js"
import { XmlElement, XmlNode } from "../../jsx/XmlElement.js"
import { LogLevel, LogMethod } from "../../logger/Logger.js"
import { LoggerHookable } from "../../logger/LoggerHookable.js"
import { parse, stringify } from "../../serializable/Serializable.js"
import { SerializerXml } from "../../serializer/SerializerXml.js"
import { cloneObject, isDeno, isNodejs } from "../../util/Helpers.js"
import { stripBasename } from "../../util/Path.js"
import { isString } from "../../util/Typeguards.js"
import { Context } from "../context/Context.js"
import { option } from "../option/Option.js"
import { ProjectSerializableData } from "../project/ProjectDescriptor.js"
import { ProjectTerminal } from "../project/ProjectTerminal.js"
import { TestDescriptor } from "../test/TestDescriptor.js"
import { LogMessage } from "../test/TestResult.js"
import { collapserVisitSymbol } from "../test/TestResultReactive.js"
import {
    Launcher,
    LauncherDescriptor,
    OptionsGroupOutput,
    OptionsGroupReport,
    PrepareOptionsResult
} from "./Launcher.js"
import { LauncherError } from "./LauncherError.js"
import { extractProjectInfo } from "./ProjectExtractor.js"
import { HTMLReportData, JSONReportRootNode } from "./TestLaunchResult.js"
import { ExitCodes } from "./Types.js"

// generic sever-side, cross Node/Deno functionality
// DO NOT USE THE NODE.JS/NPM/DENO MODULES HERE

export type ReportFormat = 'json' | 'html' | 'junit'

//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class LauncherDescriptorTerminal extends Mixin(
    [ LauncherDescriptor ],
    (base : ClassUnion<typeof LauncherDescriptor>) =>

    class LauncherDescriptorTerminal extends base {
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
            structure   : 'array',
            group       : OptionsGroupReport,
            help        : <div>
                If this option is provided, Siesta will generate a report after running the test suite.
                The format of the report can be specified with the <span class="accented">--report-format</span> option.
                This option specifies the file name template to save the report to. Template can contain
                variables, marked as <span class="accented">&#123;variable&#125;</span>.
                The value for variables is taken from other options values.{'\n'}
                For example, if you've passed the options as "--browser=safari", and set the file name template as:{'\n'}
                {'    '}--report-file=result-&#123;browser&#125;.json{'\n'}
                resulting file name will be: "result-safari.json".{'\n'}
                {'\n'}
                For the HTML report format this option actually specifies the directory, to which save the required files.
                This option can be repeated several times (several reports will be generated), in this case,
                the <span class="accented">--report-format</span> option should be provided
                exactly the same number of times, the files and formats will be matched by their order.
            </div>
        })
        reportFile      : string[]                          = []


        @option({
            type        : 'enum',
            structure   : 'array',
            enumeration : [ 'html', 'json', 'junit' ],
            group       : OptionsGroupReport,
            defaultValue : () => [ 'json' ],
            help        : <div>
                Specifies the report format to generate after running the test suite. To actually generate a report,
                need to provide the <span class="accented">--report-file</span> option as well.
                The `html` report includes `json` with additional files for results visualization.
                When using `html` report, the <span class="accented">--report-file</span> option actually specifies
                the <span class="accented">directory</span> to save data into, not a single file.
                This option can be repeated several times (several reports will be generated), in this case,
                the <span class="accented">--report-file</span> option should be provided
                exactly the same number of times, the files and formats will be matched by their order.
            </div>
        })
        // no initializer intentionally, to be able to determine if user has provided a value or not
        // (default value goes into prototype)
        reportFormat    : ReportFormat[]
    }
) {}


export class LauncherTerminal extends Mixin(
    [ Launcher, LauncherDescriptorTerminal ],
    (base : ClassUnion<typeof Launcher, typeof LauncherDescriptorTerminal>) =>

    class LauncherTerminal extends base {
        $logger             : LoggerHookable            = LoggerHookable.new({ logLevel : LogLevel.warn })


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


        async prepareLauncherOptions () : Promise<PrepareOptionsResult> {
            const res               = await super.prepareLauncherOptions()

            this.validateReportOptions(res)

            return res
        }


        validateReportOptions (res : PrepareOptionsResult) {
            const reportFormats     = this.reportFormat
            const reportFiles       = this.reportFile

            // nothing to validate - validation passed
            if (!reportFiles) return

            if (
                reportFiles.length > 1 && reportFormats.length !== reportFiles.length
                ||
                reportFiles.length === 1 && reportFormats.length > 1
            ) {
                res.errors.push(<div>
                    <span class="log_message_error"> ERROR </span> The number of <span class="accented">--report-format</span> and
                    <span class="accented">--report-file</span> options does not match.
                </div>)
            }

            if (reportFiles.length === 0 && this.hasOwnProperty('reportFormats')) {
                res.errors.push(<div>
                    <span class="log_message_error"> ERROR </span> The <span class="accented">--report-file</span> option
                    is required when <span class="accented">--report-format</span> is provided.
                </div>)
            }
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


        // when calling this method repeatedly, one should set `avoidSameContext` to `true`
        // the reason is that repeated same-context import from project file won't trigger
        // actual file load (since it has been already loaded previously)
        // this is important for Node.js
        async setupProjectData (avoidSameContext? : boolean) {
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
                    this.projectData.projectPlan.url    = this.prepareProjectPlanRoot(this.runtime.cwd())
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
                            this.projectData.projectPlan.url    = this.prepareProjectPlanRoot(this.runtime.cwd())
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
                                await this.setupProjectDataFromProjectFile(projectUrl, avoidSameContext)
                            }
                        }
                    }
                }
            }
        }


        prepareProjectPlanRoot (dirName : string) : string {
            return dirName
        }


        // for Node.js it generally fine (and most performant) to use same-context context
        // this is based on assumption, that both project and launcher shares the same set of Siesta files
        // Deno overrides this method, to always create a separate context for project
        async setupProjectDataFromProjectFile (projectUrl : string, avoidSameContext? : boolean) {
            const contextProvider               = avoidSameContext ? this.dispatcher.contextProviders[ 0 ] : this.contextProviderSameContext

            const context                       = await contextProvider.createContext()

            this.projectData                    = await this.extractProjectData(context, projectUrl)
            this.projectData.projectPlan.url    = this.prepareProjectPlanRoot(stripBasename(this.project))
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
            // @ts-ignore
            this.styles         = (await importer.getImporter(`src/siesta/reporter/styling/theme_${ this.theme }.js`)()).styles
        }


        async getProjectClass () : Promise<typeof ProjectTerminal> {
            if (isNodejs())
                return (await import('../project/ProjectNodejs.js')).ProjectNodejs
            else if (isDeno())
                return (await import('../project/ProjectDeno.js')).ProjectDeno
            else
                throw new Error("Should not reach this line")
        }


        async launchOnce (projectPlanItemsToLaunch : TestDescriptor[]) {
            await super.launchOnce(projectPlanItemsToLaunch)

            const reportsGeneration = this.reportFile.map(
                (reportFile : string, index : number ) => this.generateReport(reportFile, this.reportFormat[ index ])
            )

            await Promise.all(reportsGeneration)
        }


        async generateReport (reportFile : string, reportFormat : ReportFormat) {
            const runtime       = this.runtime

            if (reportFormat === 'json') {
                const report        = await this.generateReportJSON()

                await runtime.writeToFile(reportFile, JSON.stringify(report))
            }
            else if (reportFormat === 'junit') {
                const report        = await this.generateReportJUnit()

                await runtime.writeToFile(reportFile, report.toString())
            }
            else if (reportFormat === 'html') {
                await this.createReportHTML(reportFile)
            }
        }


        async createReportHTML (reportFile : string) {
            const runtime       = this.runtime

            const hasResults    = new Set<TestDescriptor>()

            for (const launchRes of this.dispatcher.projectPlanLaunchResult.traverseGen()) {
                if (launchRes.isLeaf() && launchRes.mostRecentResult) hasResults.add(launchRes.descriptor)
            }

            const filterMap     = (desc : TestDescriptor) : TestDescriptor => {
                const instance      = cloneObject(desc)

                if (desc.isLeaf())
                    return hasResults.has(desc) ? instance : undefined
                else {
                    const children  = desc.childNodes.map(filterMap).filter(el => Boolean(el))

                    if (children.length > 0) {
                        instance.childNodes = []
                        children.forEach(child => instance.appendChild(child))

                        return instance
                    } else
                        return undefined
                }
            }

            const filteredPlan  = filterMap(this.projectData.projectPlan)

            const data          = stringify(
                {
                    projectData         : Object.assign(ProjectSerializableData.new(this.projectData), {
                        projectPlan : filteredPlan
                    } as Partial<ProjectSerializableData>),

                    launcherDescriptor  : this.getDescriptor(),
                    launchResult        : this.dispatcher.projectPlanLaunchResult
                } as HTMLReportData,
                { collapserVisitSymbol : collapserVisitSymbol }
            )

            await runtime.writeToFile(reportFile + '/report_data.json', data)

            const packageRoot   = runtime.fileURLToPath(siestaPackageRootUrl)

            await runtime.copyFile(packageRoot + 'resources/html_report/index.html', reportFile + '/index.html')
            await runtime.copyFile(packageRoot + 'resources/html_report/index.js', reportFile + '/index.js')
            await runtime.copyDir(packageRoot + 'resources/styling/browser', reportFile + '/styling/')
        }


        async generateReportJSON () : Promise<JSONReportRootNode> {
            return this.dispatcher.projectPlanLaunchResult.asJSONReportRootNode(this.dispatcher)
        }


        async generateReportJUnit () : Promise<XmlElement> {
            return this.dispatcher.projectPlanLaunchResult.asJUnitReportRootNode(this.dispatcher)
        }
    }
) {}
