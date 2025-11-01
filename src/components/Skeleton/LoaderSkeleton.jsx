import React from "react";
const LoaderSkeleton = ({ size = "w-5 h-5", color = "border-teal-500" }) => {
  return (
    <div
      className={`${size} border-2 ${color} border-t-transparent rounded-full animate-spin`}
      role="status"
      aria-label="loading"
    ></div>
  );
};

export default LoaderSkeleton;
