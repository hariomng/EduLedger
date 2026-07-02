"use client";

import { useState } from "react";
import { FaSearch } from "react-icons/fa";
import { FiUpload } from "react-icons/fi";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

export default function DashboardHeader() {
	const [activeTab, setActiveTab] = useState("User");

	return (
		<header className="bg-[#fafafa] border-b border-gray-200 px-8 py-4 flex items-center justify-between sticky top-0 z-40 backdrop-blur-md">
			{/* Search Bar */}
			<motion.div
				initial={{ opacity: 0, y: -10 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ duration: 0.4 }}
				className="flex-1 max-w-xl relative"
			>
				<FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
				<input
					type="text"
					placeholder="Search Item, Collection and Account..."
					className="w-full pl-10 pr-4 py-3 bg-white text-sm border border-gray-200 rounded-full shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
				/>
			</motion.div>

			{/* Right Section */}
			<div className="flex items-center gap-6 ml-6">
				{/* User/Creator Toggle */}
				<div className="flex items-center bg-white border border-gray-200 rounded-full p-1 shadow-sm">
					<button
						onClick={() => setActiveTab("User")}
						className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
							activeTab === "User"
								? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
								: "text-gray-600 hover:text-gray-900"
						}`}
					>
						User
					</button>
					<button
						onClick={() => setActiveTab("Creator")}
						className={`px-4 py-1.5 text-sm font-medium rounded-full transition-all ${
							activeTab === "Creator"
								? "bg-gradient-to-r from-blue-500 to-purple-500 text-white shadow-md"
								: "text-gray-600 hover:text-gray-900"
						}`}
					>
						Creator
					</button>
				</div>

				{/* Upload Button (Icon Only) */}
				<Link
					href="/dashboard/upload"
					className="w-10 h-10 flex items-center justify-center rounded-full bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300 text-gray-600 hover:text-blue-600 shadow-sm transition-all duration-300"
					title="Upload Material"
				>
					<FiUpload size={18} />
				</Link>

				{/* Profile Avatar */}
				<div className="w-10 h-10 rounded-full overflow-hidden border border-gray-300 shadow-sm">
					<Image
						src="/images/profile.png"
						alt="Profile"
						width={40}
						height={40}
						className="object-cover w-full h-full"
					/>
				</div>
			</div>
		</header>
	);
}
