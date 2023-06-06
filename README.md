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

#### Regular
```typescript
const createUserOpResponse = await fetch('https://zerodev-api.zobeir.workers.dev/create-userop', {
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

#### Batch
```typescript
const createUserOpResponse = await fetch('https://zerodev-api.zobeir.workers.dev/create-userop', {
    method: 'post',
    headers: {
        "content-type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify({
        address, // SIGNER ADDRESS
        projectId,
        executionType: 'BATCH',
        request: [
            {
                to,
                value,
                data
            },
            {
                to,
                value,
                data
            }
        ]
    }),
})
```

### /send-userop
```typescript
const sendUserOpResponse = await fetch('https://zerodev-api.zobeir.workers.dev/send-userop', {
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

  const createUserOpResponse = await fetch('https://zerodev-api.zobeir.workers.dev/create-userop', {...})
  const {userOp, userOpHash} = await createUserOpResponse.json()

  const signedMessage = await signer.signMessage(ethers.utils.arrayify(userOpHash))

  const sendUserOpResponse = await fetch('https://zerodev-api.zobeir.workers.dev/send-userop', {
    ...,
    body: JSON.stringify({
      userOp: {...userOp, signature: signedMessage},
      ...
    }),
  })
```


### /create-revoke-session-key-user-op

#### Regular
```typescript
const createUserOpResponse = await fetch('https://zerodev-api.zobeir.workers.dev/create-revoke-session-key-user-op', {
    method: 'post',
    headers: {
        "content-type": "application/json;charset=UTF-8",
    },
    body: JSON.stringify({
        address, // SIGNER ADDRESS
        projectId,
        publicSessionKey
    }),
})
```


## Testing
```
npm run api:dev
npm run examples:test-endpoints
```