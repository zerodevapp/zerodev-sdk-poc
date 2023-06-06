import { Client, IUserOperationBuilder, Presets, UserOperationMiddlewareCtx } from "userop";
import { ethers } from 'ethers'
import { verifyingPaymaster } from 'userop/dist/preset/middleware';
import {  BUNDLER_URL, CHAIN_ID_TO_PAYMASTER_API } from '../../constants';
import { getProjectChainId } from "../../utilities";
import { CreateUserOpOptions } from "../../../types";

async function createUserOp({
    address, 
    projectId,
    executionType = 'REGULAR',
    request: transactionRequest,
}: CreateUserOpOptions) {
    try {
        const chainId = await getProjectChainId(projectId)
        const provider = new ethers.providers.JsonRpcProvider({url: BUNDLER_URL, headers: { projectId }, skipFetchSetup: true}, chainId)
        const paymasterRpcProvider = new ethers.providers.JsonRpcProvider({url: CHAIN_ID_TO_PAYMASTER_API[chainId], skipFetchSetup: true}, chainId)
        const kernelAccount = await Presets.Builder.KernelAccount.init({
            address,
            provider,
            paymasterMiddleware: verifyingPaymaster(paymasterRpcProvider, {type: 'payg'})
        });
        const client = await Client.init(provider, kernelAccount.entryPoint.address, chainId);

        let builder: IUserOperationBuilder
        if (executionType === 'REGULAR') {
            if (Array.isArray(transactionRequest)) throw Error('body.request cannot be an array when executionType is REGULAR')
            builder = kernelAccount.execute(transactionRequest.to, transactionRequest.value, transactionRequest.data)
        } else if (executionType === 'DELEGATE') {
            if (Array.isArray(transactionRequest)) throw Error('body.request cannot be an array when executionType is DELEGATE')
            builder = kernelAccount.executeDelegate(transactionRequest.to, transactionRequest.value, transactionRequest.data)
        } else if (executionType === 'BATCH') {
            if (!Array.isArray(transactionRequest)) throw Error('body.request must be an array when executionType is BATCH')
            builder = kernelAccount.executeBatch(transactionRequest)
        } else {
            throw Error('Builder must be initiated!')
        }


        const userOp = {
            ...await client.buildUserOperation(builder), 
            signature: '0x'
        }

        const userOpHash = new UserOperationMiddlewareCtx(
            userOp,
            kernelAccount.entryPoint.address,
            chainId
        ).getUserOpHash()

        return {
            userOp,
            userOpHash
        }
    } catch(e) {
        console.log(e)
    }
    return null
}

export default createUserOp