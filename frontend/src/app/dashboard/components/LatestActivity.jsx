"use client";
import Link from "next/link";

export default function LatestActivity() {
  const activities = [
    { id: 1, action: "Bought BICH 324 – Development Economics Notes", time: "3d ago" },
    { id: 2, action: "Earned NFDN from 2 user downloads", time: "3d ago" },
    { id: 3, action: "Downloaded “MTH 201 Pre Questions”", time: "3d ago" },
  ];

  return (
    <div className="p-6 bg-white border border-gray-200 rounded-xl shadow-sm">
      <div className="flex justify-between mb-4">
        <h3 className="font-bold">Your Latest Activity</h3>
        <button className="text-blue-600 hover:underline text-sm">See All</button>
      </div>
      <div className="space-y-4">
        {activities.map((a) => (
          <Link
            key={a.id}
            href={`/activity/${a.id}`}
            className="flex gap-3 items-start hover:bg-gray-50 p-2 rounded-md transition"
          >
            <div className="w-10 h-10 bg-gray-200 rounded-full flex-shrink-0"></div>
            <div>
              <p className="text-sm mb-1">{a.action}</p>
              <span className="text-xs text-gray-500">{a.time}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

