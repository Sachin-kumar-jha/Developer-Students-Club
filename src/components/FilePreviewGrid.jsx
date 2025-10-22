export default function FilePreviewGrid({ files }) {
  return (
    <div className="grid grid-cols-2 gap-3 mt-4">
      {files.map((file, i) => (
        <div
          key={i}
          className="bg-[#0F1A24] border border-gray-700 rounded-xl p-2 text-sm text-gray-400"
        >
          <p className="truncate">{file.name}</p>
          <p className="text-xs text-gray-500">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
      ))}
    </div>
  );
}
