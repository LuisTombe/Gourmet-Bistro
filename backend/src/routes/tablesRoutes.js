import { Router } from 'express';
import {
  getTables,
  createTable,
  updateTable,
  deleteTable,
} from '../controllers/tablesController.js';

const router = Router();

router.get('/', getTables);
router.post('/', createTable);
router.put('/:id', updateTable);
router.delete('/:id', deleteTable);

export default router;

