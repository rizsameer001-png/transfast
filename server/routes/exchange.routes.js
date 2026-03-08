import express from 'express';
import { getExchangeRates, getSupportedCountries } from '../controllers/exchange.controller.js';

const router = express.Router();

router.get('/rates', getExchangeRates);
router.get('/countries', getSupportedCountries);

export default router;
