import { PortBrowserMessagePort } from "../../../port/PortBrowserMessagePort.js"
import { PortHandshakeChild, PortHandshakeParent } from "../../../port/PortHandshake.js"
import { PortSerializableJSON } from "../../../port/PortSerializable.js"
import { Base } from "../../../class/Base.js"
import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { TestLauncherChild, TestLauncherParent } from "../channel/TestLauncher.js"

//---------------------------------------------------------------------------------------------------------------------
export class TestRecipeBrowserIframeParent extends Mixin(
    [
        PortBrowserMessagePort,
        PortHandshakeParent,
        PortSerializableJSON,
        TestLauncherParent,
        Base
    ],
    (base : ClassUnion<
        typeof PortBrowserMessagePort,
        typeof PortHandshakeParent,
        typeof PortSerializableJSON,
        typeof TestLauncherParent,
        typeof Base
    >) => {

        class TestRecipeBrowserIframeParent extends base {
        }

        return TestRecipeBrowserIframeParent
    }
) {}


//---------------------------------------------------------------------------------------------------------------------
export class TestRecipeBrowserIframeChild extends Mixin(
    [
        PortBrowserMessagePort,
        PortHandshakeChild,
        PortSerializableJSON,
        TestLauncherChild,
        Base
    ],
    (base : ClassUnion<
        typeof PortBrowserMessagePort,
        typeof PortHandshakeChild,
        typeof PortSerializableJSON,
        typeof TestLauncherChild,
        typeof Base
    >) => {

        class TestRecipeBrowserIframeChild extends base {
        }

        return TestRecipeBrowserIframeChild
    }
) {}

