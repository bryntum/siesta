/** @jsx ChronoGraphJSX.createElement */
/** @jsxFrag ChronoGraphJSX.FragmentSymbol */

import { ClassUnion, Mixin } from "@bryntum/chronograph/src/class/Mixin.js"
import { entity } from "@bryntum/chronograph/src/schema2/Schema.js"
import { ChronoGraphJSX } from "../../../chronograph-jsx/ChronoGraphJSX.js"
import { TextJSX } from "../../../jsx/TextJSX.js"
import { LaunchInfoComponentCore } from "../test_result/LaunchInfoComponentCore.js"

ChronoGraphJSX


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
@entity()
export class HTMLReportLaunchInfoComponent extends Mixin(
    [ LaunchInfoComponentCore ],
    (base : ClassUnion<typeof LaunchInfoComponentCore>) =>

    class HTMLReportLaunchInfoComponent extends base {
        props       : LaunchInfoComponentCore[ 'props' ] & {
        }
    }
) {}

