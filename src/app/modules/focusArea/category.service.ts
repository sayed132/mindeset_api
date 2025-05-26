import httpStatus from 'http-status';
import AppError from '../../errors/AppError';
import prisma from '../../utils/prisma';



const createCategoryIntoDb = async ( categoryName: any) => {
  console.log(categoryName)
    const result = await prisma.focusArea.create({ 
      data: {
        title:categoryName,
      }
     });

     if(!result){
        throw new AppError(httpStatus.BAD_REQUEST, 'Category not created');
      }
    return result;
  }


const getCategoryListFromDb = async () => {
  const result = await prisma.focusArea.findMany();
  if (result.length === 0) {
    return { message: 'Category not found' };
  }
  return result;
};


const getCategoryByIdFromDb = async ( categoryId: string) => {

  const result = await prisma.focusArea.findUnique({ 
    where: { 
      id : categoryId,
    } 
  });
  if (!result) {
    throw new Error('Category not found');
  }
  return result;
};


const updateCategoryIntoDb = async (
  categoryId: string,
  categoryName: string,
) => {
  const result = await prisma.focusArea.update({
    where: {
      id: categoryId,
    },
    data: {
      title: categoryName,
    },
  });
  if (!result) {
    throw new AppError(httpStatus.BAD_REQUEST, 'Category not updated');
  }
  return result;
};


const deleteCategoryItemFromDb = async ( categoryId: string) => {
  const deletedItem = await prisma.focusArea.delete({
    where: {
      id: categoryId
    },
  });
  if(!deletedItem){
    throw new AppError(httpStatus.BAD_REQUEST, 'Category not deleted');
  }

  return deletedItem;
};


export const categoryService = {
  createCategoryIntoDb,
  getCategoryListFromDb,
  getCategoryByIdFromDb,
  updateCategoryIntoDb,
  deleteCategoryItemFromDb,
};