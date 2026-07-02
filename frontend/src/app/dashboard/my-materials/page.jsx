"use client";

import { useEffect, useState, useMemo } from "react";
import { useAccount, useReadContract, useReadContracts } from "wagmi";
import { abi } from "../../../../contracts/EduLedgerAbi";
import { celoSepolia } from "wagmi/chains";

const contractAddress = process.env.NEXT_PUBLIC_CONTRACT_ADDRESS;

export default function MyMaterialsPage() {
  const { address } = useAccount();
  const [nfts, setNfts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // 1️⃣ Fetch all token IDs owned by this wallet
  const {
    data: tokenIdsData,
    isLoading: tokensLoading,
    isError: tokensError,
  } = useReadContract({
    address: contractAddress,
    abi,
    functionName: "tokensOfOwner",
    args: [address ?? "0x0000000000000000000000000000000000000000"],
    chain: celoSepolia,
    enabled: Boolean(address),
  });

  // Normalize token IDs to strings
  const tokenIds = useMemo(() => {
    if (!tokenIdsData || tokenIdsData.length === 0) return [];
    return tokenIdsData.map((id) => id.toString());
  }, [tokenIdsData]);

  // 2️⃣ Fetch tokenURI for each token ID
  const tokenUriCalls = useMemo(() => {
    if (!tokenIds || tokenIds.length === 0) return [];
    return tokenIds.map((id) => ({
      address: contractAddress,
      abi,
      functionName: "tokenURI",
      args: [id],
      chain: celoSepolia,
    }));
  }, [tokenIds]);

  const {
    data: tokenUriResults,
    isLoading: uriLoading,
    isError: uriError,
  } = useReadContracts({
    contracts: tokenUriCalls,
    enabled: tokenUriCalls.length > 0,
  });

  // 3️⃣ Fetch metadata JSON for each valid HTTPS URI
  useEffect(() => {
    if (!address || !tokenUriResults || tokenUriResults.length === 0) return;
    let mounted = true;

    const fetchMetadata = async () => {
      setLoading(true);
      setError(null);
      try {
        const fetched = await Promise.all(
          tokenUriResults.map(async (entry, idx) => {
            if (!entry || entry.status !== "success") return null;

            const uri = Array.isArray(entry.result)
              ? entry.result[0]
              : entry.result;

            // only accept https:// URIs
            if (!uri || !uri.startsWith("https://")) return null;
            const url = uri;

            try {
              const res = await fetch(`/api/fetch?url=${encodeURIComponent(url)}`, { credentials: 'include' });
              if (!res.ok) throw new Error(`Failed to fetch ${url}`);
              const json = await res.json();

              // filter only valid https:// URLs for file and image
              const image =
                json.image?.startsWith("https://") ? json.image : null;
              const fileUrl =
                json.file?.startsWith("https://")
                  ? json.file
                  : json.animation_url?.startsWith("https://")
                    ? json.animation_url
                    : null;

              return {
                name: json.name || "Untitled NFT",
                description: json.description || "",
                price: json.price || "0",
                visibility: json.visibility || "private",
                image,
                fileUrl,
                timestamp: json.timestamp,
              };
            } catch (err) {
              console.error("Metadata fetch failed:", err);
              return null;
            }
          })
        );
        if (mounted) {
          // filter out duplicate tokenIds
          const unique = fetched
            .filter(Boolean)
            .filter(
              (nft, index, self) =>
                index === self.findIndex((t) => t.name === nft.name && t.fileUrl === nft.fileUrl)
            );
          setNfts(unique);
        }
      } catch (err) {
        console.error(err);
        setError("Failed to fetch NFT metadata");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchMetadata();
    return () => {
      mounted = false;
    };
  }, [tokenUriResults, address, tokenIds]);

  const formatDate = (timestamp) => {
    if (!timestamp) return "Unknown";
    const date = new Date(timestamp);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "2-digit",
    });
  };


  // 🧩 UI States
  if (!address)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-sm">
          Connect your wallet to view your minted NFTs.
        </p>
      </div>
    );

  if (tokensLoading || uriLoading || loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600 text-sm">Loading your materials...</p>
      </div>
    );

  if (tokensError || uriError || error)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-red-600 text-sm">{error || "Error loading NFTs."}</p>
      </div>
    );

  // 🖼️ NFT Grid
  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <div className="max-w-6xl mx-auto py-10 px-6">
        <h1 className="text-2xl font-bold mb-6">My Minted NFTs</h1>

        {(!nfts || nfts.length === 0) ? (
          <p className="text-sm text-gray-600">No NFTs found for this wallet.</p>
        ) : (
          <ul className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {nfts.map((nft, index) => (
              <li
                key={index}
                className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all"
              >
                {nft.image && (
                  <img
                    src={nft.image}
                    alt={nft.name}
                    className="w-full h-44 object-cover rounded-lg mb-4"
                  />
                )}
                <h3 className="text-lg font-semibold mb-1">{nft.name}</h3>
                {nft.description && (
                  <p className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {nft.description}
                  </p>
                )}
                <div className="space-y-1 text-sm">
                  <p>
                    <span className="font-medium text-gray-700">Price:</span>{" "}
                    <span className="text-gray-800">
                      ₦{nft.price}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">
                      Visibility:
                    </span>{" "}
                    <span className="capitalize text-gray-800">
                      {nft.visibility}
                    </span>
                  </p>
                  <p>
                    <span className="font-medium text-gray-700">
                      Date Minted:
                    </span>{" "}
                    <span className="text-gray-800">
                      {formatDate(nft.timestamp)}
                    </span>
                  </p>
                </div>

                {nft.fileUrl && (
                  <div className="mt-4">
                    <a
                      href={nft.fileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-block w-full text-center bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-lg font-medium transition-all"
                    >
                      View File
                    </a>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}