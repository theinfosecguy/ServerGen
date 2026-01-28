import { Router, Request, Response } from 'express';

const router: Router = Router();

router.get('/', (req: Request, res: Response): void => {
  res.json({ message: 'Welcome to the API' });
});

router.get('/health', (req: Request, res: Response): void => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

export default router;
