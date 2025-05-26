import express from 'express';
import {
  createQuote,
  getAllQuotes,
  getQuotesByCategory,
  getAQuote,
  deleteQuote,
  updateQuote,
} from './quotes.controller';
import { UserRole } from '@prisma/client';
import auth from '../../middlewares/auth';

const router = express.Router();

// Create a new quote under a specific focus area
router.post('/:focusId', auth(UserRole.ADMIN), createQuote);

// Get all quotes
router.get('/',auth(UserRole.USER), getAllQuotes);

// Get quotes by focus area (category)
router.get('/category/:focusId',auth(UserRole.USER), getQuotesByCategory);

// Get a specific quote by ID
router.get('/:id',auth(UserRole.USER), getAQuote);

// Update a quote by ID
router.patch('/:id',auth(UserRole.ADMIN), updateQuote);

// Delete a quote by ID
router.delete('/:id',auth(UserRole.ADMIN), deleteQuote);

export const QuoteRouter = router;
