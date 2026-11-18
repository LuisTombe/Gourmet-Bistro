import { Router } from 'express';
import {
  getProducts,
  createProduct,
  updateProduct,
  toggleProductAvailability,
  deleteProduct,
} from '../controllers/productsController.js';

const router = Router();

router.get('/', getProducts);
router.post('/', createProduct);
router.put('/:id', updateProduct);
router.patch('/:id/toggle-availability', toggleProductAvailability);
router.delete('/:id', deleteProduct);

export default router;

