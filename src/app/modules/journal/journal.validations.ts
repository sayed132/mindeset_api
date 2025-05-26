import z from 'zod'


const createJournalSchema = z.object ({
    title:z.string({required_error:"title is required"}),
    body:z.string({required_error:"body is required"})
})

const updateJournalSchema = z.object({
    title:z.string().optional(),
    body:z.string().optional()
})

export const journalValidation = {createJournalSchema, updateJournalSchema}