import { ChannelHandshakeChild, ChannelHandshakeParent } from "../../../channel/ChannelHandshake.js"
import { ChannelNodeIpcChild, ChannelNodeIpcParent } from "../../../channel/ChannelNodeIpc.js"
import { ChannelSerializableJSON } from "../../../channel/ChannelSerializable.js"
import { Base } from "../../../class/Base.js"
import { ClassUnion, Mixin } from "../../../class/Mixin.js"
import { TestLauncherChild, TestLauncherParent } from "../channel/TestLauncher.js"

//---------------------------------------------------------------------------------------------------------------------
export class TestRecipeNodeIpcParent extends Mixin(
    [
        ChannelNodeIpcParent,
        ChannelHandshakeParent,
        ChannelSerializableJSON,
        TestLauncherParent,
        Base
    ],
    (base : ClassUnion<
        typeof ChannelNodeIpcParent,
        typeof ChannelHandshakeParent,
        typeof ChannelSerializableJSON,
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
        ChannelNodeIpcChild,
        ChannelHandshakeChild,
        ChannelSerializableJSON,
        TestLauncherChild,
        Base
    ],
    (base : ClassUnion<
        typeof ChannelNodeIpcChild,
        typeof ChannelHandshakeChild,
        typeof ChannelSerializableJSON,
        typeof TestLauncherChild,
        typeof Base
    >) => {

        class TestRecipeNodeIpcChild extends base {
        }

        return TestRecipeNodeIpcChild
    }
) {}

