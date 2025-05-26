import httpStatus, { NOT_FOUND } from "http-status"
import AppError from "../../errors/AppError"
import prisma from "../../utils/prisma"
import isDateValid from "../../utils/checkDateValidity"
import { title } from "process"





const createJournal = async (userId:string,title:string,body:string) => {
    
    const createdJournal = await prisma.journal.create({data:{
        body,title,userId
    }})

    

    return createdJournal
}

const updateJounral = async (userId:string,journalId:string,payload:{body?:string,title?:string})=>{
    const journal = await prisma.journal.findUnique({where:{id:journalId}})



    if (!journal){
        throw new AppError(httpStatus.NOT_FOUND, "Journal is not found")
    }

    if (journal.userId !== userId){
        throw new AppError(httpStatus.UNAUTHORIZED, "you are not authorized to eidt this journal")
    }
    const updatedJournal = await prisma.journal.update({where:{
        id:journal.id
    }, 
    data:{
        body:payload.body || journal.body,
        title:payload.title || journal.title
    }})
    
    return updatedJournal
}

const getAllJournals = async (userId:string)=>{
    const journals = await prisma.journal.findMany({where:{userId}})
    
    return journals
}

const getSingleJournal = async (userId:string, journalid:string)=>{

    const journal = await prisma.journal.findFirst({where:{id:journalid, userId}})

    if (!journal){
        throw new AppError(httpStatus.NOT_FOUND, "Journal not found")
    }
    console.log(journal)
    console.log(userId)
    if (journal.userId !== userId){
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not allowed to see  this journal")
    }

    return journal
}

const deleteJournal = async (userId:string, journalId:string)=>{
    const journal = await prisma.journal.findFirst({where:{id:journalId, userId}})
    if (!journal){
        throw new AppError(httpStatus.NOT_FOUND,"Journal not found")
    }

     if (journal.userId !== userId){
        throw new AppError(httpStatus.UNAUTHORIZED, "You are not allowed to see  this journal")
    }

    await prisma.journal.delete({where:{id:journal.id}})
 
}


const searchJournal = async (userId:string, q:string)=>{
     let filteredJournals = []
    try{
         const dateIsValid = isDateValid(q)
        console.log(dateIsValid)

         if(dateIsValid){
            let date = new Date(q).toISOString()
            let nextDay = new Date(new Date(q).setDate(new Date(q).getDate()+1)).toISOString()
            filteredJournals = await prisma.journal.findMany({
                where: {
                    userId,
                    createdAt: {
                        gte: date,
                        lt: nextDay
                    }
                },
                orderBy: { createdAt: "desc" }
            })
         }
        //  AND:{OR:[{title:{contains:q},body:{contains:q}}]}
         else{
            filteredJournals = await prisma.journal.findMany({where:{userId, OR:[{body:{contains:q,mode:'insensitive'}},{title:{contains:q,mode:'insensitive'}}]}})
         }
    } catch(err:any)
    {
        throw err
    }  
   return filteredJournals

}
export const journalService = {createJournal, updateJounral, getAllJournals, getSingleJournal, deleteJournal, searchJournal}