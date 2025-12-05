'use client'

import { useState } from 'react'
import { Upload, Link as LinkIcon } from 'lucide-react'

interface ModelImportProps {
  projectId: string
  onModelUploaded: (modelUrl: string, source: 'upload' | 'url') => void
}

export function ModelImport({ projectId, onModelUploaded }: ModelImportProps) {
  const [importMethod, setImportMethod] = useState<'upload' | 'url'>('upload')
  const [externalUrl, setExternalUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    const validTypes = ['.gltf', '.glb']
    const fileExt = file.name.toLowerCase().slice(file.name.lastIndexOf('.'))
    if (!validTypes.includes(fileExt)) {
      setError('Please upload a .gltf or .glb file')
      return
    }

    setIsUploading(true)
    setError(null)
    setUploadProgress(0)

    try {
      // Create FormData for upload
      const formData = new FormData()
      formData.append('file', file)
      formData.append('projectId', projectId)

      // Upload to API route (will handle Supabase storage)
      const response = await fetch('/api/upload-model', {
        method: 'POST',
        body: formData
      })

      if (!response.ok) {
        throw new Error('Upload failed')
      }

      const data = await response.json()
      setUploadProgress(100)

      // Call callback with Supabase URL
      onModelUploaded(data.url, 'upload')

    } catch (err) {
      setError('Upload failed. Please try again.')
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  const handleUrlSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!externalUrl.trim()) {
      setError('Please enter a valid URL')
      return
    }

    // Basic URL validation
    try {
      new URL(externalUrl)
    } catch {
      setError('Invalid URL format')
      return
    }

    setIsUploading(true)
    setError(null)

    try {
      // Save external URL to database
      const response = await fetch('/api/save-model-url', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          projectId,
          modelUrl: externalUrl,
          source: 'url'
        })
      })

      if (!response.ok) {
        throw new Error('Failed to save URL')
      }

      // Call callback with external URL
      onModelUploaded(externalUrl, 'url')

    } catch (err) {
      setError('Failed to save URL. Please try again.')
      console.error(err)
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="glass-panel p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-bold mb-6">Import 3D Model</h2>

      {/* Import Method Selector */}
      <div className="flex gap-4 mb-6">
        <button
          onClick={() => setImportMethod('upload')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            importMethod === 'upload'
              ? 'bg-cyan-500 text-black'
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          <Upload className="w-5 h-5 inline-block mr-2" />
          Upload File
        </button>
        <button
          onClick={() => setImportMethod('url')}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-all ${
            importMethod === 'url'
              ? 'bg-cyan-500 text-black'
              : 'bg-white/10 hover:bg-white/20'
          }`}
        >
          <LinkIcon className="w-5 h-5 inline-block mr-2" />
          External URL
        </button>
      </div>

      {/* Upload File */}
      {importMethod === 'upload' && (
        <div className="space-y-4">
          <div className="border-2 border-dashed border-white/20 rounded-lg p-8 text-center hover:border-cyan-500 transition-colors">
            <input
              type="file"
              accept=".gltf,.glb"
              onChange={handleFileUpload}
              disabled={isUploading}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="cursor-pointer block"
            >
              <Upload className="w-12 h-12 mx-auto mb-4 text-cyan-500" />
              <p className="text-lg font-medium mb-2">
                {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-sm text-white/60">
                Supports .gltf and .glb files (max 100MB)
              </p>
            </label>
          </div>

          {isUploading && (
            <div className="space-y-2">
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
              <p className="text-sm text-center text-white/60">
                {uploadProgress}% complete
              </p>
            </div>
          )}
        </div>
      )}

      {/* External URL */}
      {importMethod === 'url' && (
        <form onSubmit={handleUrlSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Model URL
            </label>
            <input
              type="url"
              value={externalUrl}
              onChange={(e) => setExternalUrl(e.target.value)}
              placeholder="https://example.com/model.gltf"
              disabled={isUploading}
              className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg focus:outline-none focus:border-cyan-500 transition-colors"
            />
            <p className="text-xs text-white/60 mt-2">
              Supports Google Drive, Dropbox, or any public URL to a .gltf/.glb file
            </p>
          </div>

          <button
            type="submit"
            disabled={isUploading || !externalUrl.trim()}
            className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 disabled:bg-white/10 disabled:cursor-not-allowed text-black font-medium rounded-lg transition-colors"
          >
            {isUploading ? 'Saving...' : 'Import Model'}
          </button>
        </form>
      )}

      {/* Error Message */}
      {error && (
        <div className="mt-4 p-4 bg-red-500/20 border border-red-500/50 rounded-lg text-red-200">
          {error}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-6 p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
        <h3 className="font-semibold mb-2 text-blue-300">💡 Tips</h3>
        <ul className="text-sm text-white/70 space-y-1">
          <li>• Upload files are stored in Supabase Storage</li>
          <li>• External URLs load directly (no storage cost)</li>
          <li>• Ensure external URLs are publicly accessible</li>
          <li>• For Google Drive: Use "Get Link" → "Anyone with the link"</li>
        </ul>
      </div>
    </div>
  )
}
