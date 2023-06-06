const { Contract, Wallet, providers, ethers } = require('ethers')
const { getZeroDevSigner, createSessionKey, createSessionKeySigner } = require('@zerodevapp/sdk')
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
  const privateSigner = Wallet.createRandom()
  const signer = new Wallet('468f0c80d5336c4a45be71fa19b77e9320dc0abaea4fd018e0c49aca90c1db78')
  const zeroDevSigner = await getZeroDevSigner({
    projectId,
    owner: signer
  })
  const sessionKey = await createSessionKey(zeroDevSigner, [], 1686761443, privateSigner.address)
  const sessionKeySigner = await createSessionKeySigner({
    projectId,
    sessionKeyData: sessionKey,
    privateSigner: privateSigner
  })

  const address = await signer.getAddress()
  const nftContract = new Contract(contractAddress, contractABI, sessionKeySigner)
  const receipt = await sessionKeySigner.sendTransaction({
    to: contractAddress,
    data: nftContract.interface.encodeFunctionData('mint', [address])
  })

  await receipt.wait()
  console.log("SUCCESSFULLY MINTED USING SESSION KEY")
  const createRevokeSessionKeyUserOpResponse = await fetch('http://127.0.0.1:8787/create-revoke-session-key-user-op', {
    ...requestInit,
    body: JSON.stringify({
      address,
      projectId,
      publicSessionKey: await privateSigner.getAddress()
    }),
  })

  const {userOp, userOpHash} = await createRevokeSessionKeyUserOpResponse.json()

  const signedMessage = await signer.signMessage(ethers.utils.arrayify(userOpHash))

  await fetch('http://127.0.0.1:8787/send-userop', {
    ...requestInit,
    body: JSON.stringify({
      userOp: {...userOp, signature: signedMessage},
      projectId
    }),
  })

  try {
    const receipt2 = await sessionKeySigner.sendTransaction({
       to: contractAddress,
      data: nftContract.interface.encodeFunctionData('mint', [address])
    })
    console.log(await receipt2.wait())
    console.log("Unsuccessfully revoked.")
  } catch(e) {
    console.log("Successfully revoked.")
  }
}

main().then(() => process.exit(0))