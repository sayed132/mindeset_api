import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import {bookServices} from './books.services';
import { Request, Response } from 'express';

export const createBook = catchAsync(async (req:Request, res:Response) => {
  const focusId = req.params.focusId;
  const result = await bookServices.createBooks(focusId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Book created successfully',
    data: result,
  });
});

export const getAllBooks = catchAsync(async (req:Request, res:Response) => {
  const result = await bookServices.getAllBooks();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All books retrieved successfully',
    data: result,
  });
});

export const getBooksByCategory = catchAsync(async (req:Request, res:Response) => {
  const focusId = req.params.focusId;
  const result = await bookServices.getBooksByCategory(focusId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Books by category retrieved successfully',
    data: result,
  });
});

export const getABook = catchAsync(async (req:Request, res:Response) => {
  const bookId = req.params.id;
  const result = await bookServices.getABooks(bookId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Book retrieved successfully',
    data: result,
  });
});

export const deleteBook = catchAsync(async (req:Request, res:Response) => {
  const bookId = req.params.id;
  const result = await bookServices.deleteBook(bookId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Book deleted successfully',
    data: result,
  });
});


export const updateBook = catchAsync(async (req:Request, res:Response) => {
  const bookId = req.params.id;
  const result = await bookServices.updateBooks(bookId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Book updated successfully',
    data: result,
  });
});

export const uploadBookImages = catchAsync(async (req:Request, res:Response)=>{
   const user = req.user
   
    res.send({message:"Uploaded"})
})
