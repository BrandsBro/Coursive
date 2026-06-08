import Link from "next/link";
import { Clock, BookOpen, BarChart2 } from "lucide-react";

export default function CourseCard({ course }) {
  return (
    <Link href={`/courses/${course.id}`}>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-card hover:shadow-card-hover transition-all duration-200 overflow-hidden cursor-pointer group h-full">

        {/* Thumbnail */}
        <div className={`h-36 bg-gradient-to-br ${course.gradient} flex items-center justify-center text-5xl group-hover:scale-105 transition-transform duration-300`}>
          {course.emoji}
        </div>

        {/* Content */}
        <div className="p-4">
          <div className="flex items-start justify-between gap-2 mb-2">
            <h3 className="font-bold text-gray-900 text-base leading-tight">
              {course.title}
            </h3>
            <span className="shrink-0 text-xs font-semibold text-primary bg-primary-light px-2 py-0.5 rounded-lg">
              {course.level}
            </span>
          </div>

          <p className="text-sm text-gray-500 mb-3 line-clamp-2">
            {course.description}
          </p>

          {/* Meta */}
          <div className="flex items-center gap-3 text-xs text-gray-400 mb-3">
            <span className="flex items-center gap-1">
              <BookOpen size={12} />
              {course.lessons} lessons
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              {course.hours}h
            </span>
            <span className="flex items-center gap-1">
              <BarChart2 size={12} />
              {course.category}
            </span>
          </div>

          {/* Progress */}
          <div>
            <div className="flex justify-between items-center mb-1">
              <span className="text-xs text-gray-400">Progress</span>
              <span className="text-xs font-semibold text-primary">{course.progress}%</span>
            </div>
            <div className="w-full bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-primary h-1.5 rounded-full transition-all duration-500"
                style={{ width: `${course.progress}%` }}
              />
            </div>
          </div>
        </div>

      </div>
    </Link>
  );
}
