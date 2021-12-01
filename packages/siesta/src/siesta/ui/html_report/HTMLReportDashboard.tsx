/** @jsx ChronoGraphJSX.createElement */
import { ClassUnion, Mixin } from "typescript-mixin-class/index.js"
import { DashboardCore } from "../DashboardCore.js"


//━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
export class HTMLReportDashboard extends Mixin(
    [ DashboardCore ],
    (base : ClassUnion<typeof DashboardCore>) =>

    class HTMLReportDashboard extends base {
    }
) {}

