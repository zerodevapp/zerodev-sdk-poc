import { Client, Presets } from "userop";
import { ethers } from 'ethers'
import {  BUNDLER_URL } from '../../constants';
import { getProjectChainId } from "../../utilities";
import { GetCounterFactualAddressOptions } from "../../../types";

async function getCounterFactualAddress({
    address, 
    projectId,
    index = 0,
}: GetCounterFactualAddressOptions) {
    try {
        const chainId = await getProjectChainId(projectId)
        const provider = new ethers.providers.JsonRpcProvider({url: BUNDLER_URL, headers: { projectId }, skipFetchSetup: true}, chainId)
        const kernelAccount = await Presets.Builder.KernelAccount.init({
            address,
            provider,
            index
        });
        const client = await Client.init(provider, kernelAccount.entryPoint.address, chainId);
        return kernelAccount.getSender()

    } catch(e) {
        console.log(e)
    }
    return null
}

export default getCounterFactualAddress