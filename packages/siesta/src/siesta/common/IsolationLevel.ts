// import { Base } from "../../class/Base.js"
// import { ClassUnion, Mixin } from "../../class/Mixin.js"
//
// /*
//
// iso
// ---
// SameContext
// NewContext
//
//
// node
// ----
// NewProcess
//
//
// browser
// -------
// Popup
//
//
// */
//
//
// //---------------------------------------------------------------------------------------------------------------------
// export class IsolationLevel extends Mixin(
//     [ Base ],
//     (base : ClassUnion<typeof Base>) =>
//
//     class IsolationLevel extends base {
//     }
// ) {}
//
//
// //---------------------------------------------------------------------------------------------------------------------
// export class SameContext extends Mixin(
//     [ IsolationLevel ],
//     (base : ClassUnion<typeof IsolationLevel>) =>
//
//     class SameContext extends base {
//     }
// ) {}
//
//
// //---------------------------------------------------------------------------------------------------------------------
// export class NodejsContext extends Mixin(
//     [ IsolationLevel ],
//     (base : ClassUnion<typeof IsolationLevel>) =>
//
//     class NodejsContext extends base {
//     }
// ) {}
