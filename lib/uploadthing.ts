import { OurFileRouter } from "@/app/api/uploadthing/route"
import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react"



export const UploadButton = generateUploadButton<OurFileRouter>()
export const UploadDropzone = generateUploadDropzone<OurFileRouter>()
