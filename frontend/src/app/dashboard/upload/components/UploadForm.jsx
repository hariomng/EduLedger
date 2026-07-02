"use client";

import { useState, useEffect } from "react";
import { FaCloudUploadAlt } from "react-icons/fa";
import { useAccount, useWriteContract, useWaitForTransactionReceipt } from "wagmi";
import { abi } from "../../../../../contracts/EduLedgerAbi.js";
import apiFetch from "@/utils/apiClient";
import { celoSepolia } from "wagmi/chains";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export default function UploadForm() {
  const { address } = useAccount();
  const { writeContract, data: txHash, error: writeError, isPending } = useWriteContract();
  const {
    isLoading: isWaiting,
    isSuccess: isConfirmed,
    isError: isFailed,
  } = useWaitForTransactionReceipt({ hash: txHash });

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [usageRights, setUsageRights] = useState("Standard License (download only)");
  const [visibility, setVisibility] = useState("public");

  const [docFile, setDocFile] = useState(null);
  const [docFileName, setDocFileName] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [thumbPreview, setThumbPreview] = useState(null);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const handleDocChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setDocFile(file);
      setDocFileName(file.name);
    }
  };

  const handleThumbChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      setThumbFile(file);
      setThumbPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (!title || !docFile) {
      setError("Title and document file are required.");
      return;
    }

    if (!address) {
      setError("Please connect your wallet to mint an NFT.");
      return;
    }

    setSubmitting(true);

    try {
      // 1️⃣ Prepare FormData including all metadata
      const formData = new FormData();
      formData.append("file", docFile);
      if (thumbFile) formData.append("thumbnail", thumbFile);
      formData.append("name", title); //use the title for name
      formData.append("description", description);
      formData.append("price", price);
      formData.append("usageRights", usageRights);
      formData.append("visibility", visibility);
      formData.append("owner", address);

      // 2️⃣ Upload everything to backend (which uploads to Pinata)
      const uploadRes = await apiFetch("/api/upload", {
        method: "POST",
        body: formData,
      });
      const uploadData = await uploadRes.json();
      console.log("Pinata Upload Response:", uploadData);

      if (!uploadRes.ok || !uploadData?.metadata) {
        throw new Error(uploadData?.error || "File upload failed");
      }

      const tokenURI = uploadData.metadata;

      // 3️⃣ Mint NFT
      writeContract({
        address: contractAddress,
        abi,
        functionName: "mint",
        args: [tokenURI],
        chain: celoSepolia,
      });
    } catch (err) {
      console.error("Upload or Mint Error:", err);
      setError(err?.message || "Something went wrong. Please try again.");
      setSubmitting(false);
    }
  };

  // 4️⃣ React to minting status
  useEffect(() => {
    if (writeError) {
      setError(writeError.message || "Transaction failed. Please try again.");
      setSubmitting(false);
    }
  }, [writeError]);

  useEffect(() => {
    if (isConfirmed) {
      setSuccess("🎉 Document uploaded successfully");
      setSubmitting(false);
    } else if (isFailed) {
      setError("Transaction failed. Please try again.");
      setSubmitting(false);
    }
  }, [isConfirmed, isFailed]);

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white border border-gray-200 rounded-xl p-8 shadow-sm"
    >
      <h2 className="text-xl font-bold mb-6">Create a New Study Resource</h2>
      <p className="text-sm text-gray-600 mb-8">
        Upload your lecture notes, projects, or past questions — and mint them as NFTs on-chain.
      </p>

      {/* Document Title */}
      <div className="mb-5">
        <label className="block text-sm font-medium mb-2">Document Title</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="e.g. ECO 304 - Development Economics Lecture Notes"
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          required
        />
      </div>

      {/* Short Description */}
      <div className="mb-5">
        <label className="block text-sm font-medium mb-2">Short Description</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Comprehensive lecture notes covering key development theories and examples."
          rows={3}
          className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm resize-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
        />
      </div>

      {/* Thumbnail */}
      <div className="mb-5">
        <label className="block text-sm font-medium mb-2">Thumbnail Image</label>
        <div className="flex items-center gap-4">
          <input type="file" accept="image/*" onChange={handleThumbChange} className="text-sm" />
          {thumbPreview && (
            <img
              src={thumbPreview}
              alt="Thumbnail Preview"
              className="w-16 h-16 rounded object-cover border"
            />
          )}
        </div>
      </div>

      {/* Upload File */}
      <div className="mb-5">
        <label className="block text-sm font-medium mb-2">Upload Your File</label>
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-blue-400 transition">
          <input
            type="file"
            id="file-upload"
            className="hidden"
            onChange={handleDocChange}
            accept=".pdf,.doc,.docx,.ppt,.pptx,.zip"
          />
          <label
            htmlFor="file-upload"
            className="cursor-pointer flex flex-col items-center justify-center"
          >
            <FaCloudUploadAlt className="text-3xl text-blue-500 mb-2" />
            <p className="text-sm text-gray-600 mb-2">
              {docFileName ? (
                <span className="font-medium text-gray-800">{docFileName}</span>
              ) : (
                <>
                  Tap to Upload{" "}
                  <span className="text-gray-400">
                    (.pdf, .docx, .pptx, .zip | 10MB max)
                  </span>
                </>
              )}
            </p>
            <button
              type="button"
              className="px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Choose File
            </button>
          </label>
        </div>
      </div>

      {/* Price + Usage Rights */}
      <div className="grid sm:grid-cols-2 gap-4 mb-5">
        <div>
          <label className="block text-sm font-medium mb-2">Set Your Price (optional)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="celo"
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-2">Usage Rights</label>
          <select
            value={usageRights}
            onChange={(e) => setUsageRights(e.target.value)}
            className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:ring-2 focus:ring-blue-100 focus:border-blue-500"
          >
            <option>Standard License (download only)</option>
            <option>Creative Commons</option>
            <option>Private Use Only</option>
          </select>
        </div>
      </div>

      {/* Visibility */}
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Visibility</label>
        <div className="flex flex-col gap-2 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="radio"
              id="public"
              name="visibility"
              checked={visibility === "public"}
              onChange={() => setVisibility("public")}
              className="accent-blue-600"
            />
            Public (default) — Anyone can view or download.
          </label>
          <label className="flex items-center gap-2">
            <input
              type="radio"
              id="private"
              name="visibility"
              checked={visibility === "private"}
              onChange={() => setVisibility("private")}
              className="accent-blue-600"
            />
            Private — Only you and invited users can access.
          </label>
        </div>
      </div>

      {/* Feedback */}
      {error && <p className="text-red-600 text-sm mb-4">{error}</p>}
      {success && <p className="text-green-600 text-sm mb-4">{success}</p>}

      {/* Buttons */}
      <div className="flex justify-end gap-4">
        <button
          type="submit"
          disabled={submitting || isPending || isWaiting}
          className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition text-sm font-medium disabled:opacity-60"
        >
          {submitting
            ? "Uploading..."
            : isPending || isWaiting
              ? "Minting NFT..."
              : "Submit & Mint NFT"}
        </button>
      </div>
    </form>
  );
}
