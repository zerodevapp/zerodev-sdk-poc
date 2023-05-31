import { Router } from 'itty-router';
import { Client, IUserOperation, IUserOperationBuilder, Presets, UserOperationMiddlewareCtx } from "userop";
import { ethers } from 'ethers'
import { verifyingPaymaster } from 'userop/dist/preset/middleware';
import { BACKEND_URL, BUNDLER_URL, CHAIN_ID_TO_PAYMASTER_API } from './constants';
import { EntryPoint__factory } from 'userop/dist/typechain';
import LRUCache from './LRUCache'

// now let's create a router (note the lack of "new")
const router = Router();

const defaultInit = {
    headers: {
        "content-type": "application/json;charset=UTF-8",
    }
}

const errorResponseInit = {
    status: 404,
    ...defaultInit
}


const projectIdChainIdMap = new LRUCache<string, number>(200)
async function getProjectChainId(projectId: string): Promise<number> {
    const cachedValue = projectIdChainIdMap.get(projectId)
    if (cachedValue) return cachedValue
    try {
        const response = await fetch(`${BACKEND_URL}/projects/${projectId}`, defaultInit)
        if (response.ok) {
            const chainId = parseInt((await response.json() as {chainId: string}).chainId)
            projectIdChainIdMap.set(projectId, chainId)
            return chainId
        }
    } catch(e) {
        console.log(e)
    }
    throw Error("Invalid project id.")
}

interface CreateUserOpCall {
    to: string;
    value: string;
    data: string
}

interface CreateUserOpRegular {
    address: string,
    projectId: string,
    executionType: 'REGULAR',
    request: CreateUserOpCall | CreateUserOpCall[]
}

interface CreateUserOpBatch {
    address: string,
    projectId: string,
    executionType: 'BATCH',
    request: CreateUserOpCall[]
}

type CreateUserOpBody = CreateUserOpRegular | CreateUserOpBatch

router.post('/create-userop', async (request) => {
    try {
        const { 
            address, 
            projectId,
            executionType = 'REGULAR',
            request: transactionRequest,
        } = await (request as unknown as Request).json() as CreateUserOpBody

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

        return new Response(JSON.stringify({
            userOp,
            userOpHash
        }), defaultInit)
    } catch(e) {
        console.log(e)
    }
    return new Response('Something went wrong.', errorResponseInit)
});

router.post('/send-userop', async (request) => {
    try {
        // MIGHT NEED TO ADD FIXED SIGN DATA
        const { 
            userOp, 
            projectId,
            waitTimeoutMs = 30000,
            waitIntervalMs = 5000,
            entryPointAddress = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
        } = await (request as unknown as Request).json() as { 
            userOp: IUserOperation, 
            projectId: string,
            waitTimeoutMs?: number,
            waitIntervalMs?: number,
            entryPointAddress?: string

        }
        const chainId = await getProjectChainId(projectId)

        const provider = new ethers.providers.JsonRpcProvider({url: BUNDLER_URL, headers: { projectId }, skipFetchSetup: true}, chainId)
        const entryPoint = EntryPoint__factory.connect(entryPointAddress, provider);
        const userOpHash = ((await provider.send("eth_sendUserOperation", [userOp, entryPoint.address])) as string)

        const end = Date.now() + waitTimeoutMs;
        const block = await provider.getBlock("latest");
        while (Date.now() < end) {
          const events = await entryPoint.queryFilter(
            entryPoint.filters.UserOperationEvent(userOpHash),
            Math.max(0, block.number - 100)
          );
          if (events.length > 0) {
            return new Response(JSON.stringify(events[0]), defaultInit)
          }
          await new Promise((resolve) =>
            setTimeout(resolve, waitIntervalMs)
          );
        }

    } catch(e) {
        console.log(e)
    }
    return new Response('Something went wrong.', errorResponseInit)
});

// 404 for everything else
router.all('*', () => new Response('Not Found.', errorResponseInit));

export default router;
