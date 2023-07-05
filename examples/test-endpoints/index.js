const { Contract, Wallet, providers, ethers } = require('ethers')
// const projectId = '1ab43d67-98f2-4f67-88e8-397e0799f92c'
const projectId = 'd00dbcef-2f10-479e-8c10-28a9fd95717d'

const contractAddress = '0x34bE7f35132E97915633BC1fc020364EA5134863'
const contractABI = [
  'function mint(address _to) public',
  'function balanceOf(address owner) external view returns (uint256 balance)'
]

const requestInit = {
  method: 'post',
  headers: {
    "content-type": "application/json;charset=UTF-8",
  }
}

const main = async () => {
  const signer = new Wallet('468f0c80d5336c4a45be71fa19b77e9320dc0abaea4fd018e0c49aca90c1db78').connect(new providers.InfuraProvider(80001, 'f36f7f706a58477884ce6fe89165666c'))
  const address = await signer.getAddress()

  const getCounterFactualAddressResponse = await fetch('https://zerodev-api.zobeir.workers.dev/get-counter-factual-address', {
    ...requestInit,
    body: JSON.stringify({
      address,
      projectId,
      index: 1
    }),
  })

  const zeroDevAddress = (await getCounterFactualAddressResponse.json()).counterFactualAddress

  const nftContract = new Contract(contractAddress, contractABI, signer)
  const data = nftContract.interface.encodeFunctionData('mint', [zeroDevAddress])

  const createUserOpResponse = await fetch('https://zerodev-api.zobeir.workers.dev/create-userop', {
    ...requestInit,
    body: JSON.stringify({
      address,
      projectId,
      executionType: 'BATCH',
      request: [
        {
          to: contractAddress,
          value: 0,
          data
        },
        {
          to: contractAddress,
          value: 0,
          data
        }
      ]
    }),
  })
  const {userOp, userOpHash} = await createUserOpResponse.json()

  const signedMessage = await signer.signMessage(ethers.utils.arrayify(userOpHash))

  const sendUserOpResponse = await fetch('https://zerodev-api.zobeir.workers.dev/send-userop', {
    ...requestInit,
    body: JSON.stringify({
      userOp: {...userOp, signature: signedMessage},
      projectId
    }),
  })

  console.log(await sendUserOpResponse.json())

}

main().then(() => process.exit(0))