import httpStatus from 'http-status';
import sendResponse from '../../utils/sendResponse';
import catchAsync from '../../utils/catchAsync';
import { categoryService } from './category.service';

const createCategory = catchAsync(async (req, res) => {
  const user = req.user as any;
  const {focusName} = req.body
  console.log(focusName)
  const result = await categoryService.createCategoryIntoDb(focusName);
  sendResponse(res, {
    statusCode: httpStatus.CREATED,
    success: true,
    message: 'Category created successfully',
    data: result,
  });
});

const getCategoryList = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await categoryService.getCategoryListFromDb();
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category list retrieved successfully',
    data: result,
  });
});

const getCategoryById = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await categoryService.getCategoryByIdFromDb( req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category details retrieved successfully',
    data: result,
  });
});

const updateCategory = catchAsync(async (req, res) => {
  const user = req.user as any;
  const {focusName} = req.body
  
  const result = await categoryService.updateCategoryIntoDb( req.params.id, focusName);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category updated successfully',
    data: result,
  });
});

const deleteCategory = catchAsync(async (req, res) => {
  const user = req.user as any;
  const result = await categoryService.deleteCategoryItemFromDb( req.params.id);
  sendResponse(res, {
    statusCode: httpStatus.OK,
    success: true,
    message: 'Category deleted successfully',
    data: result,
  });
});

export const categoryController = {
  createCategory,
  getCategoryList,
  getCategoryById,
  updateCategory,
  deleteCategory,
};