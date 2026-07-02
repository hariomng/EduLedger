"use client";
import Link from "next/link";

export default function TopCreators() {
	const creators = [
		{ name: "Ova Hawkins", rank: 1 },
		{ name: "Jacob Jones", rank: 2 },
		{ name: "Jenny Wilson", rank: 3 },
		{ name: "Floyd Miles", rank: 4 },
		{ name: "Arlene McCoy", rank: 5 },
	];

	return (
		<div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
			<div className="flex justify-between mb-4">
				<h3 className="font-bold">Top Creators</h3>
				<button className="text-blue-600 hover:underline text-sm">
					See All
				</button>
			</div>
			<div className="space-y-3">
				{creators.map((c, i) => (
					<Link
						key={i}
						href={`/creator/${c.name.toLowerCase().replace(" ", "-")}`}
						className="flex justify-between items-center hover:bg-gray-50 p-2 rounded-md transition"
					>
						<div className="flex items-center gap-3">
							<div className="w-10 h-10 bg-gray-200 rounded-full" />
							<span className="text-sm font-medium">{c.name}</span>
						</div>
						<span
							className={`px-3 py-1 text-xs rounded-full font-semibold ${
								i === 0 ? "bg-blue-600 text-white" : "bg-gray-100 text-gray-700"
							}`}
						>
							#{c.rank}
						</span>
					</Link>
				))}
			</div>
		</div>
	);
}
