import httpStatus from "http-status"
import AppError from "../../errors/AppError"
import prisma from "../../utils/prisma"
import { ICreateBook, IUpdateBook } from "./book.interfaces"


const createBooks = async (focusId:string,payload:ICreateBook)=>{

    const books = await prisma.book.create({data:{ttitle:payload.title,author:payload.author,authorDescription:payload.author,overview:payload.overview,url:payload.url,focusAreaId:focusId}})
    return books

}

const getAllBooks = async ()=>{
    const allBooks = await prisma.book.findMany()

    return allBooks
}


const getBooksByCategory = async (focusId:string)=>{
    const speceficBooks = await prisma.book.findMany({where:{focusAreaId:focusId}})

    return speceficBooks
}


const getABooks = async (bookId:string)=>{
    const books = await prisma.book.findUnique({where:{id:bookId}})

    return books
}

const deleteBook = async (booksId:string)=>{
    const deletedBook = await prisma.book.delete({where:{id:booksId}})
    
    return {message:"Delete successfully"}
}

const updateBooks = async (booksId:string, payload:IUpdateBook)=>{
    console.log(booksId)
    const book = await prisma.book.findUnique({where:{id:booksId}})
    if (!book){
        throw new AppError(httpStatus.NOT_FOUND, "Books not found")
    }
    let images = book.images
    if(payload.images){
        images = images.concat(payload.images)
    }
    const {author, authorDescription, overview, title, url}  = payload
   
    const updatedBooks = await prisma.book.update({where:{id:booksId}, data:{
        author:author || book.author,
        authorDescription:authorDescription || book.authorDescription,
        overview:overview || book.overview,
        ttitle:title || book.ttitle,
        url:url || book.url
    }})

    return updatedBooks
}

export const bookServices = {
    createBooks,
    getAllBooks,
    getBooksByCategory,
    getABooks,
    deleteBook,
    updateBooks
}