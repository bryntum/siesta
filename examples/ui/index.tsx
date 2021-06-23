/** @jsx ChronoGraphJSX.createElement */

import { globalGraph } from "@bryntum/chronograph/src/chrono2/graph/Graph.js"
import { Dashboard } from "../../src/siesta/ui/Dashboard.js"
import { ChronoGraphJSX } from "../../src/siesta/ui/util/ChronoGraphJSX.js"

globalGraph.autoCommit      = true

ChronoGraphJSX

Dashboard.new().start()
