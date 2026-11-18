import { Router } from 'express';
import {
  getSnapshots,
  createSnapshot,
  rollbackSnapshot,
} from '../controllers/snapshotsController.js';

const router = Router();

router.get('/', getSnapshots);
router.post('/', createSnapshot);
router.post('/:id/rollback', rollbackSnapshot);

export default router;

