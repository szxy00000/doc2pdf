import Router from 'koa-better-router';
import file from "./file";
import fs from 'fs';

const router = Router().loadMethods();
router.addRoutes(...file.getRoutes());
export default router;