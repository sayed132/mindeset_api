import path from "path";
import prisma from "./app/utils/prisma";
import fs from 'fs'


async function seed(){
    const text = fs.readFileSync(path.join(process.cwd(), 'src', 'data.json'), 'utf-8')
    const data = JSON.parse(text)
    const book = await prisma.book.createMany({
        data: data
    })

    console.log(`Seeded ${book.count} books successfully!`)

}

seed()