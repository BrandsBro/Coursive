"use client";

import Link from "next/link";
import { BookOpen, Headphones, X } from "lucide-react";

export default function LessonPopup({ lesson, courseId, onClose }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-200 shadow-xl p-4">
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <h3 className="font-bold text-gray-900 text-sm">{lesson.title}</h3>
          <p className="text-xs text-gray-500 mt-0.5">
            What can you learn from this lesson?
          </p>
        </div>
        <button
          onClick={onClose}
          className="w-6 h-6 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition-colors shrink-0"
        >
          <X size={12} className="text-gray-500" />
        </button>
      </div>

      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href={`/courses/${courseId}/lessons/${lesson.id}?mode=read`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl border border-gray-200 text-xs font-semibold text-gray-700 hover:border-primary hover:text-primary transition-all"
        >
          <BookOpen size={13} />
          Read
        </Link>
        <Link
          href={`/courses/${courseId}/lessons/${lesson.id}?mode=listen`}
          className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-dark transition-all"
        >
          <Headphones size={13} />
          Listen
        </Link>
      </div>
    </div>
  );
}
