import catchAsync from "../../utils/catchAsync";
import {Request, Response} from 'express'
import { journalService } from "./journal.services";
import httpStatus from "http-status";
import sendResponse from "../../utils/sendResponse";

const createJournal = catchAsync(async (req:Request, res:Response) => {
    const user = req.user
    const {title, body} = req.body
  const result = await journalService.createJournal(user.id, title, body);

  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Journal created successfully',
    data: result,
  });
});


const updateJournal = catchAsync(async (req:Request, res:Response) => {
    const {journalId} = req.params
    const {body, title} = req.body
    const user = req.user
  const result = await journalService.updateJounral(user.id, journalId,{body,title});

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Journal Updated successfully',
    data: result,
  });
});



const getAllJournals = catchAsync(async (req, res) => {
    const user = req.user
  const result = await journalService.getAllJournals(user.id);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'journals fetched successfully',
    data: result,
  });
});



const getSingleJournal = catchAsync(async (req, res) => {
    const {journalId} = req.params
    const user  = req.user
  const result = await journalService.getSingleJournal(user.id, journalId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Single journal fetched successfully',
    data: result,
  });
});


const deleteJournal = catchAsync(async (req, res) => {
    const user = req.user
    const {journalId} = req.params
  const result = await journalService.deleteJournal(user.id, journalId);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'delete journal successfully',
    data: result,
  });
});




const searchJournal = catchAsync(async (req, res) => {

    const user = req.user
    const {q} = req.query

  const result = await journalService.searchJournal(user.id,q as string);

  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Journal searched successfully',
    data: result,
  });
});

export const journalController = {createJournal, updateJournal, getAllJournals, getSingleJournal, deleteJournal, searchJournal}