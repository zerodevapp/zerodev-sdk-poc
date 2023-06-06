import LRUCache from "./LRUCache"
import { BACKEND_URL } from "./constants"
const PROJECT_ID_TO_CHAIN_ID_MAP = new LRUCache<string, number>(200)

export async function getProjectChainId(projectId: string): Promise<number> {
    const cachedValue = PROJECT_ID_TO_CHAIN_ID_MAP.get(projectId)
    if (cachedValue) return cachedValue
    try {
        const response = await fetch(`${BACKEND_URL}/projects/${projectId}`, {
            headers: {
                "content-type": "application/json;charset=UTF-8",
            }
        })
        if (response.ok) {
            const chainId = parseInt((await response.json() as {chainId: string}).chainId)
            PROJECT_ID_TO_CHAIN_ID_MAP.set(projectId, chainId)
            return chainId
        }
    } catch(e) {
        console.log(e)
    }
    throw Error("Invalid project id.")
}