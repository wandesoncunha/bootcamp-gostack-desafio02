import { Router } from 'express';

const routes = new Router();

routes.get('/users', (req, res) => res.json({ message: 'Hello World' }));

export default routes;
