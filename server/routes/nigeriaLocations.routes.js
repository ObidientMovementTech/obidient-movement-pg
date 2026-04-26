import { Router } from 'express';
import {
  getStates,
  getLGAsByState,
  getWardsByLGA,
  getPollingUnitsByWard,
  searchLocations,
  getLocationById,
} from '../controllers/nigeriaLocations.controller.js';

const router = Router();

// All endpoints are public — no auth required.
// Location data is reference data, not user-specific.

router.get('/states', getStates);
router.get('/states/:stateId/lgas', getLGAsByState);
router.get('/lgas/:lgaId/wards', getWardsByLGA);
router.get('/wards/:wardId/polling-units', getPollingUnitsByWard);
router.get('/search', searchLocations);
router.get('/:id', getLocationById);

export default router;
