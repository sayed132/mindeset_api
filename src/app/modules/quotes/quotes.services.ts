import httpStatus from "http-status"
import AppError from "../../errors/AppError"
import prisma from "../../utils/prisma"


const createQuote = async (focusId:string,payload:{text:string,author:string})=>{

    const quotes = await prisma.quote.create({data:{text:payload.text,author:payload.author,focusAreaId:focusId}})
    return quotes

}

const getAllQuotes = async ()=>{
    const allQuotes = await prisma.quote.findMany()

    return allQuotes
}


const getQuotesByCategory = async (focusId:string)=>{
    const speceficQuotes = await prisma.quote.findMany({where:{focusAreaId:focusId}})

    return speceficQuotes
}


const getAQuotes = async (quotesId:string)=>{
    const quotes = await prisma.quote.findUnique({where:{id:quotesId}})

    return quotes
}

const deleteQuote = async (quoteId:string)=>{
    const deletedQuote = await prisma.quote.delete({where:{id:quoteId}})
    return {message:"Delete successfully"}
}

const updateQuotes = async (quoteId:string, payload:{text?:string, author?:string})=>{
    const quote = await prisma.quote.findUnique({where:{id:quoteId}})
    if (!quote){
        throw new AppError(httpStatus.NOT_FOUND, "Quotes not found")
    }
    const data = {
        text: payload.text? payload.text :quote.text,
        author:payload.author? payload.author:quote.author
    }
    const updatedQuotes = await prisma.quote.update({where:{id:quoteId}, data})
    return updateQuotes
}

export const quoteServices = {
    createQuote,
    getAllQuotes,
    getQuotesByCategory,
    getAQuotes,
    deleteQuote,
    updateQuotes
}