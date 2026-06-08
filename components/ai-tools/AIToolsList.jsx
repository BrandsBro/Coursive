"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";
import { aiTools, toolCategories } from "@/data/aiTools";

export default function AIToolsList() {
  const [activeCategory, setActiveCategory] = useState("New");

  const filtered = activeCategory === "New"
    ? aiTools.filter((t) => t.isNew)
    : aiTools.filter((t) => t.categories.includes(activeCategory));

  const displayTools = filtered.length > 0 ? filtered : aiTools;

  return (
    <div className="min-h-screen bg-white">

      {/* Header */}
      <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
        <div className="max-w-4xl mx-auto flex items-center px-6 h-14">
          <Link href="/courses" className="p-2 hover:bg-gray-100 rounded-xl transition-colors mr-4">
            <ChevronLeft size={20} className="text-gray-700" />
          </Link>
          <h1 className="flex-1 text-center font-bold text-gray-900 text-base pr-10">
            Explore AI tools
          </h1>
        </div>
      </div>

      {/* Category Filter — centered + wraps */}
      <div className="max-w-4xl mx-auto px-6 pt-6">
        <div className="flex flex-wrap justify-center gap-2 pb-2">
          {toolCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all border ${
                activeCategory === cat
                  ? "bg-gray-900 text-white border-gray-900"
                  : "bg-white text-gray-600 border-gray-200 hover:border-gray-400"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Tools Grid */}
      <div className="max-w-4xl mx-auto px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {displayTools.map((tool) => (
            <Link key={tool.id} href={`/courses/${tool.id}`}>
              <div className="bg-white border border-gray-100 rounded-2xl p-4 hover:shadow-md transition-all duration-200 cursor-pointer">
                <div className="flex items-start gap-4">
                  <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${tool.gradient} flex items-center justify-center text-2xl shrink-0`}>
                    {tool.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-gray-900 text-base leading-tight">
                      {tool.title}
                    </h3>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {tool.lessons} lessons • {tool.hours} hours
                    </p>
                    <div className="w-full bg-gray-100 rounded-full h-1 mt-2 mb-2">
                      <div
                        className="bg-primary h-1 rounded-full transition-all"
                        style={{ width: `${tool.progress}%` }}
                      />
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {tool.tags.map((tag) => (
                        <span
                          key={tag}
                          className="text-xs text-gray-500 bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-full"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

    </div>
  );
}
