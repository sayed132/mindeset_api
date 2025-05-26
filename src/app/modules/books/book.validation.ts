import { z } from "zod";


const createBookSchema = z.object({
    title:z.string({required_error:"title is required"}),
    author:z.string({required_error:"author is required"}),
    authorDescription:z.string({required_error:"author description is required"}),
    overview:z.string({required_error:"overview is required"}),
    url:z.string({required_error:"Url is required"})

})

export {createBookSchema}