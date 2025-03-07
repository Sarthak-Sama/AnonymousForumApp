import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useDropzone } from "react-dropzone";
import {
  RiArrowLeftLine,
  RiCloseLine,
  RiRotateLockFill,
} from "@remixicon/react";
import { useDispatch, useSelector } from "react-redux";
import { loadUser } from "../redux/reducers/userSlice";
import imageCompression from "browser-image-compression";

function UploadPostPage({ handleUpload }) {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [files, setFiles] = useState([]);
  const [error, setError] = useState("");
  const [blobUrls, setBlobUrls] = useState([]);
  const [isUploading, setIsUploading] = useState(false);
  const [rotationAngles, setRotationAngles] = useState({});

  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.user);
  const categoriesArray = user?.categories;

  useEffect(() => {
    loadUser();
  }, [user, dispatch]);

  // Function to compress image files only
  const compressFile = async (file) => {
    if (file.type.startsWith("image/")) {
      const options = {
        maxSizeMB: 0.5, // compress to around 500KB
        maxWidthOrHeight: 1280, // limit dimensions
        useWebWorker: true,
      };
      try {
        const compressedImage = await imageCompression(file, options);
        return compressedImage;
      } catch (error) {
        console.error("Image compression error:", error);
        return file;
      }
    } else {
      // If file is not an image, simply return it (should not happen if we catch videos in onDrop)
      return file;
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: "image/*, video/*", // still accept video to catch the case
    multiple: true,
    onDrop: async (acceptedFiles) => {
      // If any file is a video, set an error and do not process any files
      const videoFiles = acceptedFiles.filter((file) =>
        file.type.startsWith("video/")
      );
      if (videoFiles.length > 0) {
        setError("Sorry, Video uploads are not yet available.");
        return;
      }
      // Process only image files
      const compressedFiles = await Promise.all(
        acceptedFiles.map((file) => compressFile(file))
      );
      const newBlobUrls = compressedFiles.map((file) =>
        URL.createObjectURL(file)
      );
      setBlobUrls((prev) => [...prev, ...newBlobUrls]);
      setFiles((prevFiles) => [
        ...prevFiles,
        ...compressedFiles.map((file, index) =>
          Object.assign(file, { preview: newBlobUrls[index] })
        ),
      ]);
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Please fill out the title");
      return;
    }
    if (!content.trim()) {
      setError("Please fill out the content");
      return;
    }
    setError("");
    setIsUploading(true);
    const formData = new FormData();
    formData.append("title", title);
    formData.append("textContent", content);
    const selectedCategory = document.getElementById("category").value;
    formData.append("category", selectedCategory);
    if (files && files.length > 0) {
      files.forEach((file) => {
        // Since videos are not allowed, only images are appended
        if (file.type.startsWith("image/")) {
          formData.append("image", file);
        }
      });
    }
    handleUpload(formData);
    navigate("/");
  };

  const goBack = () => {
    navigate(-1);
  };

  const removeFile = (indexToRemove) => {
    setFiles(files.filter((_, index) => index !== indexToRemove));
    URL.revokeObjectURL(blobUrls[indexToRemove]);
    setBlobUrls(blobUrls.filter((_, index) => index !== indexToRemove));
  };

  const rotateImage = (index, angle) => {
    setRotationAngles((prev) => ({
      ...prev,
      [index]: (prev[index] || 0) + angle,
    }));
  };

  useEffect(() => {
    return () => {
      blobUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [blobUrls]);

  return (
    <div className="flex items-center justify-center w-screen h-screen overflow-y-hidden bg-gray-100 dark:bg-[#191919] py-4 md:py-8">
      <RiArrowLeftLine
        size={40}
        className="hidden sm:block text-black opacity-50 hover:opacity-100 dark:text-[#EDEDED] fixed left-0 top-0 mt-5 ml-5"
        onClick={goBack}
      />
      <div className="bg-white dark:bg-zinc-800 p-4 md:p-8 rounded-lg shadow-lg h-screen sm:h-[90%] md:h-[75%] overflow-auto md:overflow-hidden w-full sm:w-[75%] md:w-[60%] mx-0">
        <div className="flex flex-col md:flex-row gap-5">
          <div className="w-full md:w-1/2">
            <h2 className="text-xl font-semibold text-gray-700 dark:text-[#EDEDED] mb-4">
              Upload Post
            </h2>
            {/* Title Input */}
            <div className="mb-4">
              <label className="block text-gray-600 dark:text-zinc-300 mb-1">
                Title
              </label>
              <input
                type="text"
                placeholder="Enter post title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full p-2 border border-[#161616] rounded-md outline-none focus:border-[#EA516F] text-black dark:text-white dark:bg-[#161616]"
                required
              />
            </div>
            {/* Content Input */}
            <div className="mb-4">
              <label className="block text-gray-600 dark:text-zinc-300 mb-1">
                Content
              </label>
              <textarea
                placeholder="Spill the tea.."
                value={content}
                onChange={(e) => setContent(e.target.value)}
                className="w-full h-[10rem] resize-none p-2 border border-[#161616] rounded-md outline-none focus:border-[#EA516F] text-black dark:text-white dark:bg-[#161616]"
                required
              />
            </div>
            {/* Category Menu */}
            <div className="mb-4">
              <label className="inline mr-5 text-gray-600 dark:text-zinc-300 mb-1">
                Category (Optional):
              </label>
              <select
                className="px-3 py-2 text-sm dark:bg-[#161616] dark:text-[#EDEDED]"
                name="category"
                id="category"
              >
                <option value="">General/All</option>
                {categoriesArray?.map((cat, index) => (
                  <option key={index} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>
          </div>
          <div className="w-full md:w-1/2 relative">
            {/* File Dropzone */}
            <div
              {...getRootProps()}
              className="border-2 border-dashed border-gray-300 rounded-md p-10 mb-4 text-center cursor-pointer"
            >
              <input {...getInputProps()} />
              <p className="text-gray-500">
                Drag and Drop here or{" "}
                <span className="text-[#EA516F] underline">Browse files</span>
              </p>
              <p className="text-sm text-gray-400">
                Accepted File Types: .jpg, .png, .mp4 only
              </p>
              <p className="text-sm text-gray-400 mt-2">
                {files.length}/5 files uploaded
              </p>
            </div>
            {/* File Preview */}
            {files.length > 0 && (
              <div className="mt-4">
                <h4 className="text-gray-600 dark:text-zinc-300">
                  Selected Files:
                </h4>
                <div className="max-h-[30vh] overflow-y-auto">
                  <div className="flex flex-wrap h-full gap-2 mt-2 overflow-x-auto p-2">
                    {files.map((file, index) => (
                      <div key={file.path} className="w-28 h-28 relative">
                        {file.type.startsWith("image/") ? (
                          <div className="w-full h-full relative">
                            <img
                              src={file.preview}
                              alt="Preview"
                              className="object-cover w-full h-full rounded-md"
                              style={{
                                transform: `rotate(${
                                  rotationAngles[index] || 0
                                }deg)`,
                              }}
                            />
                            <div
                              className="absolute w-5 h-5 right-1 top-1 rounded-full bg-red-500 flex items-center justify-center cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(index);
                              }}
                            >
                              <RiCloseLine color="#EFEFEF" />
                            </div>
                            <div className="absolute bottom-0 left-0 right-0 flex justify-center space-x-2 p-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  rotateImage(index, -90);
                                }}
                                className="p-1 bg-black bg-opacity-50 rounded-full"
                              >
                                <RiRotateLockFill color="#EFEFEF" size={16} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  rotateImage(index, 90);
                                }}
                                className="p-1 bg-black bg-opacity-50 rounded-full"
                              >
                                <RiRotateLockFill
                                  color="#EFEFEF"
                                  size={16}
                                  style={{ transform: "scaleX(-1)" }}
                                />
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="w-full h-full relative">
                            <video
                              src={file.preview}
                              className="object-cover w-full h-full rounded-md"
                              controls
                            />
                            <div
                              className="absolute w-5 h-5 right-1 top-1 rounded-full bg-red-500 flex items-center justify-center cursor-pointer"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile(index);
                              }}
                            >
                              <RiCloseLine color="#EFEFEF" />
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <h3 className="text-[#EA516F] absolute bottom-0 left-1/2 transform -translate-x-1/2">
              {error}
            </h3>
          </div>
        </div>
        <button
          onClick={handleSubmit}
          disabled={isUploading}
          className="w-full md:w-1/2 mt-4 bg-[#EA516F] text-white py-2 rounded-md hover:bg-[#EA516F] transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isUploading ? "Uploading..." : "Upload"}
        </button>
      </div>
    </div>
  );
}

export default UploadPostPage;
