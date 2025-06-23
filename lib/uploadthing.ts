import { generateUploadButton, generateUploadDropzone } from "@uploadthing/react"

export const UploadButton = generateUploadButton({
  url: "https://api.uploadthing.com",
})

export const UploadDropzone = generateUploadDropzone({
  url: "https://api.uploadthing.com",
})

export const uploadFiles = async (files: File[]) => {
  const formData = new FormData()
  files.forEach((file) => {
    formData.append("files", file)
  })

  try {
    const response = await fetch("/api/uploadthing", {
      method: "POST",
      body: formData,
    })

    if (!response.ok) {
      throw new Error("Upload failed")
    }

    return await response.json()
  } catch (error) {
    console.error("Upload error:", error)
    throw error
  }
}
