import FilePreviewGrid from "./FilePreviewGrid.jsx";

export default function EventMediaForm({
  eventTitle,
  files,
  setFiles,
  uploading,
  handleUpload,
}) {
  const handleFileChange = (e) => {
    setFiles([...e.target.files]);
  };

  return (
    <form onSubmit={handleUpload} className="space-y-6">
      {/* Event Title */}
      <div>
        <label className="block text-sm font-medium mb-1 text-gray-300">
          Event Title
        </label>
        <input
          type="text"
          value={eventTitle}
          readOnly
          className="w-full p-3 rounded-lg bg-[#0F1A24] border border-gray-700 text-gray-400 cursor-not-allowed"
        />
      </div>

      {/* File Input */}
      <div>
        <label className="block text-sm font-medium mb-2 text-gray-300">
          Select Media Files
        </label>
        <input
          type="file"
          multiple
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="block w-full text-gray-300 file:mr-4 file:py-2 file:px-4 
          file:rounded-md file:border-0 file:text-sm 
          file:font-semibold file:bg-teal-600 file:text-white 
          hover:file:bg-teal-400 cursor-pointer"
        />
      </div>

      {/* File Previews */}
      {files.length > 0 && <FilePreviewGrid files={files} />}

      {/* Submit */}
      <button
        type="submit"
        disabled={uploading}
        className={`w-full text-white font-semibold py-3 rounded-xl shadow-md mt-6 transition ${
          uploading
            ? "bg-teal-400 cursor-not-allowed"
            : "bg-teal-500 hover:bg-teal-400"
        }`}
      >
        {uploading ? "Uploading..." : "Upload Media"}
      </button>
    </form>
  );
}
