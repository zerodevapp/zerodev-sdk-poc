import { ethers } from 'ethers'
import { BUNDLER_URL } from '../../constants';
import { EntryPoint__factory } from 'userop/dist/typechain';
import { getProjectChainId } from '../../utilities';
import { SendUserOpOptions } from '../../../types';

async function sendUserOp({
    userOp, 
    projectId,
    waitTimeoutMs = 30000,
    waitIntervalMs = 5000,
    entryPointAddress = '0x5FF137D4b0FDCD49DcA30c7CF57E578a026d2789'
}: SendUserOpOptions){ 
    try {
        // MIGHT NEED TO ADD FIXED SIGN DATA
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
            return events[0]
          }
          await new Promise((resolve) =>
            setTimeout(resolve, waitIntervalMs)
          );
        }

    } catch(e) {
        console.log(e)
        throw new Error(JSON.stringify(e))
    }
    return null
}

export default sendUserOp
