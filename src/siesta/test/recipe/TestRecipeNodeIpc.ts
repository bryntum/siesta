import { PortHandshakeChild, PortHandshakeParent } from "../../../port/PortHandshake.js"
import { PortNodeIpcChild, PortNodeIpcParent } from "../../../port/PortNodeIpc.js"
import { PortSerializableJSON } from "../../../port/PortSerializable.js"
import { Base } from "../../../class/Base.js"
import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { TestLauncherChild, TestLauncherParent } from "../channel/TestLauncher.js"

//---------------------------------------------------------------------------------------------------------------------
export class TestRecipeNodeIpcParent extends Mixin(
    [
        PortNodeIpcParent,
        PortHandshakeParent,
        PortSerializableJSON,
        TestLauncherParent,
        Base
    ],
    (base : ClassUnion<
        typeof PortNodeIpcParent,
        typeof PortHandshakeParent,
        typeof PortSerializableJSON,
        typeof TestLauncherParent,
        typeof Base
    >) => {

        class TestContextNodeIpc extends base {
        }

        return TestContextNodeIpc
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class TestRecipeNodeIpcChild extends Mixin(
    [
        PortNodeIpcChild,
        PortHandshakeChild,
        PortSerializableJSON,
        TestLauncherChild,
        Base
    ],
    (base : ClassUnion<
        typeof PortNodeIpcChild,
        typeof PortHandshakeChild,
        typeof PortSerializableJSON,
        typeof TestLauncherChild,
        typeof Base
    >) => {

        class TestRecipeNodeIpcChild extends base {
        }

        return TestRecipeNodeIpcChild
    }
) {}

