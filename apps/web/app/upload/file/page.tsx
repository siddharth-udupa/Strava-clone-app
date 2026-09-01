"use client"

import { useState } from "react"

export default function GPXUploadPage() {
  const [data, setData] = useState({
    title: "",
    description: "",
  })
  const [file, setFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [message, setMessage] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0])
      setMessage(null)
    }
  }

  const updateField = (field: string, value: unknown) =>
    setData(prev => ({ ...prev, [field]: value }))

  const handleUpload = async () => {
    if (!file) {
      setMessage("Please select a GPX file first.")
      return
    }

    setIsUploading(true)
    setMessage(null)

    try {
      const xmlContent = await file.text()
      const response = await fetch("/api/activities", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          source: "gpx",
          data: {
            title: data.title || file.name.replace(/\.gpx$/i, ""),
            description: data.description || null,
            xmlContent,
          },
        }),
      })

      if (response.ok) {
        setMessage("GPX file uploaded successfully!")
        setFile(null)
        setData({ title: "", description: "" })
      } else {
        const errorData = await response.json().catch(() => null)
        setMessage(`Upload failed: ${errorData?.detailedError || errorData?.error || response.statusText}`)
      }
    }
    catch (error) {
      console.error("Upload error:", error)
      setMessage("An error occurred during upload. Please check your connection to the backend.")
    }

    finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="p-auto w-full max-w-2xl mt-10 p-6 flex flex-col gap-8 bg-white rounded-lg shadow-md border border-gray-200">
      <h1 className="text-2xl font-bold text-gray-800">Upload GPX Activity</h1>

      {/* Title */}
      <div className="flex flex-col gap-1.5 py-2">
        <label htmlFor="title" className="text-xs text-gray-600">Title</label>
        <input
          id="title"
          type="text"
          placeholder="Lunch Run"
          value={data.title}
          onChange={e => updateField("title", e.target.value)}
          className="w-96 h-9 px-3 text-sm border border-gray-300 rounded bg-white outline-none focus:border-blue-400 placeholder:text-gray-400"
        />
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5 pb-6 border-b border-gray-200">
        <label htmlFor="description" className="text-xs text-gray-600">Description</label>
        <textarea
          id="description"
          placeholder="How'd it go? Share more about your activity and use @ to tag someone."
          value={data.description}
          onChange={e => updateField("description", e.target.value)}
          rows={5}
          className="w-96 px-3 py-2 text-sm border border-gray-300 rounded bg-white outline-none focus:border-blue-400 placeholder:text-gray-400 resize-y"
        />
      </div>


      <div className="mb-6">
        <label
          htmlFor="gpx-upload"
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          Select a .gpx file
        </label>
        <input
          type="file"
          id="gpx-upload"
          accept=".gpx"
          onChange={handleFileChange}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-semibold
            file:bg-orange-50 file:text-orange-700
            hover:file:bg-orange-100"
        />
        {file && (
          <p className="mt-2 text-sm text-gray-600">
            {/* Todo: Have covert the unit to MB if it exceeded a point */}
            Selected: {file.name} ({(file.size / 1024).toFixed(1)} KB)
          </p>
        )}
      </div>

      {message && (
        <div className={`mb-4 p-3 text-sm rounded ${message.includes("success") ? "bg-green-50 text-green-700" : "bg-red-50 text-red-700"
          }`}>
          {message}
        </div>
      )}

      <button
        onClick={handleUpload}
        disabled={!file || isUploading}
        className={`w-80 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white transition-colors
          ${!file || isUploading
            ? 'bg-orange-300 cursor-not-allowed'
            : 'bg-orange-600 hover:bg-orange-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-orange-500'
          }`}
      >
        {isUploading ? "Uploading..." : "Upload Activity"}
      </button>
    </div>
  );
}
