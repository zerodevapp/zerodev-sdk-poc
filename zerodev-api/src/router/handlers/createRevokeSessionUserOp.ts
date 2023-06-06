import { ethers } from 'ethers'
import {  DEFAULT_SESSION_KEY_PLUGIN_ADDRESS } from '../../constants';
import { CreateRevokeSessionKeyUserOpOptions } from "../../../types";
import createUserOp from "./createUserOp";
import SESSION_KEY_PLUGIN_ABI from '../../abi/SessionKeyPlugin.json'

async function createRevokeSessionUserOp({
    address, 
    projectId,
    publicSessionKey
}: CreateRevokeSessionKeyUserOpOptions) {
    const sessionKeyPlugin = new ethers.Contract(DEFAULT_SESSION_KEY_PLUGIN_ADDRESS, SESSION_KEY_PLUGIN_ABI)
    const data = sessionKeyPlugin.interface.encodeFunctionData("revokeSessionKey", [publicSessionKey])
    const transactionRequest = {
        to: DEFAULT_SESSION_KEY_PLUGIN_ADDRESS,
        value: '0',
        data
    }
    return createUserOp({ address, projectId, executionType: 'DELEGATE', request: transactionRequest})
}

export default createRevokeSessionUserOp