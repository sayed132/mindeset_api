export interface ICreateBook {
    title:string
    author:string
    authorDescription:string
    overview:string
    url:string
    images:string[]

}

export interface IUpdateBook {
    title?:string
    author?:string
    authorDescription?:string
    overview?:string
    url?:string
    images?:string[]
}