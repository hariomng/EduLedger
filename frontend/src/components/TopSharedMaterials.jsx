"use client";

import Image from "next/image";
import { motion } from "framer-motion";
import { FaCrown } from "react-icons/fa";
import { useState, useEffect } from "react";
import apiFetch from "@/utils/apiClient";

export default function TopSharedMaterials() {
	const [sharedMaterials, setSharedMaterials] = useState([]);
	const [featuredMaterial, setFeaturedMaterial] = useState(null);
	const [topAuthors, setTopAuthors] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState(null);

	useEffect(() => {
		const fetchTopSharedMaterials = async () => {
			try {
				const response = await apiFetch('/api/materials?top-shared=true');
				if (!response.ok) {
					throw new Error('Failed to fetch top shared materials');
				}
				const data = await response.json();
				setSharedMaterials(data.items || []);
				setFeaturedMaterial(data.featured || null);
			} catch (err) {
				console.error('Error fetching top shared materials:', err);
				setError(err.message);
			} finally {
				setLoading(false);
			}
		};

		const fetchTopAuthors = async () => {
			try {
					const response = await apiFetch('/api/top-authors');
				if (!response.ok) {
					throw new Error('Failed to fetch top authors');
				}
				const data = await response.json();
				setTopAuthors(data.authors || []);
			} catch (err) {
				console.error('Error fetching top authors:', err);
			}
		};

		fetchTopSharedMaterials();
		fetchTopAuthors();
	}, []);

	const fadeUp = {
		hidden: { opacity: 0, y: 40 },
		show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
	};

	return (
		<section className="relative py-20 px-6 md:px-20 overflow-hidden">
			{/* 🔹 Background Layer */}
			<div className="absolute inset-0 bg-gradient-to-tr from-yellow-50 via-transparent to-blue-50" />
			<div
				className="absolute inset-0 bg-[linear-gradient(to_right,rgba(0,0,0,0.04)_1px,transparent_1px),linear-gradient(to_bottom,rgba(0,0,0,0.04)_1px,transparent_1px)]
        bg-[size:40px_40px] opacity-30 pointer-events-none"
			/>

			{/* Header */}
			<motion.div
				initial="hidden"
				whileInView="show"
				viewport={{ once: true }}
				variants={fadeUp}
				className="relative flex flex-col md:flex-row md:items-center md:justify-between mb-12 text-center md:text-left z-10"
			>
				<div>
					<h2 className="text-3xl font-bold text-gray-900 mb-2">
						Top Shared Study Materials
					</h2>
					<p className="text-gray-600 text-sm">
						Discover what’s trending in the EduLedger community this week.
					</p>
				</div>
				<a href="/marketplace">
					<button className="mt-6 md:mt-0 text-sm font-medium text-blue-600 hover:text-blue-800 transition-all">
						View All Documents →
					</button>
				</a>
			</motion.div>

			{/* Grid Layout */}
			<div className="relative grid grid-cols-1 md:grid-cols-3 gap-10 z-10 items-start">
				{/* Left — Featured Material */}
				<motion.div
					initial="hidden"
					whileInView="show"
					viewport={{ once: true }}
					variants={fadeUp}
					className="relative h-[340px] rounded-2xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-sm hover:shadow-lg overflow-hidden transition-all duration-300"
				>
                    <Image
                        src={featuredMaterial?.image || "/images/demo1.png"}
                        alt={`${featuredMaterial?.title || "Featured Material"} Preview`}
                        fill
                        className="object-cover"
                    />
					<div className="absolute bottom-0 w-full bg-white/95 backdrop-blur-md border-t border-gray-200 p-5 flex justify-between items-center">
						<div>
							<h3 className="text-sm font-semibold text-gray-800">
								{featuredMaterial?.title}
							</h3>
							<p className="text-xs text-gray-500">
								by{" "}
								<span className="font-medium text-gray-700">
									{featuredMaterial?.author}
								</span>
							</p>
						</div>
						<div className="flex items-center gap-1">
							<Image
								src="/celo.png"
								alt="CELO"
								width={18}
								height={18}
								className="rounded-full"
							/>
							<span className="text-xs font-semibold text-gray-700">
								{featuredMaterial?.price}
							</span>
						</div>
					</div>
				</motion.div>

				{/* Middle — Shared Materials */}
				<motion.div
					initial="hidden"
					whileInView="show"
					viewport={{ once: true }}
					variants={fadeUp}
					className="flex flex-col space-y-5"
				>
					{loading ? (
						// Loading skeleton
						Array.from({ length: 3 }).map((_, i) => (
							<div key={i} className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-4 shadow-sm animate-pulse">
								<div className="flex items-center gap-3">
									<div className="w-14 h-14 bg-gray-200 rounded-lg"></div>
									<div>
										<div className="h-4 bg-gray-200 rounded w-32 mb-2"></div>
										<div className="h-3 bg-gray-200 rounded w-20"></div>
									</div>
								</div>
								<div className="h-8 bg-gray-200 rounded-full w-20"></div>
							</div>
						))
					) : (
						sharedMaterials.slice(0, 3).map((material, i) => (
							<motion.div
								key={material.id || i}
								whileHover={{
									scale: 1.02,
									boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
								}}
								className="flex items-center justify-between bg-white border border-gray-100 rounded-2xl p-4 shadow-sm transition-all duration-200"
							>
								<div className="flex items-center gap-3">
									<div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center text-gray-400 text-lg">
										📘
									</div>
									<div>
										<h3 className="text-sm font-semibold text-gray-800 truncate max-w-[180px]">
											{material.title}
										</h3>
										<div className="flex items-center gap-2 mt-1">
											<Image
												src="/celo.png"
												alt="CELO"
												width={14}
												height={14}
											/>
											<span className="text-xs font-medium text-gray-600">
												{material.price}
											</span>
										</div>
									</div>
								</div>
								<a href={`/marketplace/${material.id}`}>
									<button className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold py-2 px-5 rounded-full shadow-md transition-all duration-200">
										Get This!
									</button>
								</a>
							</motion.div>
						))
					)}
				</motion.div>

				{/* Right — Top Authors */}
				<motion.div
					initial="hidden"
					whileInView="show"
					viewport={{ once: true }}
					variants={fadeUp}
					className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6"
				>
					<div className="flex items-center gap-2 mb-4">
						<FaCrown className="text-yellow-400 animate-bounce-slow" />
						<h3 className="text-lg font-semibold text-gray-900">
							Top Authors For The Month
						</h3>
					</div>
					<p className="text-xs text-gray-500 mb-6">
						Last <span className="text-orange-500 font-medium">7 days</span>
					</p>
					<div className="space-y-3">
						{(topAuthors).map((author) => (
							<motion.div
								key={author.rank}
								whileHover={{
									scale: 1.02,
									backgroundColor: "#f9fafb",
								}}
								className="flex justify-between items-center bg-white border border-gray-100 shadow-sm rounded-xl p-3 transition-all"
							>
								<div className="flex items-center gap-3">
									<div
										className={`w-8 h-8 rounded-full flex items-center justify-center font-semibold text-sm text-gray-800 ${
											author.rank === 1
												? "bg-yellow-100 border border-yellow-300"
												: "bg-gray-100"
										}`}
									>
										{author.rank}
									</div>
									<div>
										<h4 className="text-sm font-semibold text-gray-800">
											{author.name}
										</h4>
										<p className="text-xs text-gray-500">{author.price}</p>
									</div>
								</div>
								<span className={`text-xs font-semibold ${author.color}`}>
									{author.change}
								</span>
							</motion.div>
						))}
					</div>
				</motion.div>
			</div>
		</section>
	);
}
