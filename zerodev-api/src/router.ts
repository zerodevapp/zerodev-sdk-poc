import { Router } from 'itty-router';

// now let's create a router (note the lack of "new")
const router = Router();

// GET collection index
router.get('/create-userop', () => new Response('Todos Index!'));

// 404 for everything else
router.all('*', () => new Response('Not Found.', { status: 404 }));

export default router;
