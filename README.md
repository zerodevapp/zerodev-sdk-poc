# ZeroDev SDK - Proof of Concept

## Installation
```
git submodule update --init --recursive
npx lerna bootstrap
```

## Commands

### Start API
```
npm run api:dev
```

### Build userop.js
```
npm run userop:build
```

## Endpoints

### /create-userop
```typescript
const createUserOpResponse = await fetch('http://127.0.0.1:8787/create-userop', {
    method: 'post',
    headers: {
        "content-type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify({
        address, // SIGNER ADDRESS
        projectId,
        request: {
            to,
            value,
            data
        }
    }),
})
```

### /send-userop
```typescript
const sendUserOpResponse = await fetch('http://127.0.0.1:8787/send-userop', {
    method: 'post',
    headers: {
        "content-type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify({
        userOp, // WITH SIGNED USEROP SIGNATURE
        projectId
    }),
})
```

## Usage
```typescript

  const createUserOpResponse = await fetch('http://127.0.0.1:8787/create-userop', {...})
  const {userOp, userOpHash} = await createUserOpResponse.json()

  const signedMessage = await signer.signMessage(ethers.utils.arrayify(userOpHash))

  const sendUserOpResponse = await fetch('http://127.0.0.1:8787/send-userop', {
    ...,
    body: JSON.stringify({
      userOp: {...userOp, signature: signedMessage},
      ...
    }),
  })
```


## Testing
```
npm run api:dev
npm run examples:test-endpoints
```