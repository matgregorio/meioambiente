import { Router } from 'express';
import { authenticate, authorize } from '../../middlewares/auth.js';
import {
  listNeighborhoods,
  createNeighborhood,
  deleteNeighborhood,
  listAddresses,
  createAddress,
  deleteAddress
} from './address.controller.js';

const router = Router();

router.use(authenticate(), authorize(['admin']));

router.get('/neighborhoods', listNeighborhoods);
router.post('/neighborhoods', createNeighborhood);
router.delete('/neighborhoods/:id', deleteNeighborhood);

router.get('/', listAddresses);
router.post('/', createAddress);
router.delete('/:id', deleteAddress);

export default router;
