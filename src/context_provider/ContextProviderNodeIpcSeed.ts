import { ExecutionContextRemoteNodeIpcChild } from "../context/ExecutionContextRemoteNodeIpc.js"

//---------------------------------------------------------------------------------------------------------------------
const context       = ExecutionContextRemoteNodeIpcChild.new()

context.connect()
