"use client";

import { Camera, Upload, X } from "lucide-react";

type Props = {
  label: string;
  previewUrl: string;
  onFileChange: (file: File | null, previewUrl: string) => void;
};

export default function PhotoUpload({
  label,
  previewUrl,
  onFileChange,
}: Props) {
  const inputId =
    label.toLowerCase().replace(/\s+/g, "-") + "-upload";

  const handleChange = (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];

    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select a valid image file.");
      return;
    }

    const reader = new FileReader();

    reader.onloadend = () => {
      onFileChange(file, reader.result as string);
    };

    reader.readAsDataURL(file);
  };

  const removePhoto = () => {
    onFileChange(null, "");
  };

  return (
    <div className="flex flex-col items-center rounded-xl border border-gray-200 bg-gray-50 p-5">
      <div className="relative flex h-44 w-44 items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gray-300 bg-white">
        {previewUrl ? (
          <>
            <img
              src={previewUrl}
              alt={label}
              className="h-full w-full object-cover"
            />

            <button
              type="button"
              onClick={removePhoto}
              className="absolute right-2 top-2 rounded-full bg-red-900 p-1 text-white hover:bg-red-950"
            >
              <X className="h-4 w-4" />
            </button>
          </>
        ) : (
          <div className="text-center">
            <Camera className="mx-auto h-10 w-10 text-gray-400" />
            <p className="mt-2 text-sm font-medium text-gray-700">
              {label}
            </p>
            <p className="mt-1 text-xs text-gray-400">
              Optional
            </p>
          </div>
        )}
      </div>

      <input
        id={inputId}
        type="file"
        accept="image/*"
        onChange={handleChange}
        className="hidden"
      />

      <label
        htmlFor={inputId}
        className="mt-4 inline-flex cursor-pointer items-center gap-2 rounded-lg bg-red-900 px-4 py-2 text-sm font-medium text-white hover:bg-red-950"
      >
        <Upload className="h-4 w-4" />
        {previewUrl ? "Change Photo" : "Upload Photo"}
      </label>
    </div>
  );
}