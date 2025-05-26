import express from 'express';
import {
  createBook,
  getAllBooks,
  getBooksByCategory,
  getABook,
  deleteBook,
  updateBook,
  uploadBookImages,
} from './book.controllers';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';
import { multerUploadMultiple } from '../../utils/multipleFile';

const router = express.Router();


router.post('/:focusId',auth(UserRole.ADMIN), createBook);

// Get all books
router.get('/',auth(UserRole.USER), getAllBooks);
// Create a book for a specific focus area
// Get books by category (focus area)
router.get('/focuses/:focusId',auth(UserRole.USER), getBooksByCategory);

router.put(
  '/uploads',
  multerUploadMultiple.array('images', 15),
  auth(),
  uploadBookImages
);


// Get a specific book
router.get('/:id',auth(UserRole.USER), getABook);

// Update a specific book
router.patch('/:id',auth(UserRole.ADMIN), updateBook);

// Delete a specific book
router.delete('/:id',auth(UserRole.ADMIN), deleteBook);



export const bookRouter = router;
