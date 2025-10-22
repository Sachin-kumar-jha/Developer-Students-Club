export default function UploadOverlay({ progress }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/60 z-50">
      <div className="w-14 h-14 border-4 border-teal-400 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-300">{progress}% Uploaded</p>
    </div>
  );
}
