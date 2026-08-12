import { Router, Request, Response } from 'express';
import userRouter from './user.routes';

const router = Router();

router.get('/ping', (req: Request, res: Response) => {
    res.json({ pong: true });
});

router.get('/', (req: Request, res: Response) => {
    res.send('Hello World!');
});

router.use('/users', userRouter);

export default router;