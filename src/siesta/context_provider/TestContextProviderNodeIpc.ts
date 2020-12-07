import  child_process from "child_process"
import { ClassUnion, Mixin } from "../../class/Mixin.js"
import { TestLauncherParent } from "../test/channel/TestLauncher.js"
import { TestDescriptor } from "../test/Descriptor.js"
import { TestRecipeNodeIpcParent } from "../test/recipe/TestRecipeNodeIpc.js"
import { TestContextProvider } from "./TestContextProvider.js"

//---------------------------------------------------------------------------------------------------------------------
export class TestContextProviderNodeIpc extends Mixin(
    [ TestContextProvider ],
    (base : ClassUnion<typeof TestContextProvider>) => {

        class TestContextProviderNodeIpc extends base {
            childChannelClassUrl         : string            = import.meta.url
                .replace(/^file:/, '')
                .replace(/context_provider\/TestContextProviderNodeIpc.js$/, 'test/recipe/TestRecipeNodeIpc.js')

            childChannelClassSymbol      : string            = 'TestRecipeNodeIpcChild'


            async setup () {
            }


            async destroy () {
                // do nothing
            }


            async createTestContext (desc : TestDescriptor) : Promise<TestLauncherParent> {
                const childProcess  = child_process.fork(
                    '',
                    {
                        execArgv : [
                            // '--unhandled-rejections=strict',
                            // '--trace-warnings',
                            // '--inspect-brk=127.0.0.1:9339',
                            '--input-type', 'module',
                            '--eval', [
                                `import { ${this.childChannelClassSymbol} } from "${this.childChannelClassUrl}"`,
                                // `debugger`,
                                // `console.log('ContextProviderNodeIpc seed launched`,
                                `const context = ${this.childChannelClassSymbol}.new()`,
                                `context.connect()`,
                                // `console.log('ContextProviderNodeIpc seed connect call issued`,
                            ].join('\n')
                        ]
                    }
                )

                const context       = TestRecipeNodeIpcParent.new({ media : childProcess })

                await context.connect()

                return context
            }
        }

        return TestContextProviderNodeIpc
    }
) {}
