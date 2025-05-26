import httpStatus from 'http-status';
import catchAsync from '../../utils/catchAsync';
import sendResponse from '../../utils/sendResponse';
import  {quoteServices} from './quotes.services';
import {Request, Response} from 'express'


export const createQuote = catchAsync(async (req:Request, res:Response) => {
  const focusId = req.params.focusId;
  const result = await quoteServices.createQuote(focusId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Quote created successfully',
    data: result,
  });
});

export const getAllQuotes = catchAsync(async (req:Request, res:Response) => {
  const result = await quoteServices.getAllQuotes();

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'All quotes retrieved successfully',
    data: result,
  });
});

export const getQuotesByCategory = catchAsync(async (req:Request, res:Response) => {
  const focusId = req.params.focusId;
  const result = await quoteServices.getQuotesByCategory(focusId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Quotes by category retrieved successfully',
    data: result,
  });
});

export const getAQuote = catchAsync(async (req:Request, res:Response) => {
  const quoteId = req.params.id;
  const result = await quoteServices.getAQuotes(quoteId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Quote retrieved successfully',
    data: result,
  });
});

export const deleteQuote = catchAsync(async (req:Request, res:Response) => {
  const quoteId = req.params.id;
  const result = await quoteServices.deleteQuote(quoteId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Quote deleted successfully',
    data: result,
  });
});

export const updateQuote = catchAsync(async (req:Request, res:Response) => {
  const quoteId = req.params.id;
  const result = await quoteServices.updateQuotes(quoteId, req.body);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Quote updated successfully',
    data: result,
  });
});


export const quoteController = {
    createQuote,
    getAllQuotes,
    getQuotesByCategory,
    getAQuote,
    deleteQuote,
    updateQuote
}