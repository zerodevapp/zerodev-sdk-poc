import { Router } from 'itty-router';
import createUserOp from './handlers/createUserOp';
import sendUserOp from './handlers/sendUserOp';
import { CreateRevokeSessionKeyUserOpOptions, CreateUserOpOptions, GetCounterFactualAddressOptions, SendUserOpOptions } from '../../types';
import createRevokeSessionUserOp from './handlers/createRevokeSessionUserOp';
import getCounterFactualAddress from './handlers/getCounterFactualAddress';

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

router.post('/create-userop', async (request) => {
    try {
        const createdUserOp = await createUserOp(await (request as unknown as Request).json() as CreateUserOpOptions)
        if (createdUserOp) {
            return new Response(JSON.stringify(createdUserOp), defaultInit)
        }
    } catch(e) {
        return new Response(JSON.stringify({error: {meesage: (e as Error).message}}), errorResponseInit)
    }
    return new Response(JSON.stringify({error: {meesage: 'Something went wrong.'}}), errorResponseInit)
});

router.post('/send-userop', async (request) => {
    try {
        const sentUserOp = await sendUserOp(await (request as unknown as Request).json() as SendUserOpOptions)
        if (sentUserOp) {
            return new Response(JSON.stringify(sentUserOp), defaultInit)
        }
    } catch(e) {
        return new Response(JSON.stringify({error: {meesage: (e as Error).message}}), errorResponseInit)
    }
    return new Response(JSON.stringify({error: {meesage: 'Something went wrong.'}}), errorResponseInit)
});

router.post('/get-counter-factual-address', async (request) => {
    try {
        const counterFactualAddress = await getCounterFactualAddress(await (request as unknown as Request).json() as GetCounterFactualAddressOptions)
        if (counterFactualAddress) {
            return new Response(JSON.stringify({ counterFactualAddress }), defaultInit)
        }
    } catch(e) {
        return new Response(JSON.stringify({error: {meesage: (e as Error).message}}), errorResponseInit)
    }
    return new Response(JSON.stringify({error: {meesage: 'Something went wrong.'}}), errorResponseInit)
});

router.post('/create-revoke-session-key-user-op', async (request) => {
    try {
        const createdUserOp = await createRevokeSessionUserOp(await request.json() as unknown as CreateRevokeSessionKeyUserOpOptions)
        if (createdUserOp) {
            return new Response(JSON.stringify(createdUserOp), defaultInit)
        }
    } catch(e) {
        return new Response(JSON.stringify({error: {meesage: (e as Error).message}}), errorResponseInit)
    }
    return new Response(JSON.stringify({error: {meesage: 'Something went wrong.'}}), errorResponseInit)
});

// 404 for everything else
router.all('*', () => new Response('Not Found.', errorResponseInit));

export default router;
