import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import {bookServices} from './books.services';
import { Request, Response } from 'express';
import { uploadFileToSpace } from '../../utils/multerUpload';

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

export const uploadBookImages = catchAsync(async (req:any, res:Response)=>{
  const user = req.user

  const files = req.files as any;
   console.log(files)
  if (!files || files.length === 0) { 
    return res.status(400).send({message:"No files uploaded"});
  }
  const filePaths = await Promise.all(files.map(async (file) => {
     const path = await  uploadFileToSpace(file , user.id)
     return path;
  
  }))
 

  // Assuming uploadBookImages returns a success message or similar

   sendResponse(res, {
    statusCode: httpStatus.OK,    
    success: true,
    message: 'Book images uploaded successfully',
    data: filePaths,
  });
    // res.send({message:"Uploaded", data:filePaths})
})
