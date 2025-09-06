'use client';

import { ChangeEvent } from 'react';
import { FiImage, FiX, FiUpload } from 'react-icons/fi';
import Image from 'next/image';

interface TripImageUploaderProps {
  imageUrls: string[];
  coverImageIndex: number;
  onImageChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onRemoveImage: (index: number) => void;
  onSetCoverImage: (index: number) => void;
  isUploading?: boolean;
}

export function TripImageUploader({
  imageUrls = [],
  coverImageIndex = 0,
  onImageChange,
  onRemoveImage,
  onSetCoverImage,
  isUploading = false
}: TripImageUploaderProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Trip Photos
        </label>
        <p className="text-xs text-gray-500 mb-2">
          Add photos to your trip. The first image will be used as the cover photo.
        </p>
        
        <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-lg">
          <div className="space-y-1 text-center">
            <FiImage className="mx-auto h-12 w-12 text-gray-400" />
            <div className="flex text-sm text-gray-600">
              <label
                htmlFor="image-upload"
                className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500"
              >
                <span>Upload photos</span>
                <input
                  id="image-upload"
                  name="image-upload"
                  type="file"
                  className="sr-only"
                  accept="image/*"
                  multiple
                  onChange={onImageChange}
                  disabled={isUploading}
                />
              </label>
              <p className="pl-1">or drag and drop</p>
            </div>
            <p className="text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
            {isUploading && (
              <div className="mt-2 text-sm text-indigo-600">
                Uploading images...
              </div>
            )}
          </div>
        </div>
      </div>

      {imageUrls.length > 0 && (
        <div className="mt-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
            {imageUrls.map((url, index) => (
              <div key={index} className="relative group">
                <div className="aspect-w-16 aspect-h-9 rounded-lg overflow-hidden">
                  <Image
                    src={url}
                    alt={`Trip photo ${index + 1}`}
                    width={200}
                    height={150}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveImage(index);
                    }}
                    className="p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600"
                  >
                    <FiX className="h-4 w-4" />
                  </button>
                  {index !== coverImageIndex && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onSetCoverImage(index);
                      }}
                      className="p-1.5 bg-white text-gray-700 rounded-full hover:bg-gray-100"
                    >
                      Set as cover
                    </button>
                  )}
                </div>
                {index === coverImageIndex && (
                  <div className="absolute top-2 left-2 bg-indigo-500 text-white text-xs px-2 py-1 rounded-full">
                    Cover
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
