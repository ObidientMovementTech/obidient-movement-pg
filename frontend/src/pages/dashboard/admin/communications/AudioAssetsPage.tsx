import { useState, useEffect } from "react";
import { Upload, Music, RefreshCw } from "lucide-react";
import { getAudioAssets, uploadAudioAsset, AudioAsset } from "../../../../services/communicationsService";
import { format } from "date-fns";

export default function AudioAssetsPage() {
  const [audioAssets, setAudioAssets] = useState<AudioAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const fetchAssets = async () => {
    try {
      setLoading(true);
      const assets = await getAudioAssets();
      setAudioAssets(assets);
      setError(null);
    } catch (err) {
      setError("Failed to load audio assets");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAssets();
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith("audio/")) {
        alert("Please select an audio file");
        return;
      }
      // Validate file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert("File size must be less than 10MB");
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError(null);
      const newAsset = await uploadAudioAsset(selectedFile);
      setAudioAssets([newAsset, ...audioAssets]);
      setSelectedFile(null);
      // Reset file input
      const fileInput = document.getElementById("audio-upload") as HTMLInputElement;
      if (fileInput) fileInput.value = "";
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to upload audio file");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Upload Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Upload Audio File</h2>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 text-sm">{error}</p>
          </div>
        )}

        <div className="flex items-center gap-4">
          <label className="flex-1">
            <input
              id="audio-upload"
              type="file"
              accept="audio/*"
              onChange={handleFileSelect}
              className="block w-full text-sm text-gray-500
                file:mr-4 file:py-2 file:px-4
                file:rounded-lg file:border-0
                file:text-sm file:font-medium
                file:bg-purple-50 file:text-purple-700
                hover:file:bg-purple-100
                cursor-pointer"
            />
          </label>
          <button
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
            className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Upload className="w-4 h-4" />
            {uploading ? "Uploading..." : "Upload"}
          </button>
        </div>

        <p className="mt-2 text-xs text-gray-500">
          Supported formats: MP3, WAV, OGG • Max size: 10MB
        </p>

        {selectedFile && (
          <div className="mt-4 p-4 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700">
              <span className="font-medium">Selected:</span> {selectedFile.name}
            </p>
            <p className="text-xs text-gray-500 mt-1">
              {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
            </p>
          </div>
        )}
      </div>

      {/* Assets List */}
      <div className="bg-white rounded-lg shadow">
        <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">
            Uploaded Audio Files ({audioAssets.length})
          </h2>
          <button
            onClick={fetchAssets}
            className="px-4 py-2 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>

        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
            </div>
          ) : audioAssets.length === 0 ? (
            <div className="text-center py-12">
              <Music className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-500">No audio files uploaded yet</p>
              <p className="text-sm text-gray-400 mt-2">Upload an audio file to get started</p>
            </div>
          ) : (
            <div className="space-y-4">
              {audioAssets.map((asset) => (
                <div
                  key={asset.id}
                  className="border border-gray-200 rounded-lg p-4 hover:border-purple-300 hover:bg-purple-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex items-start gap-4 flex-1">
                      <div className="bg-purple-100 rounded-lg p-3">
                        <Music className="w-6 h-6 text-purple-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {asset.original_name}
                        </h3>
                        <p className="text-sm text-gray-500 mt-1">
                          Duration: {asset.duration_seconds ? `${asset.duration_seconds}s` : "Unknown"}
                        </p>
                        <p className="text-xs text-gray-400 mt-1">
                          Uploaded {format(new Date(asset.uploaded_at), "MMM d, yyyy")}
                        </p>
                        <div className="mt-3">
                          <audio controls src={asset.file_url} className="w-full max-w-md" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
