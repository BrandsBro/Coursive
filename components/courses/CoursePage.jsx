"use client";
import CourseReviews from "@/components/courses/CourseReviews";
import StarRating from "@/components/courses/StarRating";

import Link from "next/link";
import { useState } from "react";
import { ChevronLeft, ChevronDown, CheckCircle2, Menu, Award } from "lucide-react";
import CourseRoadmap from "@/components/courses/CourseRoadmap";
import CertificateModal from "@/components/courses/CertificateModal";
import { useProgress } from "@/hooks/useProgress";

export default function CoursePage({ course, allCourses }) {
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [showCertificate, setShowCertificate] = useState(false);
  const { getCompletedLessons, getCoursePercent, hasCertificate } = useProgress();

  const totalLessons = course.units.flatMap(u => u.lessons).length;
  const completedLessons = getCompletedLessons(course.id);
  const progressPercent = getCoursePercent(course.id, totalLessons);
  const earned = hasCertificate(course.id);

  return (
    <div className="min-h-screen bg-[#F5F5F5]">

      {/* Top Nav */}
      <div className="sticky top-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-5xl mx-auto flex items-center justify-between px-6 h-14">
          <Link href="/courses" className="p-2 hover:bg-gray-100 rounded-xl transition-colors">
            <ChevronLeft size={20} className="text-gray-700" />
          </Link>

          <button
            onClick={() => setShowSwitcher(!showSwitcher)}
            className="flex items-center gap-1.5 font-semibold text-gray-900 text-sm hover:text-primary transition-colors"
          >
            {course.title}
            <ChevronDown size={14} className={`transition-transform duration-200 ${showSwitcher ? "rotate-180" : ""}`} />
          </button>

          {earned ? (
            <button
              onClick={() => setShowCertificate(true)}
              className="flex items-center gap-1.5 bg-amber-50 px-3 py-1.5 rounded-full hover:bg-amber-100 transition-all"
            >
              <Award size={14} className="text-amber-500" />
              <span className="text-xs font-bold text-amber-600">Certified!</span>
            </button>
          ) : (
            <div className="flex items-center gap-1.5 bg-gray-100 px-3 py-1.5 rounded-full">
              <CheckCircle2 size={14} className="text-primary" />
              <span className="text-xs font-bold text-gray-700">{progressPercent}%</span>
            </div>
          )}
        </div>
      </div>

      {/* Course Switcher */}
      {showSwitcher && (
        <div className="bg-white border-b border-gray-100 shadow-sm">
          <div className="flex justify-center gap-5 px-6 py-4 overflow-x-auto">
            {allCourses.map((c) => {
              const cTotal = c.units.flatMap(u => u.lessons).length;
              const cPct = getCoursePercent(c.id, cTotal);
              return (
                <Link key={c.id} href={`/courses/${c.id}`}
                  onClick={() => setShowSwitcher(false)}
                  className="flex flex-col items-center gap-1.5 shrink-0"
                >
                  <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${c.gradient} flex items-center justify-center text-xl transition-all ${
                    c.id === course.id ? "ring-2 ring-primary ring-offset-1 scale-105" : "opacity-60 hover:opacity-90"
                  }`}>
                    {c.emoji}
                  </div>
                  <span className={`text-xs font-medium text-center leading-tight w-16 ${c.id === course.id ? "text-gray-900" : "text-gray-500"}`}>
                    {c.title}
                  </span>
                  <span className={`text-xs font-bold ${c.id === course.id ? "text-primary" : "text-gray-400"}`}>
                    {cPct}%
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* Unit Header */}
      {course.units.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 pt-5">
          <div className="bg-white rounded-2xl border border-gray-100 shadow-card flex items-stretch">
            <div className="flex items-center gap-4 p-4 flex-1 min-w-0">
              <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${course.gradient} flex items-center justify-center text-2xl shrink-0`}>
                {course.emoji}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-bold text-primary uppercase tracking-wider mb-0.5">Unit 1</p>
                <h2 className="font-bold text-gray-900 text-base leading-snug">{course.units[0]?.title}</h2>
              </div>
            </div>
            <Link href="/courses"
              className="border-l border-gray-100 flex items-center justify-center px-5 shrink-0 hover:bg-gray-50 transition-colors rounded-r-2xl">
              <Menu size={18} className="text-gray-400" />
            </Link>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-6 py-6">
        <CourseRoadmap
          course={course}
          completedLessons={completedLessons}
          onViewCertificate={() => setShowCertificate(true)}
        />
      </div>

      {showCertificate && (
        <CertificateModal
          course={course}
          onClose={() => setShowCertificate(false)}
        />
      )}
      {/* Reviews */}
      <div style={{ borderTop:"1px solid #F1F5F9", marginTop:40, paddingTop:40 }}>
        <div className="max-w-5xl mx-auto px-6">
          <h2 style={{ fontSize:22, fontWeight:900, color:"#0f172a", margin:"0 0 24px" }}>Student Reviews</h2>
          <CourseReviews courseId={course.id} courseName={course.title}/>
        </div>
      </div>
    </div>
  );
}