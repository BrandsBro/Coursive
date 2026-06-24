# Coursiv Project Handoff

Full-stack Next.js 16 App Router (JSX) + Supabase e-learning platform, 'Duolingo for AI tools'.
Repo: BrandsBro/Coursive | Live: coursiv-six.vercel.app

## PROJECT STRUCTURE
```
./app/(admin)/admin/analytics/page.jsx
./app/(admin)/admin/builder/[lessonId]/page.jsx
./app/(admin)/admin/challenges/[id]/page.jsx
./app/(admin)/admin/challenges/page.jsx
./app/(admin)/admin/courses/[id]/page.jsx
./app/(admin)/admin/courses/page.jsx
./app/(admin)/admin/media/page.jsx
./app/(admin)/admin/page.jsx
./app/(admin)/admin/reviews/page.jsx
./app/(admin)/admin/settings/page.jsx
./app/(admin)/admin/users/page.jsx
./app/(admin)/layout.jsx
./app/(auth)/confirm/page.jsx
./app/(auth)/layout.jsx
./app/(auth)/login/page.jsx
./app/(auth)/signup/page.jsx
./app/(course)/challenges/[challengeId]/day/[day]/page.jsx
./app/(course)/challenges/[challengeId]/page.jsx
./app/(course)/courses/[courseId]/lessons/[lessonId]/page.jsx
./app/(course)/courses/[courseId]/page.jsx
./app/(course)/layout.jsx
./app/(main)/challenges/page.jsx
./app/(main)/courses/page.jsx
./app/(main)/layout.jsx
./app/(main)/page.jsx
./app/(main)/profile/page.jsx
./app/api/admin/reviews/route.js
./app/auth/callback/route.js
./app/error.jsx
./app/global-error.jsx
./app/layout.jsx
./app/not-found.jsx
./app/robots.js
./components/admin/AdminAnalytics.jsx
./components/admin/AdminChallengeDetail.jsx
./components/admin/AdminChallenges.jsx
./components/admin/AdminCourseDetail.jsx
./components/admin/AdminCourses.jsx
./components/admin/AdminDashboard.jsx
./components/admin/AdminLayout.jsx
./components/admin/AdminMedia.jsx
./components/admin/AdminReviews.jsx
./components/admin/AdminSettings.jsx
./components/admin/AdminUsers.jsx
./components/admin/LessonContentEditor.jsx
./components/admin/builder/LessonBuilder.jsx
./components/admin/builder/MediaLibrary.jsx
./components/admin/builder/blocks.jsx
./components/ai-tools/AIToolsList.jsx
./components/auth/AuthPage.jsx
./components/challenges/ChallengeLeaderboard.jsx
./components/challenges/ChallengePage.jsx
./components/challenges/ChallengeReviews.jsx
./components/challenges/ChallengesList.jsx
./components/courses/CertificateGenerator.jsx
./components/courses/CertificateModal.jsx
./components/courses/CourseCard.jsx
./components/courses/CoursePage.jsx
./components/courses/CourseReviews.jsx
./components/courses/CourseRoadmap.jsx
./components/courses/CoursesList.jsx
./components/courses/LessonPage.jsx
./components/courses/LessonPopup.jsx
./components/courses/ListenMode.jsx
./components/courses/StarRating.jsx
./components/home/BrowseCourses.jsx
./components/home/CertificateBanner.jsx
./components/home/ChallengesSection.jsx
./components/home/CurrentCourseWidget.jsx
./components/home/WeeklyStreaks.jsx
./components/layout/Navbar.jsx
./components/layout/NotificationBell.jsx
./components/layout/SearchModal.jsx
./components/onboarding/OnboardingFlow.jsx
./components/onboarding/OnboardingWrapper.jsx
./components/profile/AvatarUpload.jsx
./components/profile/ProfilePage.jsx
./data/aiTools.js
./data/challenges.js
./data/courses.js
./data/lessonContent.js
./fix_console.js
./hooks/useNotifications.js
./hooks/useProgress.js
./hooks/useStreak.js
./hooks/useTextToSpeech.js
./lib/AuthContext.jsx
./lib/constants.js
./lib/db.js
./lib/getlessonContent.js
./lib/supabase.js
./lib/supabaseServer.js
./lib/utils.js
./middleware.js
./next.config.js
./postcss.config.js
./seed.js
```

## KEY FILE CONTENTS

### `lib/db.js`
```jsx
import { getSupabaseServer } from "@/lib/supabaseServer";
const supabase = getSupabaseServer();

// ── COURSES ──

export async function getCourseRatings() {
  const { data } = await supabase
    .from("course_reviews")
    .select("course_id, rating");
  const map = {};
  (data || []).forEach(r => {
    if (!map[r.course_id]) map[r.course_id] = { total:0, sum:0 };
    map[r.course_id].total++;
    map[r.course_id].sum += r.rating;
  });
  return map;
}

export async function getAllCourses() {
  const { data: courses, error } = await supabase
    .from("courses")
    .select("*")
    .eq("is_published", true)
    .order("order_index");

  if (error || !courses) return [];

  // Fetch units + lessons for each course
  const full = await Promise.all(
    courses.map(async (course) => {
      const units = await getUnitsForCourse(course.id);
      return formatCourse(course, units);
    })
  );

  return full;
}

export async function getCourseById(courseId) {
  const { data: course, error } = await supabase
    .from("courses")
    .select("*")
    .eq("id", courseId)
    .single();

  if (error || !course) return null;

  const units = await getUnitsForCourse(courseId);
  return formatCourse(course, units);
}

async function getUnitsForCourse(courseId) {
  const { data: units } = await supabase
    .from("course_units")
    .select("*")
    .eq("course_id", courseId)
    .order("order_index");

  if (!units) return [];

  const unitsWithLessons = await Promise.all(
    units.map(async (unit) => {
      const { data: lessons } = await supabase
        .from("lessons")
        .select("*")
        .eq("unit_id", unit.id)
        .order("order_index");

      return {
        id: unit.id,
        title: unit.title,
        lessons: (lessons || []).map(formatLesson),
      };
    })
  );

  return unitsWithLessons;
}

function formatCourse(course, units) {
  return {
    id: course.id,
    title: course.title,
    description: course.description,
    emoji: course.emoji,
    imageUrl: course.image_url || null,
    gradient: `from-[${course.gradient_from}] to-[${course.gradient_to}]`,
    gradientFrom: course.gradient_from,
    gradientTo: course.gradient_to,
    hours: course.hours,
    level: course.level,
    category: course.category,
    units: units || [],
    // computed
    lessons: units?.reduce((sum, u) => sum + (u.lessons?.length || 0), 0) || 0,
  };
}

function formatLesson(lesson) {
  return {
    id: lesson.id,
    title: lesson.title,
    type: lesson.type,
    duration: lesson.duration,
  };
}

// ── CHALLENGES ──

export async function getAllChallenges() {
  const { data: challenges, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("is_published", true)
    .order("order_index");

  if (error || !challenges) return [];

  const full = await Promise.all(
    challenges.map(async (ch) => {
      const [days, reviews] = await Promise.all([
        getChallengedays(ch.id),
        getChallengeReviews(ch.id),
      ]);
      return formatChallenge(ch, days, reviews);
    })
  );

  return full;
}

export async function getChallengeById(challengeId) {
  const { data: challenge, error } = await supabase
    .from("challenges")
    .select("*")
    .eq("id", challengeId)
    .single();

  if (error || !challenge) return null;

  const [days, reviews] = await Promise.all([
    getChallengedays(challengeId),
    getChallengeReviews(challengeId),
  ]);

  return formatChallenge(challenge, days, reviews);
}

async function getChallengedays(challengeId) {
  const { data } = await supabase
    .from("challenge_days")
    .select("*")
    .eq("challenge_id", challengeId)
    .order("day_number");

  return (data || []).map(d => ({
    day: d.day_number,
    topic: d.topic,
    emoji: d.emoji,
    courseId: d.course_id,
    lessonId: d.lesson_id,
  }));
}

async function getChallengeReviews(challengeId) {
  const { data } = await supabase
    .from("challenge_reviews")
    .select("*")
    .eq("challenge_id", challengeId)
    .order("order_index");

  return (data || []).map(r => ({
    name: r.reviewer_name,
    text: r.review_text,
    stars: r.stars,
  }));
}

function formatChallenge(ch, days, reviews) {
  return {
    id: ch.id,
    title: ch.title,
    subtitle: ch.subtitle,
    description: ch.description,
    emoji: ch.emoji,
    imageUrl: ch.image_url || null,
    gradientBg: ch.gradient_bg,
    days: ch.days,
    level: ch.level,
    challengeDays: days,
    reviews: reviews,
  };
}
```

### `lib/supabase.js`
```jsx
import { createBrowserClient } from "@supabase/ssr";

export const supabase = createBrowserClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);
```

### `lib/supabaseServer.js`
```jsx
import { createClient } from "@supabase/supabase-js";

export function getSupabaseServer() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );
}
```

### `lib/getlessonContent.js`
```jsx
import { getSupabaseServer } from "@/lib/supabaseServer";

export async function getLessonContentFromDB(lessonId) {
  const supabase = getSupabaseServer();
  const { data, error } = await supabase
    .from("lesson_content")
    .select("*")
    .eq("lesson_id", lessonId)
    .order("order_index");
  if (error) console.error("getLessonContent error:", error);
  if (!data || data.length === 0) return null;
  return data.map(block => ({
    id: block.id,
    type: block.type,
    content: block.content,
    order_index: block.order_index,
  }));
}
```

### `middleware.js`
```jsx
import { createServerClient } from "@supabase/ssr";
import { NextResponse } from "next/server";

const PUBLIC_ROUTES = ["/login", "/signup", "/confirm", "/auth"];
const ADMIN_ROUTES = ["/admin"];

export async function middleware(req) {
  let res = NextResponse.next({ request: { headers: req.headers } });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() { return req.cookies.getAll(); },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value));
          res = NextResponse.next({ request: { headers: req.headers } });
          cookiesToSet.forEach(({ name, value, options }) => res.cookies.set(name, value, options));
        },
      },
    }
  );

  const { data: { session } } = await supabase.auth.getSession();
  const { pathname } = req.nextUrl;

  const isPublic = PUBLIC_ROUTES.some(r => pathname.startsWith(r));
  const isAdmin = ADMIN_ROUTES.some(r => pathname.startsWith(r));

  // Not logged in → redirect to login
  if (!session && !isPublic) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("from", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Logged in but trying to access auth pages → go home
  if (session && isPublic) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  // Admin routes → check is_admin in profiles
  if (session && isAdmin) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", session.user.id)
      .maybeSingle();

    if (!profile?.is_admin) {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)"],
};
```

### `next.config.js`
```jsx
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "xisywmtqebmjrmgiedvi.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

module.exports = nextConfig;
```

### `components/courses/LessonPage.jsx`
```jsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Check, Trophy, Music } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";
import { useStreak } from "@/hooks/useStreak";
import { useNotifications } from "@/hooks/useNotifications";
import ListenMode from "@/components/courses/ListenMode";
import CertificateGenerator from "@/components/courses/CertificateGenerator";

export default function LessonPage({ course, lesson, content, mode, challengeId, challengeDay, firstJoin }) {
  const router = useRouter();
  const { markLessonComplete, getCompletedLessons, markChallengeDay } = useProgress();
  const { updateStreak } = useStreak();
  const { send: sendNotification } = useNotifications();

  const safeContent = Array.isArray(content) && content.length > 0 ? content : [];
  const hasContent = safeContent.length > 0;

  const [answers, setAnswers] = useState({});
  const [checked, setChecked] = useState({});
  const [fillInputs, setFillInputs] = useState({});
  const [fillChecked, setFillChecked] = useState({});
  const [fillShowAnswer, setFillShowAnswer] = useState({});
  const [completed, setCompleted] = useState(false);
  const [showComplete, setShowComplete] = useState(false);
  const [listenMode, setListenMode] = useState(false);
  const [showCert, setShowCert] = useState(false);

  const allLessons = (course?.units || []).flatMap(u => u.lessons || []);
  const currentIdx = allLessons.findIndex(l => l.id === lesson?.id);
  const nextLesson = allLessons[currentIdx + 1];
  const prevLesson = allLessons[currentIdx - 1];
  const isComplete = (getCompletedLessons(course?.id) || []).includes(lesson?.id);

  const handleComplete = async () => {
    await updateStreak();
    await markLessonComplete(course?.id, lesson?.id);
    if (challengeId && challengeDay) await markChallengeDay(challengeId, challengeDay);
    await sendNotification("lesson", "Lesson complete! 📚", 'You finished "' + (lesson?.title || "") + '"', "📚", "/courses/" + course?.id);
    const isLast = !allLessons[currentIdx + 1];
    if (isLast) {
      await sendNotification("certificate", "Certificate earned! 🏆", 'You completed "' + (course?.title || "") + '"', "🏆", "/profile");
      setTimeout(() => setShowCert(true), 2200);
    }
    setCompleted(true);
    setShowComplete(true);
  };

  const handleNext = () => {
    if (challengeId) {
      // Extract day number from lesson id: challenge_X_day_N
      const parts = lesson?.id?.split("_day_");
      const currentDay = parts ? parseInt(parts[parts.length - 1]) : 1;
      const nextDay = currentDay + 1;
      const totalDays = course?.units?.[0]?.lessons?.length || 0;
      if (nextDay <= totalDays) {
        router.push("/challenges/" + challengeId + "/day/" + nextDay);
      } else {
        router.push("/challenges/" + challengeId + "?joined=true");
      }
    } else if (nextLesson) {
      router.push("/courses/" + course.id + "/lessons/" + nextLesson.id + "?mode=" + mode);
    } else {
      router.push("/courses/" + course.id);
    }
  };

  return (
    <div style={{ minHeight:"100vh", background:"#F8FAFC" }}>

      {/* Top bar */}
      <div style={{ background:"#fff", borderBottom:"1px solid #F1F5F9", height:58, position:"sticky", top:0, zIndex:50 }}>
      <div style={{ maxWidth:720, margin:"0 auto", padding:"0 20px", height:"100%", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <Link href={challengeId ? "/challenges/"+challengeId : "/courses/"+(course?.id||"")} style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:6, color:"#64748B", fontSize:13, fontWeight:600 }}>
          <ChevronLeft size={16}/> {challengeId ? "Back to Challenge" : course?.title}
        </Link>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <span style={{ fontSize:12, color:"#94A3B8" }}>{lesson?.duration} min read</span>
          <button onClick={() => setListenMode(true)} style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff", color:"#0891b2", fontSize:12, fontWeight:700, cursor:"pointer" }}>
            🎧 Listen
          </button>
          {isComplete && (
            <span style={{ display:"flex", alignItems:"center", gap:4, background:"#F0FDF4", color:"#16A34A", fontSize:12, fontWeight:700, padding:"4px 10px", borderRadius:999 }}>
              <Check size={12}/> Complete
            </span>
          )}
        </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth:720, margin:"0 auto", padding:"32px 24px 80px" }}>
        <div style={{ marginBottom:32 }}>
          <p style={{ fontSize:11, fontWeight:700, color:"#94A3B8", letterSpacing:1, margin:"0 0 8px" }}>{(course?.title || "").toUpperCase()}</p>
          <h1 style={{ fontSize:30, fontWeight:900, color:"#0f172a", margin:"0 0 8px", lineHeight:1.2 }}>{lesson?.title}</h1>
          <div style={{ display:"flex", gap:12 }}>
            <span style={{ fontSize:12, color:"#94A3B8" }}>{lesson?.duration} min</span>
            <span style={{ fontSize:12, color:"#94A3B8" }}>·</span>
            <span style={{ fontSize:12, color:"#94A3B8", textTransform:"capitalize" }}>{lesson?.type || "lesson"}</span>
          </div>
        </div>

        <div style={{ display:"flex", flexDirection:"column", gap:24 }}>
          {!hasContent && (
            <div style={{ textAlign:"center", padding:"60px 20px", background:"#fff", borderRadius:24, border:"2px dashed #E2E8F0" }}>
              <div style={{ fontSize:48, marginBottom:16 }}>🚧</div>
              <h3 style={{ fontSize:18, fontWeight:800, color:"#0f172a", margin:"0 0 8px" }}>Content coming soon</h3>
              <p style={{ fontSize:14, color:"#94A3B8", margin:0 }}>This lesson is being built. Check back soon!</p>
            </div>
          )}
          {safeContent.map((block, idx) => (
            <ContentBlock key={block.id || idx} block={block} idx={idx}
              answers={answers} setAnswers={setAnswers}
              checked={checked} setChecked={setChecked}
              fillInputs={fillInputs} setFillInputs={setFillInputs}
              fillChecked={fillChecked} setFillChecked={setFillChecked}
              fillShowAnswer={fillShowAnswer} setFillShowAnswer={setFillShowAnswer}
            />
          ))}
        </div>

        {/* Bottom nav */}
        <div style={{ marginTop:48, paddingTop:32, borderTop:"1px solid #F1F5F9", display:"flex", gap:12, alignItems:"center", justifyContent:"space-between" }}>
          {prevLesson ? (
            <Link href={challengeId ? "/challenges/" + challengeId + "/day/" + (parseInt(lesson?.id?.split("_day_").pop()) - 1) : "/courses/" + course.id + "/lessons/" + prevLesson.id + "?mode=" + mode} style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:6, padding:"11px 18px", borderRadius:12, border:"1.5px solid #E2E8F0", background:"#fff", color:"#374151", fontSize:13, fontWeight:600 }}>
              <ChevronLeft size={15}/> Previous
            </Link>
          ) : <div/>}

          {!isComplete && !completed ? (
            hasContent ? (
              <button onClick={handleComplete} style={{ flex:1, maxWidth:280, padding:"13px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 14px rgba(124,58,237,0.4)" }}>
                ✓ Mark Complete
              </button>
            ) : (
              <button disabled style={{ flex:1, maxWidth:280, padding:"13px", borderRadius:14, border:"none", background:"#E2E8F0", color:"#94A3B8", fontSize:14, fontWeight:700, cursor:"not-allowed" }}>
                Content not ready yet
              </button>
            )
          ) : (
            <button onClick={handleNext} style={{ flex:1, maxWidth:280, padding:"13px", borderRadius:14, border:"none", background:"linear-gradient(135deg,#22c55e,#16a34a)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:7 }}>
              {nextLesson ? <><span>Next Lesson</span><ChevronRight size={15}/></> : <><Trophy size={15}/><span>Finish Course</span></>}
            </button>
          )}
        </div>
      </div>

      {/* Completion overlay */}
      {showComplete && (
        <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.6)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(4px)" }}>
          <div style={{ background:"#fff", borderRadius:28, padding:"40px 36px", textAlign:"center", maxWidth:380, width:"100%", boxShadow:"0 32px 80px rgba(0,0,0,0.3)" }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🎉</div>
            <h2 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:"0 0 8px" }}>Lesson Complete!</h2>
            <p style={{ fontSize:14, color:"#64748B", margin:"0 0 28px" }}>
              {nextLesson ? 'Up next: "' + nextLesson.title + '"' : "You've finished this course!"}
            </p>
            <div style={{ display:"flex", gap:10 }}>
              <button onClick={() => setShowComplete(false)} style={{ flex:1, padding:"12px", borderRadius:12, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>
                Stay here
              </button>
              <button onClick={() => { setShowComplete(false); handleNext(); }} style={{ flex:2, padding:"12px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                {nextLesson ? "Next lesson →" : "Back to course"}
              </button>
            </div>
          </div>
        </div>
      )}

      {listenMode && (
        <ListenMode lesson={lesson} content={safeContent} onClose={() => setListenMode(false)}/>
      )}

      {showCert && (
        <CertificateGenerator course={course} userName="" completedDate={new Date().toISOString()} onClose={() => setShowCert(false)}/>
      )}

    </div>
  );
}

function ContentBlock({ block, idx, answers, setAnswers, checked, setChecked, fillInputs, setFillInputs, fillChecked, setFillChecked, fillShowAnswer, setFillShowAnswer }) {
  const c = block.content || block;

  switch (block.type) {
    case "heading": {
      const sz = c.level==="h1"?28:c.level==="h2"?22:18;
      return <div style={{ fontSize:sz, fontWeight:900, color:"#0f172a", lineHeight:1.25 }}>{c.text}</div>;
    }
    case "text":
      return <p style={{ fontSize:15, lineHeight:1.8, color:"#374151", margin:0, whiteSpace:"pre-wrap" }}>{c.text}</p>;
    case "image":
      return c.src ? (
        <figure style={{ margin:0 }}>
          <img src={c.src} alt={c.alt||""} style={{ width:"100%", borderRadius:20, display:"block", boxShadow:"0 4px 20px rgba(0,0,0,0.08)" }}/>
          {c.caption && <figcaption style={{ textAlign:"center", fontSize:13, color:"#94A3B8", marginTop:10, fontStyle:"italic" }}>{c.caption}</figcaption>}
        </figure>
      ) : null;
    case "video": {
      const src = c.src || "";
      let ytId = null;
      if (src.includes("youtube.com") || src.includes("youtu.be")) {
        const m = src.split("v=")[1] || src.split("youtu.be/")[1];
        ytId = m ? m.split("&")[0].split("?")[0] : null;
      }
      return (
        <div>
          <div style={{ borderRadius:20, overflow:"hidden", aspectRatio:"16/9", background:"#000" }}>
            {ytId ? (
              <iframe width="100%" height="100%" src={"https://www.youtube.com/embed/"+ytId} style={{ border:"none", display:"block" }} allowFullScreen/>
            ) : c.src ? (
              <video src={c.src} controls style={{ width:"100%", height:"100%" }}/>
            ) : null}
          </div>
          {c.caption && <p style={{ textAlign:"center", fontSize:13, color:"#94A3B8", marginTop:10, fontStyle:"italic" }}>{c.caption}</p>}
        </div>
      );
    }
    case "audio":
      return c.src ? (
        <div style={{ background:"linear-gradient(135deg,#ecfeff,#cffafe)", borderRadius:20, padding:"20px 22px", border:"1.5px solid #a5f3fc" }}>
          <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:14 }}>
            <div style={{ width:48, height:48, borderRadius:14, background:"linear-gradient(135deg,#0891b2,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Music size={22} color="#fff"/>
            </div>
            <div>
              <p style={{ fontSize:15, fontWeight:700, color:"#0e7490", margin:"0 0 2px" }}>{c.title||"Audio"}</p>
              {c.caption && <p style={{ fontSize:13, color:"#0891b2", margin:0 }}>{c.caption}</p>}
            </div>
          </div>
          <audio src={c.src} controls style={{ width:"100%", height:42 }}/>
        </div>
      ) : null;
    case "quiz": {
      const sel = answers[idx];
      const isChecked = checked[idx];
      const isCorrect = sel === c.correct;
      return (
        <div style={{ background:"#FFFBEB", borderRadius:20, padding:24, border:"1.5px solid #FDE68A" }}>
          <p style={{ fontSize:12, fontWeight:700, color:"#92400E", margin:"0 0 12px", letterSpacing:0.5 }}>🎯 QUIZ</p>
          <p style={{ fontSize:16, fontWeight:700, color:"#0f172a", margin:"0 0 16px", lineHeight:1.4 }}>{c.question}</p>
          <div style={{ display:"flex", flexDirection:"column", gap:8, marginBottom:16 }}>
            {(c.options||[]).map((opt, i) => {
              let bg="#fff", border="#E2E8F0", color="#374151";
              if (isChecked) {
                if (i===c.correct) { bg="#F0FDF4"; border="#86efac"; color="#166534"; }
                else if (i===sel) { bg="#FEF2F2"; border="#fca5a5"; color="#991B1B"; }
              } else if (sel===i) { bg="#EEF2FF"; border="#6366f1"; color="#4338CA"; }
              return (
                <button key={i} onClick={() => !isChecked && setAnswers(p=>({...p,[idx]:i}))} style={{ padding:"12px 16px", borderRadius:12, border:"1.5px solid "+border, background:bg, color, fontSize:14, cursor:isChecked?"default":"pointer", textAlign:"left", display:"flex", alignItems:"center", gap:10 }}>
                  <span style={{ width:24, height:24, borderRadius:"50%", border:"2px solid "+border, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0, fontSize:11, fontWeight:700 }}>
                    {isChecked&&i===c.correct?"✓":isChecked&&i===sel&&!isCorrect?"✕":String.fromCharCode(65+i)}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
          {!isChecked && sel!==undefined && (
            <button onClick={() => setChecked(p=>({...p,[idx]:true}))} style={{ padding:"11px 22px", borderRadius:11, border:"none", background:"linear-gradient(135deg,#d97706,#f59e0b)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
              Check Answer
            </button>
          )}
          {isChecked && (
            <div style={{ padding:"12px 16px", borderRadius:12, background:isCorrect?"#F0FDF4":"#FEF2F2", border:"1.5px solid "+(isCorrect?"#86efac":"#fca5a5") }}>
              <p style={{ fontSize:14, fontWeight:700, color:isCorrect?"#166534":"#991B1B", margin:"0 0 4px" }}>{isCorrect?"🎉 Correct!":"❌ Not quite"}</p>
              {c.explanation && <p style={{ fontSize:13, color:"#374151", margin:0 }}>{c.explanation}</p>}
            </div>
          )}
        </div>
      );
    }
    case "fillblank": {
      const val = fillInputs[idx] || "";
      const isChecked = fillChecked[idx];
      const isCorrect = val.trim().toLowerCase() === (c.answer||"").trim().toLowerCase();
      const showAnswer = fillShowAnswer?.[idx];
      return (
        <div style={{ background:"#FDF2F8", borderRadius:20, padding:24, border:"1.5px solid #FBCFE8" }}>
          <p style={{ fontSize:12, fontWeight:700, color:"#9d174d", margin:"0 0 12px", letterSpacing:0.5 }}>✏️ FILL IN THE BLANK</p>
          
          {/* Prompt with blank */}
          <p style={{ fontSize:16, color:"#0f172a", margin:"0 0 16px", lineHeight:1.6 }}>
            {(c.prompt||"").split("___").map((part, i, arr) => (
              <span key={i}>{part}{i < arr.length-1 && (
                <input
                  value={val}
                  onChange={e => !isChecked && setFillInputs(p => ({...p,[idx]:e.target.value}))}
                  onKeyDown={e => e.key==="Enter" && val && !isChecked && setFillChecked(p=>({...p,[idx]:true}))}
                  placeholder="type answer..."
                  disabled={isChecked}
                  style={{ display:"inline-block", width:160, borderBottom:"2px solid "+(isChecked?isCorrect?"#22c55e":"#ef4444":"#db2777"), border:"none", borderBottom:"2px solid "+(isChecked?isCorrect?"#22c55e":"#ef4444":"#db2777"), outline:"none", fontSize:16, fontWeight:700, color:isChecked?isCorrect?"#166534":"#991B1B":"#db2777", textAlign:"center", background:"transparent", padding:"2px 4px" }}
                />
              )}</span>
            ))}
          </p>

          {/* Hint */}
          {c.hint && !isChecked && (
            <p style={{ fontSize:13, color:"#be185d", margin:"0 0 14px" }}>💡 Hint: {c.hint}</p>
          )}

          {/* Check button */}
          {!isChecked && val && (
            <button onClick={() => setFillChecked(p=>({...p,[idx]:true}))}
              style={{ padding:"10px 20px", borderRadius:10, border:"none", background:"linear-gradient(135deg,#db2777,#9d174d)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
              Check
            </button>
          )}

          {/* Result */}
          {isChecked && (
            <div>
              {isCorrect ? (
                <div>
                  <div style={{ padding:"12px 16px", borderRadius:12, background:"#F0FDF4", border:"1.5px solid #86efac", marginBottom:16 }}>
                    <p style={{ fontSize:15, fontWeight:800, color:"#166534", margin:"0 0 2px" }}>🎉 Correct!</p>
                    <p style={{ fontSize:13, color:"#166534", margin:0 }}>Great job!</p>
                  </div>
                  {/* Success media */}
                  {c.successImage && (
                    <div style={{ borderRadius:16, overflow:"hidden", marginBottom:12 }}>
                      <img src={c.successImage} alt="Success" style={{ width:"100%", display:"block", borderRadius:16 }}/>
                    </div>
                  )}
                  {c.successVideo && (
                    <div style={{ borderRadius:16, overflow:"hidden", marginBottom:12, aspectRatio:"16/9", background:"#000" }}>
                      {c.successVideo.includes("youtube") || c.successVideo.includes("youtu.be") ? (
                        <iframe width="100%" height="100%"
                          src={"https://www.youtube.com/embed/" + (c.successVideo.split("v=")[1]?.split("&")[0] || c.successVideo.split("youtu.be/")[1]?.split("?")[0])}
                          style={{ border:"none", display:"block" }} allowFullScreen/>
                      ) : (
                        <video src={c.successVideo} controls autoPlay style={{ width:"100%", height:"100%" }}/>
                      )}
                    </div>
                  )}
                </div>
              ) : (
                <div>
                  <div style={{ padding:"12px 16px", borderRadius:12, background:"#FEF2F2", border:"1.5px solid #fca5a5", marginBottom:14 }}>
                    <p style={{ fontSize:15, fontWeight:800, color:"#991B1B", margin:"0 0 2px" }}>❌ Not quite!</p>
                    <p style={{ fontSize:13, color:"#991B1B", margin:0 }}>Give it another shot or peek at the answer.</p>
                  </div>
                  <div style={{ display:"flex", gap:10 }}>
                    <button onClick={() => { setFillChecked(p=>({...p,[idx]:false})); setFillInputs(p=>({...p,[idx]:""})); }}
                      style={{ flex:1, padding:"11px", borderRadius:11, border:"1.5px solid #FBCFE8", background:"#fff", fontSize:13, fontWeight:700, color:"#db2777", cursor:"pointer" }}>
                      🔄 Try Again
                    </button>
                    <button onClick={() => setFillShowAnswer(p=>({...p,[idx]:true}))}
                      style={{ flex:1, padding:"11px", borderRadius:11, border:"none", background:"linear-gradient(135deg,#374151,#1f2937)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer" }}>
                      👁 See Answer
                    </button>
                  </div>
                  {showAnswer && (
                    <div style={{ marginTop:12, padding:"12px 16px", borderRadius:12, background:"#F8FAFC", border:"1.5px solid #E2E8F0" }}>
                      <p style={{ fontSize:13, color:"#374151", margin:0 }}>
                        ✅ The answer is: <strong style={{ color:"#166534" }}>{c.answer}</strong>
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    case "blankoptions": {
      const sentence = c.sentence || "";
      const markedWords = c.markedWords || [];
      const blanks = c.blanks || [];
      const words = sentence.split(" ").filter(Boolean);
      const blankCount = markedWords.length;

      const selectedMap = answers["bo_"+idx] || {};
      const isChecked = checked["bo_"+idx];
      const showAns = fillShowAnswer?.["bo_"+idx];
      const allFilled = Object.keys(selectedMap).filter(k=>selectedMap[k]!==undefined && selectedMap[k]!==null && selectedMap[k]!=="").length === blankCount;
      const allCorrect = blanks.length > 0 && blanks.every((b,i) => selectedMap[i] === b.correct || selectedMap[String(i)] === b.correct);

      const getOptions = (i) => {
        const b = blanks[i];
        if (!b) return [];
        return [b.correct, b.w1, b.w2, b.w3].filter(Boolean).sort(() => Math.sin(idx*100+i*37) - 0.5);
      };

      // Build sentence display with blanks
      let blankIndex = 0;
      const sentenceParts = [];
      words.forEach((word, wi) => {
        if (markedWords.includes(wi)) {
          const bi = markedWords.indexOf(wi);
          sentenceParts.push({ type:"blank", blankIdx:bi });
        } else {
          sentenceParts.push({ type:"word", text:word });
        }
      });

      return (
        <div style={{ background:"#F0F9FF", borderRadius:20, padding:24, border:"1.5px solid #BAE6FD" }}>
          <p style={{ fontSize:12, fontWeight:700, color:"#0369a1", margin:"0 0 16px", letterSpacing:0.5 }}>
            ✏️ FILL IN THE BLANK{blankCount>1?"S":""}
          </p>

          {/* Sentence with blanks inline */}
          <p style={{ fontSize:18, color:"#0f172a", margin:"0 0 24px", lineHeight:2.2, fontWeight:500 }}>
            {sentenceParts.map((part, i) => (
              <span key={i}>
                {part.type === "word" ? (
                  part.text + " "
                ) : (
                  <span style={{
                    display:"inline-block", minWidth:90, padding:"4px 14px", margin:"0 3px",
                    borderRadius:10,
                    border: isChecked ? "2px solid "+((selectedMap[part.blankIdx]||selectedMap[String(part.blankIdx)])===blanks[part.blankIdx]?.correct?"#22c55e":"#ef4444") : selectedMap[part.blankIdx] ? "2px solid #0891b2" : "2px dashed #93c5fd",
                    background: isChecked ? (selectedMap[part.blankIdx]===blanks[part.blankIdx]?.correct?"#F0FDF4":"#FEF2F2") : selectedMap[part.blankIdx] ? "#E0F2FE" : "#fff",
                    color: isChecked ? (selectedMap[part.blankIdx]===blanks[part.blankIdx]?.correct?"#166534":"#991B1B") : selectedMap[part.blankIdx] ? "#0369a1" : "#94A3B8",
                    fontWeight:700, fontSize:17, textAlign:"center", transition:"all 0.2s",
                  }}>
                    {selectedMap[part.blankIdx] || selectedMap[String(part.blankIdx)] || "______"}
                  </span>
                )}
              </span>
            ))}
          </p>

          {/* Options per blank */}
          {!isChecked && (
            <div style={{ display:"flex", flexDirection:"column", gap:16, marginBottom:20 }}>
              {Array.from({ length: blankCount }, (_, i) => (
                <div key={i}>
                  {blankCount > 1 && <p style={{ fontSize:11, fontWeight:700, color:"#0369a1", margin:"0 0 8px" }}>BLANK {i+1}</p>}
                  <div style={{ display:"flex", flexWrap:"wrap", gap:8 }}>
                    {getOptions(i).map((opt,j) => (
                      <button key={j}
                        onClick={() => setAnswers(p=>({...p,["bo_"+idx]:{...selectedMap,[String(i)]:selectedMap[String(i)]===opt?undefined:opt}}))}
                        style={{
                          padding:"11px 22px", borderRadius:12,
                          border: (selectedMap[String(i)]===opt||selectedMap[i]===opt)?"2px solid #0891b2":"2px solid #BAE6FD",
                          background: (selectedMap[String(i)]===opt||selectedMap[i]===opt)?"#E0F2FE":"#fff",
                          color: (selectedMap[String(i)]===opt||selectedMap[i]===opt)?"#0369a1":"#374151",
                          fontSize:15, fontWeight:700, cursor:"pointer", transition:"all 0.15s",
                        }}>
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Check */}
          {!isChecked && allFilled && (
            <button onClick={() => setChecked(p=>({...p,["bo_"+idx]:true}))}
              style={{ padding:"12px 28px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#0891b2,#0369a1)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
              Check Answer ✓
            </button>
          )}

          {/* Result */}
          {isChecked && (
            <div>
              {allCorrect ? (
                <div>
                  <div style={{ padding:"14px 18px", borderRadius:14, background:"#F0FDF4", border:"2px solid #86efac", marginBottom:16 }}>
                    <p style={{ fontSize:16, fontWeight:800, color:"#166534", margin:"0 0 2px" }}>🎉 {blankCount>1?"All correct!":"Correct!"}</p>
                    {c.explanation && <p style={{ fontSize:13, color:"#166534", margin:0 }}>{c.explanation}</p>}
                  </div>
                  {c.successText && <div style={{ padding:"14px 16px", borderRadius:12, background:"#F0F9FF", border:"1.5px solid #BAE6FD", marginBottom:12 }}><p style={{ fontSize:14, color:"#0369a1", margin:0, lineHeight:1.65 }}>{c.successText}</p></div>}
                  {(c.successImages||[]).filter(Boolean).map((url,i) => <img key={i} src={url} alt="" style={{ width:"100%", borderRadius:16, display:"block", marginBottom:12 }}/>)}
                  {(c.successVideos||[]).filter(Boolean).map((url,i) => (
                    <div key={i} style={{ borderRadius:16, overflow:"hidden", aspectRatio:"16/9", background:"#000", marginBottom:12 }}>
                      {url.includes("youtube")||url.includes("youtu.be")
                        ? <iframe width="100%" height="100%" src={"https://www.youtube.com/embed/"+(url.split("v=")[1]?.split("&")[0]||url.split("youtu.be/")[1]?.split("?")[0])} style={{ border:"none" }} allowFullScreen/>
                        : <video src={url} controls autoPlay style={{ width:"100%",height:"100%" }}/>}
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <div style={{ padding:"14px 18px", borderRadius:14, background:"#FEF2F2", border:"2px solid #fca5a5", marginBottom:14 }}>
                    <p style={{ fontSize:16, fontWeight:800, color:"#991B1B", margin:"0 0 2px" }}>❌ Not quite!</p>
                    <p style={{ fontSize:13, color:"#991B1B", margin:0 }}>Try again!</p>
                  </div>
                  <div style={{ display:"flex", gap:10 }}>
                    <button onClick={() => { setChecked(p=>({...p,["bo_"+idx]:false})); setAnswers(p=>({...p,["bo_"+idx]:{}})); }}
                      style={{ flex:1, padding:"12px", borderRadius:12, border:"2px solid #BAE6FD", background:"#fff", fontSize:14, fontWeight:700, color:"#0891b2", cursor:"pointer" }}>
                      🔄 Try Again
                    </button>
                    <button onClick={() => setFillShowAnswer(p=>({...p,["bo_"+idx]:true}))}
                      style={{ flex:1, padding:"12px", borderRadius:12, border:"none", background:"#1f2937", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                      👁 See Answers
                    </button>
                  </div>
                  {showAns && (
                    <div style={{ marginTop:12 }}>
                      <div style={{ padding:"14px 16px", borderRadius:12, background:"#F0FDF4", border:"1.5px solid #86efac", marginBottom:12 }}>
                        {blanks.map((b,i) => <p key={i} style={{ fontSize:14, color:"#166534", margin:"0 0 4px", fontWeight:600 }}>Blank {i+1}: <strong>{b.correct}</strong></p>)}
                      </div>
                      {c.successText && <div style={{ padding:"14px 16px", borderRadius:12, background:"#F0F9FF", border:"1.5px solid #BAE6FD", marginBottom:12 }}><p style={{ fontSize:14, color:"#0369a1", margin:0, lineHeight:1.65 }}>{c.successText}</p></div>}
                      {(c.successImages||[]).filter(Boolean).map((url,si) => <img key={si} src={url} alt="" style={{ width:"100%", borderRadius:16, display:"block", marginBottom:12 }}/>)}
                      {(c.successVideos||[]).filter(Boolean).map((url,si) => (
                        <div key={si} style={{ borderRadius:16, overflow:"hidden", aspectRatio:"16/9", background:"#000", marginBottom:12 }}>
                          {url.includes("youtube")||url.includes("youtu.be")
                            ? <iframe width="100%" height="100%" src={"https://www.youtube.com/embed/"+(url.split("v=")[1]?.split("&")[0]||url.split("youtu.be/")[1]?.split("?")[0])} style={{ border:"none" }} allowFullScreen/>
                            : <video src={url} controls style={{ width:"100%", height:"100%" }}/>}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      );
    }
    case "keypoints":
      return (
        <div style={{ background:"#F0FDFA", borderRadius:20, padding:24, border:"1.5px solid #99f6e4" }}>
          <p style={{ fontSize:14, fontWeight:800, color:"#0f766e", margin:"0 0 16px" }}>⭐ {c.title||"Key Takeaways"}</p>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {(c.points||[]).filter(Boolean).map((pt, i) => (
              <div key={i} style={{ display:"flex", gap:12, alignItems:"flex-start" }}>
                <div style={{ width:24, height:24, borderRadius:"50%", background:"linear-gradient(135deg,#0d9488,#0891b2)", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:11, fontWeight:800, flexShrink:0 }}>{i+1}</div>
                <p style={{ fontSize:14, color:"#374151", margin:0, lineHeight:1.6 }}>{pt}</p>
              </div>
            ))}
          </div>
        </div>
      );
    case "callout": {
      const map = { info:["💡","#0891b2","#ECFEFF","#a5f3fc"], warning:["⚠️","#d97706","#FFFBEB","#fde68a"], success:["✅","#059669","#ECFDF5","#a7f3d0"], error:["❌","#dc2626","#FEF2F2","#fecaca"] };
      const [emoji, color, bg, border] = map[c.style||"info"];
      return <div style={{ padding:"16px 20px", borderRadius:16, background:bg, border:"1.5px solid "+border, display:"flex", gap:12 }}><span style={{ fontSize:18, flexShrink:0 }}>{emoji}</span><p style={{ fontSize:14, color, margin:0, lineHeight:1.65, fontWeight:500 }}>{c.text}</p></div>;
    }
    case "divider":
      return c.style==="dots"?<div style={{ textAlign:"center", color:"#CBD5E1", fontSize:18, letterSpacing:10, padding:"8px 0" }}>• • •</div>:c.style==="space"?<div style={{ height:24 }}/>:<hr style={{ border:"none", borderTop:"2px solid #F1F5F9", margin:0 }}/>;
    default:
      if (c.text) return <p style={{ fontSize:15, lineHeight:1.8, color:"#374151", margin:0 }}>{c.text}</p>;
      return null;
  }
}
```

### `components/admin/builder/blocks.jsx`
```jsx
"use client";

import { useState } from "react";
import { ImagePlus, Check, Music, Film, Link2, Image as ImageIcon } from "lucide-react";
import MediaLibrary from "@/components/admin/builder/MediaLibrary";

// ─────────────────────────────────────────────
// BLOCK DEFINITIONS
// ─────────────────────────────────────────────
export const BLOCK_DEFS = {
  heading:   { icon:"✦",  label:"Heading",   desc:"Section title",    color:"#7c3aed", bg:"#F5F3FF", default:{ text:"", level:"h2" },                          preview:c=>c.text||"Empty heading" },
  text:      { icon:"📝", label:"Text",      desc:"Paragraph",        color:"#2563eb", bg:"#EFF6FF", default:{ text:"" },                                     preview:c=>c.text?c.text.slice(0,60):"Empty text" },
  image:     { icon:"🖼️", label:"Image",     desc:"Photo or graphic", color:"#059669", bg:"#ECFDF5", default:{ src:"", alt:"", caption:"" },                  preview:c=>c.src?"Image set":"No image" },
  video:     { icon:"🎬", label:"Video",     desc:"YouTube or file",  color:"#dc2626", bg:"#FEF2F2", default:{ src:"", kind:"youtube", caption:"" },           preview:c=>c.src?"Video set":"No video" },
  audio:     { icon:"🎧", label:"Audio",     desc:"Podcast or sound", color:"#0891b2", bg:"#ECFEFF", default:{ src:"", title:"", caption:"" },                 preview:c=>c.src?(c.title||"Audio set"):"No audio" },
  quiz:      { icon:"🎯", label:"Quiz",      desc:"Multiple choice",  color:"#d97706", bg:"#FFFBEB", default:{ question:"", options:["","","",""], correct:0, explanation:"" }, preview:c=>c.question||"No question" },
  fillblank: { icon:"✏️", label:"Fill Blank",desc:"Type the answer",  color:"#db2777", bg:"#FDF2F8", default:{ prompt:"", answer:"", hint:"" },                preview:c=>c.prompt||"No prompt" },
  keypoints: { icon:"⭐", label:"Key Points",desc:"Bullet list",      color:"#0d9488", bg:"#F0FDFA", default:{ title:"Key Takeaways", points:["","",""] },     preview:c=>(c.points||[]).filter(Boolean).join(", ")||"No points" },
  callout:   { icon:"💡", label:"Callout",   desc:"Highlight box",    color:"#65a30d", bg:"#F7FEE7", default:{ text:"", style:"info" },                        preview:c=>c.text||"Empty callout" },
  divider:      { icon:"➖", label:"Divider",       desc:"Visual break",        color:"#64748b", bg:"#F8FAFC", default:{ style:"line" },                                                          preview:()=>"Section divider" },
  blankoptions: { icon:"🔤", label:"Blank + Options", desc:"Pick word from sentence", color:"#0891b2", bg:"#E0F2FE", default:{ sentence:"", blankWord:"", wrongOptions:["","",""], explanation:"" }, preview:c=>c.sentence||"No sentence" },
};

// ─────────────────────────────────────────────
// EDITOR ROUTER
// ─────────────────────────────────────────────
export function BlockEditor({ block, onChange }) {
  const c = block.content || {};
  const props = { content:c, onChange };
  switch (block.type) {
    case "heading":   return <HeadingE {...props}/>;
    case "text":      return <TextE {...props}/>;
    case "image":     return <ImageE {...props}/>;
    case "video":     return <VideoE {...props}/>;
    case "audio":     return <AudioE {...props}/>;
    case "quiz":      return <QuizE {...props}/>;
    case "fillblank": return <FillE {...props}/>;
    case "keypoints": return <KeyE {...props}/>;
    case "callout":   return <CalloutE {...props}/>;
    case "blankoptions": return <BlankOptionsE {...props}/>;
    case "divider":   return <DividerE {...props}/>;
    default: return null;
  }
}

// ─────────────────────────────────────────────
// PREVIEW ROUTER
// ─────────────────────────────────────────────
export function BlockPreview({ block }) {
  const c = block.content || {};
  switch (block.type) {
    case "heading":
      return <div style={{ fontSize:c.level==="h1"?28:c.level==="h2"?22:18, fontWeight:900, color:"#0f172a", lineHeight:1.25 }}>{c.text||"Heading"}</div>;
    case "text":
      return <p style={{ fontSize:15, lineHeight:1.75, color:"#374151", margin:0, whiteSpace:"pre-wrap" }}>{c.text||"Text content..."}</p>;
    case "image":
      return c.src ? (
        <figure style={{ margin:0 }}>
          <img src={c.src} alt={c.alt||""} style={{ width:"100%", borderRadius:16, display:"block" }}
            onError={e => { e.target.style.display="none"; }}
          />
          {c.caption && <figcaption style={{ fontSize:12, color:"#94A3B8", textAlign:"center", marginTop:8, fontStyle:"italic" }}>{c.caption}</figcaption>}
        </figure>
      ) : <Placeholder icon="🖼️" text="Image"/>;
    case "video": {
      const yt = c.kind==="youtube" && c.src ? ytId(c.src) : null;
      if (yt) return <div style={{ borderRadius:16, overflow:"hidden", aspectRatio:"16/9" }}><iframe width="100%" height="100%" src={`https://www.youtube.com/embed/${yt}`} style={{ border:"none" }} allowFullScreen/></div>;
      if (c.kind==="vimeo" && c.src) { const vid=c.src.match(/vimeo\.com\/(\d+)/)?.[1]; return vid ? <div style={{ borderRadius:16, overflow:"hidden", aspectRatio:"16/9" }}><iframe width="100%" height="100%" src={`https://player.vimeo.com/video/${vid}`} style={{ border:"none" }} allowFullScreen/></div> : <Placeholder icon="🎬" text="Video"/>; }
      if (c.src) return <video src={c.src} controls style={{ width:"100%", borderRadius:16 }}/>;
      return <Placeholder icon="🎬" text="Video"/>;
    }
    case "audio":
      return c.src ? (
        <div style={{ background:"linear-gradient(135deg,#ecfeff,#cffafe)", borderRadius:16, padding:"16px 18px", border:"1.5px solid #a5f3fc" }}>
          <div style={{ display:"flex", alignItems:"center", gap:12, marginBottom:c.src?10:0 }}>
            <div style={{ width:42, height:42, borderRadius:12, background:"linear-gradient(135deg,#0891b2,#06b6d4)", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Music size={20} color="#fff"/>
            </div>
            <div style={{ minWidth:0 }}>
              <p style={{ fontSize:14, fontWeight:700, color:"#0e7490", margin:0 }}>{c.title||"Audio track"}</p>
              {c.caption && <p style={{ fontSize:12, color:"#0891b2", margin:0 }}>{c.caption}</p>}
            </div>
          </div>
          <audio src={c.src} controls style={{ width:"100%", height:38 }}/>
        </div>
      ) : <Placeholder icon="🎧" text="Audio"/>;
    case "quiz":
      return (
        <div style={{ background:"#FFFBEB", borderRadius:16, padding:20, border:"1.5px solid #FDE68A" }}>
          <p style={{ fontSize:12, fontWeight:700, color:"#92400E", margin:"0 0 10px" }}>🎯 QUIZ</p>
          <p style={{ fontSize:15, fontWeight:700, color:"#0f172a", margin:"0 0 12px" }}>{c.question||"Question..."}</p>
          {(c.options||[]).filter(Boolean).map((o,i) => (
            <div key={i} style={{ padding:"10px 14px", borderRadius:10, border:`1.5px solid ${i===c.correct?"#86efac":"#E2E8F0"}`, background:i===c.correct?"#F0FDF4":"#fff", marginBottom:6, fontSize:13, color:"#374151", display:"flex", alignItems:"center", gap:8 }}>
              {i===c.correct && <Check size={14} color="#22c55e"/>}
              <span style={{ fontWeight:600 }}>{String.fromCharCode(65+i)}.</span> {o}
            </div>
          ))}
        </div>
      );
    case "fillblank":
      return (
        <div style={{ background:"#FDF2F8", borderRadius:16, padding:20, border:"1.5px solid #FBCFE8" }}>
          <p style={{ fontSize:12, fontWeight:700, color:"#9d174d", margin:"0 0 10px" }}>✏️ FILL IN THE BLANK</p>
          <p style={{ fontSize:15, color:"#0f172a", lineHeight:1.6 }}>{(c.prompt||"Prompt with ___").split("___").map((part,i,arr) => <span key={i}>{part}{i<arr.length-1 && <span style={{ display:"inline-block", minWidth:60, borderBottom:"2px solid #db2777", margin:"0 4px" }}/>}</span>)}</p>
          {c.hint && <p style={{ fontSize:12, color:"#be185d", margin:"10px 0 0" }}>💡 {c.hint}</p>}
        </div>
      );
    case "keypoints":
      return (
        <div style={{ background:"#F0FDFA", borderRadius:16, padding:20, border:"1.5px solid #99f6e4" }}>
          <p style={{ fontSize:14, fontWeight:800, color:"#0f766e", margin:"0 0 12px" }}>⭐ {c.title||"Key Takeaways"}</p>
          {(c.points||[]).filter(Boolean).map((p,i) => (
            <div key={i} style={{ display:"flex", gap:10, marginBottom:8 }}>
              <div style={{ width:20, height:20, borderRadius:"50%", background:"#0d9488", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, flexShrink:0 }}>{i+1}</div>
              <p style={{ fontSize:14, color:"#374151", margin:0, lineHeight:1.5 }}>{p}</p>
            </div>
          ))}
        </div>
      );
    case "callout": {
      const map = { info:["💡","#0891b2","#ECFEFF","#a5f3fc"], warning:["⚠️","#d97706","#FFFBEB","#fde68a"], success:["✅","#059669","#ECFDF5","#a7f3d0"], error:["❌","#dc2626","#FEF2F2","#fecaca"] };
      const [emoji,color,bg,border] = map[c.style||"info"];
      return <div style={{ padding:"14px 18px", borderRadius:14, background:bg, border:`1.5px solid ${border}` }}><p style={{ fontSize:14, color, margin:0, lineHeight:1.6 }}>{emoji} {c.text||"Callout text"}</p></div>;
    }
    case "blankoptions": {
      const words = (c.sentence||"").split(" ").filter(Boolean);
      const marked = c.markedWords || [];
      return (
        <div style={{ background:"#F0F9FF", borderRadius:14, padding:"14px 16px", border:"1.5px solid #BAE6FD" }}>
          <p style={{ fontSize:11, fontWeight:700, color:"#0369a1", margin:"0 0 8px" }}>✏️ FILL IN THE BLANK</p>
          <p style={{ fontSize:15, color:"#0f172a", margin:"0 0 10px", lineHeight:1.8 }}>
            {words.map((w,i) => (
              <span key={i}>
                {marked.includes(i)
                  ? <span style={{ display:"inline-block", padding:"2px 12px", borderRadius:8, border:"2px dashed #93c5fd", color:"#94A3B8", fontWeight:700, margin:"0 3px" }}>______</span>
                  : w
                }{" "}
              </span>
            ))}
          </p>
          {(c.blanks||[]).length > 0 && (
            <div style={{ display:"flex", flexWrap:"wrap", gap:6 }}>
              {(c.blanks||[]).map((b,i) => [b.correct,b.w1,b.w2,b.w3].filter(Boolean).map((opt,j) => (
                <span key={i+"-"+j} style={{ padding:"6px 14px", borderRadius:10, border:"1.5px solid #BAE6FD", background:"#fff", fontSize:13, color:"#374151" }}>{opt}</span>
              )))}
            </div>
          )}
        </div>
      );
    }
    case "divider":
      return c.style==="dots"
        ? <div style={{ textAlign:"center", color:"#CBD5E1", fontSize:20, letterSpacing:8 }}>• • •</div>
        : c.style==="space"
        ? <div style={{ height:32 }}/>
        : <hr style={{ border:"none", borderTop:"2px solid #E2E8F0", margin:0 }}/>;
    default: return null;
  }
}

function Placeholder({ icon, text }) {
  return <div style={{ background:"#F8FAFC", borderRadius:16, padding:36, textAlign:"center", color:"#CBD5E1", border:"1.5px dashed #E2E8F0" }}><div style={{ fontSize:32, marginBottom:6 }}>{icon}</div><p style={{ fontSize:13, margin:0 }}>{text} preview</p></div>;
}

function ytId(url) {
  return url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/)?.[1] || null;
}

// ─────────────────────────────────────────────
// EDITORS
// ─────────────────────────────────────────────
function HeadingE({ content, onChange }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, paddingTop:12 }}>
      <div style={{ display:"flex", gap:6 }}>
        {["h1","h2","h3"].map(l => (
          <button key={l} onClick={() => onChange({ ...content, level:l })} style={pill(content.level===l, "#7c3aed")}>{l.toUpperCase()}</button>
        ))}
      </div>
      <input value={content.text||""} onChange={e => onChange({ ...content, text:e.target.value })} placeholder="Heading text..." style={{ ...inp(), fontWeight:800, fontSize:16 }}/>
    </div>
  );
}

function TextE({ content, onChange }) {
  return (
    <div style={{ paddingTop:12 }}>
      <textarea value={content.text||""} onChange={e => onChange({ ...content, text:e.target.value })} placeholder="Write your content... Line breaks are preserved." style={{ ...inp(), minHeight:150, resize:"vertical", lineHeight:1.7 }}/>
      <p style={{ fontSize:11, color:"#94A3B8", margin:"6px 0 0" }}>{(content.text||"").length} chars</p>
    </div>
  );
}

function ImageE({ content, onChange }) {
  const [lib, setLib] = useState(false);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, paddingTop:12 }}>
      <button onClick={() => setLib(true)} style={mediaBtn("#059669")}>
        <ImagePlus size={16}/> {content.src ? "Change image" : "Choose / upload image"}
      </button>
      {content.src && (
        <div style={{ borderRadius:12, overflow:"hidden", border:"1.5px solid #E2E8F0", background:"#F8FAFC" }}>
          <img
            src={content.src}
            alt={content.alt||""}
            style={{ width:"100%", maxHeight:180, objectFit:"cover", display:"block" }}
            onError={e => { e.target.style.display="none"; e.target.nextSibling.style.display="flex"; }}
          />
          <div style={{ display:"none", padding:20, alignItems:"center", justifyContent:"center", flexDirection:"column", gap:6, color:"#94A3B8" }}>
            <span style={{ fontSize:24 }}>🖼️</span>
            <span style={{ fontSize:12 }}>Cannot load image preview</span>
            <span style={{ fontSize:10, wordBreak:"break-all", maxWidth:"100%" }}>{content.src}</span>
          </div>
        </div>
      )}
      <input value={content.alt||""} onChange={e => onChange({ ...content, alt:e.target.value })} placeholder="Alt text (accessibility)" style={inp()}/>
      <input value={content.caption||""} onChange={e => onChange({ ...content, caption:e.target.value })} placeholder="Caption (optional)" style={inp()}/>
      {lib && <MediaLibrary accept="image" onSelect={m => { console.log("Selected media:", m); onChange({ ...content, src:m.url, alt:content.alt||m.filename }); }} onClose={() => setLib(false)}/>}
    </div>
  );
}

function VideoE({ content, onChange }) {
  const [lib, setLib] = useState(false);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, paddingTop:12 }}>
      <div style={{ display:"flex", gap:6 }}>
        {[["youtube","YouTube"],["vimeo","Vimeo"],["file","Upload"]].map(([v,l]) => (
          <button key={v} onClick={() => onChange({ ...content, kind:v })} style={{ ...pill(content.kind===v,"#dc2626"), flex:1 }}>{l}</button>
        ))}
      </div>
      {content.kind === "file" ? (
        <>
          <button onClick={() => setLib(true)} style={mediaBtn("#dc2626")}>
            <Film size={16}/> {content.src ? "Change video" : "Choose / upload video"}
          </button>
          {content.src && <video src={content.src} controls style={{ width:"100%", borderRadius:12 }}/>}
        </>
      ) : (
        <input value={content.src||""} onChange={e => onChange({ ...content, src:e.target.value })} placeholder={content.kind==="vimeo"?"https://vimeo.com/...":"https://youtube.com/watch?v=..."} style={inp()}/>
      )}
      <input value={content.caption||""} onChange={e => onChange({ ...content, caption:e.target.value })} placeholder="Caption (optional)" style={inp()}/>
      {lib && <MediaLibrary accept="video" onSelect={m => onChange({ ...content, src:m.url, kind:"file" })} onClose={() => setLib(false)}/>}
    </div>
  );
}

function AudioE({ content, onChange }) {
  const [lib, setLib] = useState(false);
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:10, paddingTop:12 }}>
      <button onClick={() => setLib(true)} style={mediaBtn("#0891b2")}>
        <Music size={16}/> {content.src ? "Change audio" : "Choose / upload audio"}
      </button>
      {content.src && <audio src={content.src} controls style={{ width:"100%" }}/>}
      <input value={content.title||""} onChange={e => onChange({ ...content, title:e.target.value })} placeholder="Audio title (e.g. Lesson narration)" style={inp()}/>
      <input value={content.caption||""} onChange={e => onChange({ ...content, caption:e.target.value })} placeholder="Caption / description (optional)" style={inp()}/>
      {lib && <MediaLibrary accept="audio" onSelect={m => onChange({ ...content, src:m.url, title:content.title||m.filename })} onClose={() => setLib(false)}/>}
    </div>
  );
}

function QuizE({ content, onChange }) {
  const opts = content.options || ["","","",""];
  const setOpt = (i,v) => { const a=[...opts]; a[i]=v; onChange({ ...content, options:a }); };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, paddingTop:12 }}>
      <div><label style={lbl()}>Question</label><textarea value={content.question||""} onChange={e => onChange({ ...content, question:e.target.value })} placeholder="Your question..." style={{ ...inp(), minHeight:70, resize:"vertical" }}/></div>
      <div>
        <label style={lbl()}>Options <span style={{ color:"#94A3B8", fontWeight:400 }}>· click ✓ for correct</span></label>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {opts.map((o,i) => (
            <div key={i} style={{ display:"flex", gap:8, alignItems:"center" }}>
              <button onClick={() => onChange({ ...content, correct:i })} style={{ width:28, height:28, borderRadius:"50%", border:`2px solid ${content.correct===i?"#22c55e":"#E2E8F0"}`, background:content.correct===i?"#22c55e":"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>{content.correct===i && <Check size={13} color="#fff"/>}</button>
              <input value={o} onChange={e => setOpt(i,e.target.value)} placeholder={`Option ${i+1}`} style={{ ...inp(), flex:1, borderColor:content.correct===i?"#22c55e":"#E2E8F0" }}/>
              {opts.length>2 && <button onClick={() => onChange({ ...content, options:opts.filter((_,x)=>x!==i), correct:Math.min(content.correct,opts.length-2) })} style={ctrlX()}>✕</button>}
            </div>
          ))}
          {opts.length<6 && <button onClick={() => onChange({ ...content, options:[...opts,""] })} style={addX()}>+ Add option</button>}
        </div>
      </div>
      <div><label style={lbl()}>Explanation <span style={{ color:"#94A3B8", fontWeight:400 }}>· shown after</span></label><textarea value={content.explanation||""} onChange={e => onChange({ ...content, explanation:e.target.value })} placeholder="Why is this correct?" style={{ ...inp(), minHeight:60, resize:"vertical" }}/></div>
    </div>
  );
}

function BlankOptionsE({ content, onChange }) {
  const [lib, setLib] = useState(false);
  const [libFor, setLibFor] = useState("image");

  const sentence = content.sentence || "";
  const blanks = content.blanks || [];
  const successImages = content.successImages || [];
  const successVideos = content.successVideos || [];

  // Split sentence into words for clicking
  const words = sentence.split(" ").filter(Boolean);

  // Find which words are marked as blanks
  const markedBlanks = content.markedWords || []; // array of word indices

  // Build preview with ___ replacing marked words
  const preview = words.map((w, i) => markedBlanks.includes(i) ? "___" : w).join(" ");

  // Sync blanks data
  const blankCount = markedBlanks.length;
  const syncedBlanks = Array.from({ length: blankCount }, (_, i) =>
    blanks[i] || { correct: words[markedBlanks[i]] || "", w1:"", w2:"", w3:"" }
  );

  const toggleWord = (wordIdx) => {
    let newMarked = [...markedBlanks];
    if (newMarked.includes(wordIdx)) {
      newMarked = newMarked.filter(i => i !== wordIdx);
    } else {
      newMarked = [...newMarked, wordIdx].sort((a,b)=>a-b);
    }
    // Auto-set correct answers from the words
    const newBlanks = newMarked.map((wi, i) => ({
      ...(blanks[i] || {}),
      correct: words[wi] || "",
      w1: blanks[i]?.w1 || "",
      w2: blanks[i]?.w2 || "",
      w3: blanks[i]?.w3 || "",
    }));
    onChange({ ...content, markedWords: newMarked, blanks: newBlanks });
  };

  const updateBlank = (i, key, val) => {
    const b = [...syncedBlanks];
    b[i] = { ...b[i], [key]: val };
    onChange({ ...content, blanks: b });
  };

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:14, paddingTop:12 }}>

      {/* Step 1 - Write sentence */}
      <div>
        <label style={lbl()}>Step 1 · Write the full sentence</label>
        <textarea value={sentence}
          onChange={e => onChange({ ...content, sentence:e.target.value, markedWords:[], blanks:[] })}
          placeholder="My name is Mahtab and I live in Dhaka"
          style={{ ...inp(), minHeight:70, resize:"vertical" }}/>
      </div>

      {/* Step 2 - Click words to blank */}
      {words.length > 0 && (
        <div>
          <label style={lbl()}>Step 2 · Click words to make them blank</label>
          <p style={{ fontSize:11, color:"#94A3B8", margin:"0 0 10px" }}>Click a word to turn it into a blank. Click again to undo.</p>
          <div style={{ display:"flex", flexWrap:"wrap", gap:8, padding:"14px", background:"#F8FAFC", borderRadius:12, border:"1.5px solid #E2E8F0" }}>
            {words.map((word, i) => {
              const isBlank = markedBlanks.includes(i);
              const blankNum = markedBlanks.indexOf(i) + 1;
              return (
                <button key={i} onClick={() => toggleWord(i)}
                  style={{
                    padding:"8px 14px", borderRadius:10, fontSize:15, fontWeight:isBlank?800:500,
                    border: isBlank ? "2px solid #6366f1" : "1.5px solid #E2E8F0",
                    background: isBlank ? "#EEF2FF" : "#fff",
                    color: isBlank ? "#6366f1" : "#374151",
                    cursor:"pointer", transition:"all 0.15s",
                    position:"relative",
                  }}>
                  {isBlank ? "___" : word}
                  {isBlank && (
                    <span style={{ position:"absolute", top:-8, right:-6, background:"#6366f1", color:"#fff", borderRadius:"50%", width:16, height:16, fontSize:9, fontWeight:800, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      {blankNum}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Preview */}
          {markedBlanks.length > 0 && (
            <div style={{ marginTop:8, padding:"10px 14px", borderRadius:10, background:"#EEF2FF", border:"1.5px solid #c7d2fe" }}>
              <p style={{ fontSize:11, fontWeight:700, color:"#6366f1", margin:"0 0 3px" }}>PREVIEW</p>
              <p style={{ fontSize:14, color:"#0f172a", margin:0 }}>{preview}</p>
            </div>
          )}
        </div>
      )}

      {/* Step 3 - Wrong options per blank */}
      {blankCount > 0 && (
        <div>
          <label style={lbl()}>Step 3 · Add 3 wrong options for each blank</label>
          {syncedBlanks.map((blank, i) => (
            <div key={i} style={{ background:"#F8FAFC", borderRadius:12, padding:12, border:"1.5px solid #E2E8F0", marginBottom:10 }}>
              <p style={{ fontSize:11, fontWeight:800, color:"#6366f1", margin:"0 0 10px" }}>
                BLANK {i+1} · Correct: <span style={{ color:"#22c55e" }}>{blank.correct}</span>
              </p>
              {["w1","w2","w3"].map((key,j) => (
                <input key={key} value={blank[key]||""} onChange={e => updateBlank(i,key,e.target.value)}
                  placeholder={"Wrong option "+(j+1)} style={{ ...inp(), marginBottom:6 }}/>
              ))}
            </div>
          ))}
        </div>
      )}

      {/* Explanation */}
      <div>
        <label style={lbl()}>Explanation <span style={{ color:"#94A3B8", fontWeight:400 }}>· optional</span></label>
        <textarea value={content.explanation||""} onChange={e => onChange({ ...content, explanation:e.target.value })}
          placeholder="Why these are correct..." style={{ ...inp(), minHeight:50, resize:"vertical" }}/>
      </div>

      {/* Success content */}
      <div style={{ paddingTop:12, borderTop:"1px solid #F1F5F9" }}>
        <label style={lbl()}>🎉 Success Content <span style={{ color:"#94A3B8", fontWeight:400 }}>· shows when all correct</span></label>
        <textarea value={content.successText||""} onChange={e => onChange({ ...content, successText:e.target.value })}
          placeholder="Great job! Here's more context..." style={{ ...inp(), minHeight:60, resize:"vertical", marginBottom:10 }}/>

        <label style={lbl()}>Images</label>
        {successImages.map((url,i) => (
          <div key={i} style={{ display:"flex", gap:6, marginBottom:6, alignItems:"center" }}>
            <img src={url} alt="" style={{ width:44,height:44,borderRadius:8,objectFit:"cover",flexShrink:0 }}/>
            <input value={url} onChange={e => { const a=[...successImages]; a[i]=e.target.value; onChange({ ...content, successImages:a }); }} style={{ ...inp(), flex:1 }}/>
            <button onClick={() => onChange({ ...content, successImages:successImages.filter((_,x)=>x!==i) })} style={{ padding:"4px 8px",borderRadius:6,border:"none",background:"#FEF2F2",color:"#ef4444",cursor:"pointer" }}>✕</button>
          </div>
        ))}
        <div style={{ display:"flex", gap:6, marginBottom:10 }}>
          <button onClick={() => { setLibFor("image"); setLib(true); }} style={mediaBtn("#059669")}><ImageIcon size={13}/> Upload</button>
          <button onClick={() => { const u=window.prompt("Image URL:"); if(u) onChange({ ...content, successImages:[...successImages,u] }); }} style={mediaBtn("#6366f1")}><Link2 size={13}/> URL</button>
        </div>

        <label style={lbl()}>Videos</label>
        {successVideos.map((url,i) => (
          <div key={i} style={{ display:"flex", gap:6, marginBottom:6, alignItems:"center" }}>
            <div style={{ width:44,height:44,borderRadius:8,background:"#1f2937",display:"flex",alignItems:"center",justifyContent:"center",flexShrink:0 }}><Film size={18} color="#fff"/></div>
            <input value={url} onChange={e => { const a=[...successVideos]; a[i]=e.target.value; onChange({ ...content, successVideos:a }); }} style={{ ...inp(), flex:1 }}/>
            <button onClick={() => onChange({ ...content, successVideos:successVideos.filter((_,x)=>x!==i) })} style={{ padding:"4px 8px",borderRadius:6,border:"none",background:"#FEF2F2",color:"#ef4444",cursor:"pointer" }}>✕</button>
          </div>
        ))}
        <div style={{ display:"flex", gap:6 }}>
          <button onClick={() => { setLibFor("video"); setLib(true); }} style={mediaBtn("#dc2626")}><Film size={13}/> Upload</button>
          <button onClick={() => { const u=window.prompt("Video/YouTube URL:"); if(u) onChange({ ...content, successVideos:[...successVideos,u] }); }} style={mediaBtn("#6366f1")}><Link2 size={13}/> URL</button>
        </div>
      </div>

      {lib && <MediaLibrary accept={libFor}
        onSelect={m => { libFor==="image" ? onChange({ ...content, successImages:[...successImages,m.url] }) : onChange({ ...content, successVideos:[...successVideos,m.url] }); setLib(false); }}
        onClose={() => setLib(false)}/>}
    </div>
  );
}

function FillE({ content, onChange }) {
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, paddingTop:12 }}>
      <div><label style={lbl()}>Prompt <span style={{ color:"#94A3B8", fontWeight:400 }}>· use ___ for blank</span></label><input value={content.prompt||""} onChange={e => onChange({ ...content, prompt:e.target.value })} placeholder="The capital of France is ___" style={inp()}/></div>
      <div><label style={lbl()}>Answer</label><input value={content.answer||""} onChange={e => onChange({ ...content, answer:e.target.value })} placeholder="Paris" style={inp()}/></div>
      <div><label style={lbl()}>Hint <span style={{ color:"#94A3B8", fontWeight:400 }}>· optional</span></label><input value={content.hint||""} onChange={e => onChange({ ...content, hint:e.target.value })} placeholder="A European city..." style={inp()}/></div>
    </div>
  );
}

function KeyE({ content, onChange }) {
  const pts = content.points || ["",""];
  const setPt = (i,v) => { const a=[...pts]; a[i]=v; onChange({ ...content, points:a }); };
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, paddingTop:12 }}>
      <div><label style={lbl()}>Title</label><input value={content.title||""} onChange={e => onChange({ ...content, title:e.target.value })} placeholder="Key Takeaways" style={inp()}/></div>
      <div>
        <label style={lbl()}>Points</label>
        <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
          {pts.map((p,i) => (
            <div key={i} style={{ display:"flex", gap:8, alignItems:"center" }}>
              <div style={{ width:22, height:22, borderRadius:"50%", background:"#0d9488", color:"#fff", display:"flex", alignItems:"center", justifyContent:"center", fontSize:10, fontWeight:700, flexShrink:0 }}>{i+1}</div>
              <input value={p} onChange={e => setPt(i,e.target.value)} placeholder={`Point ${i+1}`} style={{ ...inp(), flex:1 }}/>
              {pts.length>1 && <button onClick={() => onChange({ ...content, points:pts.filter((_,x)=>x!==i) })} style={ctrlX()}>✕</button>}
            </div>
          ))}
          <button onClick={() => onChange({ ...content, points:[...pts,""] })} style={addX()}>+ Add point</button>
        </div>
      </div>
    </div>
  );
}

function CalloutE({ content, onChange }) {
  const styles = [["info","💡 Info","#0891b2"],["warning","⚠️ Warning","#d97706"],["success","✅ Tip","#059669"],["error","❌ Note","#dc2626"]];
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:12, paddingTop:12 }}>
      <div style={{ display:"flex", gap:6 }}>
        {styles.map(([v,l,col]) => <button key={v} onClick={() => onChange({ ...content, style:v })} style={{ ...pill(content.style===v,col), flex:1, fontSize:11 }}>{l}</button>)}
      </div>
      <textarea value={content.text||""} onChange={e => onChange({ ...content, text:e.target.value })} placeholder="Callout message..." style={{ ...inp(), minHeight:80, resize:"vertical" }}/>
    </div>
  );
}

function DividerE({ content, onChange }) {
  const styles = [["line","Line"],["dots","Dots"],["space","Space"]];
  return (
    <div style={{ display:"flex", gap:6, paddingTop:12 }}>
      {styles.map(([v,l]) => <button key={v} onClick={() => onChange({ ...content, style:v })} style={{ ...pill(content.style===v,"#64748b"), flex:1 }}>{l}</button>)}
    </div>
  );
}

// ── shared styles ──
const inp = () => ({ width:"100%", padding:"9px 12px", borderRadius:9, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box", fontFamily:"inherit" });
const lbl = () => ({ fontSize:11, fontWeight:700, color:"#374151", display:"block", marginBottom:6, textTransform:"uppercase", letterSpacing:0.5 });
const pill = (active,color) => ({ padding:"7px 14px", borderRadius:8, border:`1.5px solid ${active?color:"#E2E8F0"}`, background:active?color+"15":"#fff", color:active?color:"#64748B", fontSize:12, fontWeight:700, cursor:"pointer" });
const mediaBtn = (color) => ({ display:"flex", alignItems:"center", justifyContent:"center", gap:8, padding:"12px", borderRadius:11, border:`1.5px dashed ${color}50`, background:color+"08", color, fontSize:13, fontWeight:700, cursor:"pointer", width:"100%" });
const ctrlX = () => ({ width:28, height:28, borderRadius:8, border:"1.5px solid #FEE2E2", background:"#fff", color:"#EF4444", cursor:"pointer", flexShrink:0, fontSize:12 });
const addX = () => ({ padding:"8px", borderRadius:9, border:"1.5px dashed #E2E8F0", background:"#F8FAFC", color:"#94A3B8", fontSize:12, fontWeight:600, cursor:"pointer" });
```

### `components/admin/builder/LessonBuilder.jsx`
```jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import {
  ChevronLeft, Save, Check, Plus, Trash2, GripVertical, Eye, EyeOff,
  Loader, Copy, Settings2
} from "lucide-react";
import { supabase } from "@/lib/supabase";
import MediaLibrary from "@/components/admin/builder/MediaLibrary";
import { BLOCK_DEFS, BlockEditor, BlockPreview } from "@/components/admin/builder/blocks";

export default function LessonBuilder({ lessonId, lessonTitle, backTo }) {
  const router = useRouter();
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showPicker, setShowPicker] = useState(false);
  const [insertIdx, setInsertIdx] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [previewMode, setPreviewMode] = useState(false);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 6 } }));

  useEffect(() => { load(); }, [lessonId]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("lesson_content")
      .select("*")
      .eq("lesson_id", lessonId)
      .order("order_index");
    setBlocks((data || []).map(b => ({ ...b, content: b.content || {} })));
    setLoading(false);
  };

  const addBlock = (type) => {
    const block = {
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      lesson_id: lessonId,
      type,
      content: { ...BLOCK_DEFS[type].default },
      order_index: insertIdx !== null ? insertIdx : blocks.length,
      isNew: true,
    };
    if (insertIdx !== null) {
      const next = [...blocks];
      next.splice(insertIdx, 0, block);
      setBlocks(next);
    } else {
      setBlocks(prev => [...prev, block]);
    }
    setActiveId(block.id);
    setShowPicker(false);
    setInsertIdx(null);
  };

  const updateBlock = (id, content) =>
    setBlocks(prev => prev.map(b => b.id === id ? { ...b, content } : b));

  const deleteBlock = async (id) => {
    if (!id.startsWith("new-")) await supabase.from("lesson_content").delete().eq("id", id);
    setBlocks(prev => prev.filter(b => b.id !== id));
    if (activeId === id) setActiveId(null);
  };

  const duplicateBlock = (id) => {
    const idx = blocks.findIndex(b => b.id === id);
    const orig = blocks[idx];
    const copy = {
      ...orig,
      id: `new-${Date.now()}-${Math.random().toString(36).slice(2,7)}`,
      content: JSON.parse(JSON.stringify(orig.content)),
      isNew: true,
    };
    const next = [...blocks];
    next.splice(idx + 1, 0, copy);
    setBlocks(next);
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const oldIdx = blocks.findIndex(b => b.id === active.id);
    const newIdx = blocks.findIndex(b => b.id === over.id);
    setBlocks(arrayMove(blocks, oldIdx, newIdx));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      // Re-index and persist
      for (let i = 0; i < blocks.length; i++) {
        const b = blocks[i];
        const row = { lesson_id: lessonId, type: b.type, content: b.content, order_index: i };
        if (b.isNew || b.id.startsWith("new-")) {
          const { data } = await supabase.from("lesson_content").insert(row).select().single();
          if (data) setBlocks(prev => prev.map(x => x.id === b.id ? { ...data } : x));
        } else {
          await supabase.from("lesson_content").update(row).eq("id", b.id);
        }
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e) {
      alert("Save error: " + e.message);
    }
    setSaving(false);
  };

  return (
    <div style={{ minHeight:"100vh", background:"#F1F5F9", display:"flex", flexDirection:"column" }}>

      {/* ── Top bar ── */}
      <div style={{ background:"#0f172a", padding:"0 20px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", flexShrink:0, position:"sticky", top:0, zIndex:50 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <button onClick={() => router.push(backTo)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.12)", background:"rgba(255,255,255,0.06)", color:"rgba(255,255,255,0.8)", fontSize:13, fontWeight:600, cursor:"pointer" }}>
            <ChevronLeft size={15}/> Back
          </button>
          <div>
            <p style={{ color:"rgba(255,255,255,0.4)", fontSize:10, fontWeight:700, letterSpacing:1, margin:"0 0 1px" }}>LESSON BUILDER</p>
            <h1 style={{ color:"#fff", fontSize:15, fontWeight:800, margin:0 }}>{lessonTitle}</h1>
          </div>
        </div>

        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <span style={{ color:"rgba(255,255,255,0.4)", fontSize:12 }}>{blocks.length} block{blocks.length!==1?"s":""}</span>
          <button onClick={() => setPreviewMode(!previewMode)} style={{ display:"flex", alignItems:"center", gap:6, padding:"8px 14px", borderRadius:10, border:"1px solid rgba(255,255,255,0.12)", background:previewMode?"rgba(167,139,250,0.2)":"rgba(255,255,255,0.06)", color:previewMode?"#a78bfa":"rgba(255,255,255,0.8)", fontSize:13, fontWeight:600, cursor:"pointer" }}>
            {previewMode ? <EyeOff size={14}/> : <Eye size={14}/>}
            {previewMode ? "Editing" : "Full Preview"}
          </button>
          <button onClick={saveAll} disabled={saving} style={{ display:"flex", alignItems:"center", gap:7, padding:"9px 20px", borderRadius:10, border:"none", background:saved?"#22c55e":"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:saved?"0 4px 14px rgba(34,197,94,0.4)":"0 4px 14px rgba(124,58,237,0.4)" }}>
            {saving ? <><Loader size={14} className="bspin"/> Saving...</> : saved ? <><Check size={14}/> Saved!</> : <><Save size={14}/> Save</>}
          </button>
        </div>
      </div>

      {/* ── Body: split screen ── */}
      <div style={{ flex:1, display:"flex", overflow:"hidden" }}>

        {/* LEFT: editor (hidden in full preview) */}
        {!previewMode && (
          <div style={{ flex:1, overflow:"auto", padding:"24px 28px", borderRight:"1px solid #E2E8F0" }}>
            <div style={{ maxWidth:560, margin:"0 auto" }}>

              {loading ? (
                <div style={{ textAlign:"center", padding:60, color:"#94A3B8" }}>
                  <Loader size={28} className="bspin" style={{ margin:"0 auto 12px" }}/>
                  <p>Loading content...</p>
                </div>
              ) : (
                <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
                  <InsertLine onClick={() => { setInsertIdx(0); setShowPicker(true); }} />
                  <SortableContext items={blocks.map(b => b.id)} strategy={verticalListSortingStrategy}>
                    {blocks.map((block, idx) => (
                      <div key={block.id}>
                        <SortableBlock
                          block={block}
                          isActive={activeId === block.id}
                          onToggle={() => setActiveId(activeId === block.id ? null : block.id)}
                          onChange={c => updateBlock(block.id, c)}
                          onDelete={() => deleteBlock(block.id)}
                          onDuplicate={() => duplicateBlock(block.id)}
                        />
                        <InsertLine onClick={() => { setInsertIdx(idx + 1); setShowPicker(true); }} />
                      </div>
                    ))}
                  </SortableContext>

                  {blocks.length === 0 && (
                    <div style={{ textAlign:"center", padding:"48px 20px", background:"#fff", borderRadius:20, border:"2px dashed #CBD5E1", marginTop:8 }}>
                      <div style={{ fontSize:48, marginBottom:12 }}>🎨</div>
                      <h3 style={{ fontSize:17, fontWeight:800, color:"#0f172a", margin:"0 0 6px" }}>Build your lesson</h3>
                      <p style={{ fontSize:13, color:"#94A3B8", margin:"0 0 20px" }}>Add text, images, video, audio, quizzes and more</p>
                      <button onClick={() => { setInsertIdx(0); setShowPicker(true); }} style={{ padding:"11px 26px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", color:"#fff", fontSize:14, fontWeight:700, cursor:"pointer" }}>
                        + Add First Block
                      </button>
                    </div>
                  )}
                </DndContext>
              )}
            </div>
          </div>
        )}

        {/* RIGHT: live preview */}
        <div style={{ flex:previewMode ? 1 : "0 0 42%", overflow:"auto", padding:"24px 28px", background:previewMode?"#fff":"#FAFBFC" }}>
          <div style={{ maxWidth:previewMode?640:420, margin:"0 auto" }}>
            {!previewMode && (
              <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:16, padding:"8px 14px", background:"#EEF2FF", borderRadius:10 }}>
                <Eye size={13} color="#6366f1"/>
                <span style={{ fontSize:12, fontWeight:600, color:"#6366f1" }}>Live Preview</span>
              </div>
            )}
            <div style={{ display:"flex", flexDirection:"column", gap:22 }}>
              {blocks.map(block => <BlockPreview key={block.id} block={block} />)}
              {blocks.length === 0 && (
                <p style={{ textAlign:"center", color:"#CBD5E1", padding:40, fontSize:14 }}>Your lesson preview appears here</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* ── Block picker ── */}
      {showPicker && (
        <div onClick={() => setShowPicker(false)} style={{ position:"fixed", inset:0, zIndex:300, display:"flex", alignItems:"center", justifyContent:"center", padding:20, background:"rgba(15,23,42,0.6)", backdropFilter:"blur(4px)" }}>
          <div onClick={e => e.stopPropagation()} style={{ background:"#fff", borderRadius:24, padding:24, width:"100%", maxWidth:620, boxShadow:"0 32px 80px rgba(0,0,0,0.3)" }}>
            <h3 style={{ fontSize:17, fontWeight:800, color:"#0f172a", margin:"0 0 4px" }}>Add a block</h3>
            <p style={{ fontSize:13, color:"#94A3B8", margin:"0 0 20px" }}>Choose content to add to your lesson</p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:10 }}>
              {Object.entries(BLOCK_DEFS).map(([type, def]) => (
                <button key={type} onClick={() => addBlock(type)} style={{ padding:"16px 12px", borderRadius:14, border:`1.5px solid ${def.color}25`, background:def.bg, cursor:"pointer", display:"flex", flexDirection:"column", alignItems:"center", gap:6, transition:"all 0.15s" }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor=def.color; e.currentTarget.style.transform="translateY(-2px)"; e.currentTarget.style.boxShadow=`0 6px 16px ${def.color}25`; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor=`${def.color}25`; e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="none"; }}>
                  <span style={{ fontSize:26 }}>{def.icon}</span>
                  <span style={{ fontSize:12, fontWeight:700, color:def.color }}>{def.label}</span>
                  <span style={{ fontSize:10, color:"#94A3B8", textAlign:"center", lineHeight:1.3 }}>{def.desc}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <style>{`.bspin { animation: bspin 0.8s linear infinite; } @keyframes bspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

// ── Sortable block wrapper ──
function SortableBlock({ block, isActive, onToggle, onChange, onDelete, onDuplicate }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id });
  const def = BLOCK_DEFS[block.type] || { icon:"❓", label:"Unknown", color:"#64748B", bg:"#F8FAFC", preview:()=>"Unknown block type" };

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  return (
    <div ref={setNodeRef} style={{ ...style, background:"#fff", borderRadius:16, border:`1.5px solid ${isActive?def.color+"60":"#E2E8F0"}`, overflow:"hidden", boxShadow:isActive?`0 4px 20px ${def.color}15`:"0 1px 3px rgba(0,0,0,0.04)", marginBottom:2 }}>
      {/* Header */}
      <div style={{ display:"flex", alignItems:"center", gap:10, padding:"11px 12px", background:isActive?def.bg:"#fff" }}>
        <button {...attributes} {...listeners} style={{ cursor:"grab", border:"none", background:"none", padding:2, display:"flex", touchAction:"none" }}>
          <GripVertical size={16} color="#CBD5E1"/>
        </button>
        <span style={{ fontSize:18 }} onClick={onToggle}>{def.icon}</span>
        <div style={{ flex:1, minWidth:0, cursor:"pointer" }} onClick={onToggle}>
          <p style={{ fontSize:13, fontWeight:700, color:def.color, margin:0 }}>{def.label}</p>
          <p style={{ fontSize:11, color:"#94A3B8", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{def.preview(block.content)}</p>
        </div>
        <div style={{ display:"flex", gap:4 }}>
          <button onClick={onDuplicate} title="Duplicate" style={ctrl()}><Copy size={12}/></button>
          <button onClick={onDelete} title="Delete" style={{ ...ctrl(), color:"#EF4444", borderColor:"#FEE2E2" }}><Trash2 size={12}/></button>
        </div>
      </div>
      {/* Editor */}
      {isActive && (
        <div style={{ padding:"4px 14px 16px", borderTop:`1px solid ${def.color}20` }}>
          <BlockEditor block={block} onChange={onChange} />
        </div>
      )}
    </div>
  );
}

// ── Insert line between blocks ──
function InsertLine({ onClick }) {
  const [hover, setHover] = useState(false);
  return (
    <div onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}
      style={{ display:"flex", alignItems:"center", gap:8, height:24, opacity:hover?1:0.35, transition:"opacity 0.15s", cursor:"pointer" }}
      onClick={onClick}>
      <div style={{ flex:1, height:1, background:hover?"#a78bfa":"#E2E8F0" }}/>
      <div style={{ width:24, height:24, borderRadius:"50%", border:`1.5px solid ${hover?"#7c3aed":"#CBD5E1"}`, background:hover?"#7c3aed":"#fff", color:hover?"#fff":"#94A3B8", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
        <Plus size={13}/>
      </div>
      <div style={{ flex:1, height:1, background:hover?"#a78bfa":"#E2E8F0" }}/>
    </div>
  );
}

const ctrl = () => ({ width:26, height:26, borderRadius:7, border:"1.5px solid #E2E8F0", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center", color:"#64748B" });
```

### `components/challenges/ChallengePage.jsx`
```jsx
"use client";
import ChallengeReviews from "@/components/challenges/ChallengeReviews";
import ChallengeLeaderboard from "@/components/challenges/ChallengeLeaderboard";
import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ChevronLeft, Clock, Star, X, Check } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";

function BadgeSeal({ size=80, color="#22C55E" }) {
  return (
    <svg width={size} height={size} viewBox="0 0 80 80" fill="none">
      <path d="M40 4 L46 14 L57 10 L58 22 L70 22 L66 33 L77 40 L66 47 L70 58 L58 58 L57 70 L46 66 L40 76 L34 66 L23 70 L22 58 L10 58 L14 47 L3 40 L14 33 L10 22 L22 22 L23 10 L34 14 Z" fill={color}/>
      <path d="M26 40 L35 50 L54 30" stroke="white" strokeWidth="5.5" strokeLinecap="round" strokeLinejoin="round"/>
    </svg>
  );
}

export default function ChallengePage({ challenge }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { joinChallenge, hasJoinedChallenge, getChallengeCompletedDays, resetChallenge } = useProgress();

  const showWelcome      = searchParams.get("showWelcome") === "true";
  const isJoinedParam    = searchParams.get("joined") === "true";
  const dayCompleteParam = searchParams.get("dayComplete");

  const [phase, setPhase] = useState("loading");
  const [rating, setRating] = useState(0);
  const [activeTab, setActiveTab] = useState("overview");

  const completedDaysList = getChallengeCompletedDays(challenge.id);
  const completedDays = new Set(completedDaysList);
  const totalDays = challenge.challengeDays?.length || 0;
  const currentDay = Math.min(completedDaysList.length + 1, totalDays);
  const progress = totalDays > 0 ? Math.round((completedDaysList.length / totalDays) * 100) : 0;

  useEffect(() => {
    if (showWelcome)           { setPhase("joined"); return; }
    if (dayCompleteParam)      { setPhase("dayComplete"); return; }
    if (isJoinedParam || hasJoinedChallenge(challenge.id)) { setPhase("tracker"); return; }
    setPhase("detail");
  }, [showWelcome, dayCompleteParam, isJoinedParam, hasJoinedChallenge(challenge.id)]);

  const handleJoin = () => {
    joinChallenge(challenge.id);
    router.push(`/challenges/${challenge.id}/day/1`);
  };

  const handleGoToDay = (day) => router.push(`/challenges/${challenge.id}/day/${day}`);

  // ── Loading ──
  if (phase === "loading") {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"/>
      </div>
    );
  }

  // ── You Rock (just joined) ──
  if (phase === "joined") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex items-center px-5 h-14">
          <button onClick={() => router.push(`/challenges/${challenge.id}?joined=true`)} className="p-2 hover:bg-gray-100 rounded-xl">
            <X size={20} className="text-gray-600"/>
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <BadgeSeal size={100}/>
          <h2 className="text-3xl font-bold text-gray-900 mt-6 mb-3">You rock!</h2>
          <p className="text-gray-500 text-base leading-relaxed max-w-sm">
            Welcome to the {challenge.title}!<br/>Can't wait to see you at the top!
          </p>
        </div>
        <div className="px-5 pb-8">
          <button onClick={() => router.push(`/challenges/${challenge.id}?joined=true`)}
            className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base">
            Let's Go
          </button>
        </div>
      </div>
    );
  }

  // ── Day Complete ──
  if (phase === "dayComplete") {
    return (
      <div className="min-h-screen bg-white flex flex-col">
        <div className="flex items-center px-5 h-14">
          <button onClick={() => router.push(`/challenges/${challenge.id}?joined=true`)} className="p-2 hover:bg-gray-100 rounded-xl">
            <X size={20} className="text-gray-600"/>
          </button>
        </div>
        <div className="flex-1 flex flex-col items-center justify-center px-8 text-center">
          <BadgeSeal size={100}/>
          <h2 className="text-2xl font-bold text-gray-900 mt-6 mb-2">Day {dayCompleteParam} complete!</h2>
          <p className="text-gray-500 text-base mb-8">Keep up the practice!</p>
        </div>
        <div className="px-5 pb-8">
          <button onClick={() => router.push(`/challenges/${challenge.id}?joined=true`)}
            className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base">
            Continue
          </button>
        </div>
      </div>
    );
  }

  // ── Detail (not joined) ──
  if (phase === "detail") {
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
          <div className="max-w-2xl mx-auto flex items-center px-5 h-14">
            <button onClick={() => router.push('/challenges')} className="p-2 hover:bg-gray-100 rounded-xl mr-4">
              <ChevronLeft size={20} className="text-gray-700"/>
            </button>
            <h1 className="flex-1 text-center font-bold text-gray-900 text-base pr-10 truncate">{challenge.title}</h1>
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-5 pb-32">
          <div className="w-full rounded-2xl flex items-center justify-center mt-6 mb-6"
            style={{ height:220, background:challenge.gradientBg, fontSize:80 }}>
            <span style={{ filter:"drop-shadow(0 4px 12px rgba(0,0,0,0.15))" }}>{challenge.emoji}</span>
          </div>

          <h2 className="text-2xl font-bold text-gray-900 mb-1">{challenge.title}</h2>
          <p className="text-gray-500 text-base mb-6">{challenge.subtitle}</p>

          <h3 className="text-lg font-bold text-gray-900 mb-3">Challenge details</h3>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <div className="border border-gray-200 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-2">Duration</p>
              <div className="flex items-center gap-2">
                <Clock size={16} className="text-primary"/>
                <span className="font-bold text-gray-900">{challenge.days} days</span>
              </div>
            </div>
            <div className="border border-gray-200 rounded-2xl p-4">
              <p className="text-xs text-gray-400 mb-2">Level</p>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary"/>
                <span className="font-bold text-gray-900">{challenge.level}</span>
              </div>
            </div>
          </div>

          <h3 className="text-lg font-bold text-gray-900 mb-3">How does it work?</h3>
          <p className="text-gray-600 leading-relaxed text-base mb-8">{challenge.description}</p>

          <ChallengeReviews challengeId={challenge.id} challengeName={challenge.title} topOnly={true}/>
        </div>

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4 z-30">
          <div className="max-w-2xl mx-auto">
            <button onClick={handleJoin}
              className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base">
              Join now
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Tracker (joined) ──
  if (phase === "tracker") {
    return (
      <div className="min-h-screen bg-white">
        <div className="sticky top-0 z-40 bg-white border-b border-gray-100">
          <div className="max-w-2xl mx-auto flex items-center px-5 h-14">
            <button onClick={() => router.push('/challenges')} className="p-2 hover:bg-gray-100 rounded-xl mr-4">
              <ChevronLeft size={20} className="text-gray-700"/>
            </button>
            <h1 className="flex-1 text-center font-bold text-gray-900 text-base pr-10 truncate">{challenge.title}</h1>
          </div>
        </div>

        {/* Progress bar */}
        <div className="max-w-2xl mx-auto px-5 pt-5 pb-3">
          <div className="flex justify-between text-xs text-gray-500 mb-1">
            <span>{completedDaysList.length}/{totalDays} days done</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-full rounded-full bg-primary transition-all" style={{ width:progress+"%" }}/>
          </div>
        </div>

        {/* Tabs */}
        <div className="max-w-2xl mx-auto px-5 pb-3">
          <div style={{ display:"flex", gap:6, background:"#F1F5F9", borderRadius:14, padding:4 }}>
            {[["overview","📚 Days"],["leaderboard","🏆 Leaderboard"]].map(([val,label]) => (
              <button key={val} onClick={() => setActiveTab(val)}
                style={{ flex:1, padding:"10px", borderRadius:11, border:"none",
                  background:activeTab===val?"#fff":"transparent",
                  color:activeTab===val?"#0f172a":"#64748B",
                  fontSize:13, fontWeight:700, cursor:"pointer",
                  boxShadow:activeTab===val?"0 2px 8px rgba(0,0,0,0.08)":"none" }}>
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Days list */}
        {activeTab === "overview" && (
          <div className="max-w-2xl mx-auto px-5 pb-32">
            <div className="flex flex-col gap-2">
              {challenge.challengeDays.map((d) => {
                const isDone = completedDays.has(d.day);
                const isCur = d.day === currentDay;
                const isLocked = d.day > currentDay;
                const clickable = isDone || isCur;
                return (
                  <button key={d.day}
                    onClick={() => clickable ? handleGoToDay(d.day) : null}
                    disabled={isLocked}
                    style={{ display:"flex", alignItems:"center", gap:12, padding:"14px 16px",
                      borderRadius:16, width:"100%", textAlign:"left",
                      border: isCur?"1.5px solid #5B4EFF":isDone?"1px solid #E5E7EB":"1px solid #F3F4F6",
                      background: isCur?"#F9F8FF":"#fff",
                      opacity: isLocked?0.4:1,
                      cursor: clickable?"pointer":"not-allowed" }}>
                    <div style={{ width:40,height:40,borderRadius:10,background:"linear-gradient(135deg,#EEF0FF,#E0E7FF)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:20,flexShrink:0 }}>
                      {d.emoji}
                    </div>
                    <div style={{ flex:1,minWidth:0 }}>
                      <p style={{ fontSize:13,fontWeight:700,color:"#1A1A2E",margin:0 }}>Day {d.day}:</p>
                      <p style={{ fontSize:13,color:"#6B7280",margin:0 }}>{d.topic}</p>
                    </div>
                    <div style={{ display:"flex",alignItems:"center",gap:6,flexShrink:0 }}>
                      {isDone && <span style={{ fontSize:10,color:"#22C55E",fontWeight:600,background:"#F0FDF4",padding:"2px 8px",borderRadius:20 }}>Done</span>}
                      <div style={{ width:22,height:22,borderRadius:"50%",
                        border:isDone?"none":isCur?"2px solid #5B4EFF":"2px solid #D1D5DB",
                        background:isDone?"#22C55E":isCur?"#5B4EFF":"transparent",
                        display:"flex",alignItems:"center",justifyContent:"center" }}>
                        {isDone && <Check size={10} color="#fff" strokeWidth={3}/>}
                        {isCur && !isDone && <div style={{ width:8,height:8,borderRadius:"50%",background:"#fff" }}/>}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {activeTab === "leaderboard" && (
          <div className="max-w-2xl mx-auto px-5 pb-32">
            <ChallengeLeaderboard challenge={challenge}/>
          </div>
        )}

        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-100 px-5 py-4 z-30">
          <div className="max-w-2xl mx-auto">
            <button onClick={() => handleGoToDay(currentDay)}
              className="w-full py-4 rounded-2xl bg-primary text-white font-bold text-base">
              {completedDaysList.length === 0 ? "Start Day 1" : `Continue Day ${currentDay}`}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}
```

### `components/challenges/ChallengeReviews.jsx`
```jsx
"use client";

import { useState, useEffect } from "react";
import { Loader, Check, Star } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

const LABELS = ["","Poor","Fair","Good","Very Good","Excellent!"];
const LABEL_COLORS = ["","#ef4444","#f97316","#f59e0b","#22c55e","#10b981"];

function Stars({ value, onChange, size=28, readonly=false }) {
  const [hov, setHov] = useState(0);
  const show = hov || value;
  return (
    <div style={{ display:"flex", gap:3 }}>
      {[1,2,3,4,5].map(s => (
        <button key={s}
          onClick={() => !readonly && onChange?.(s)}
          onMouseEnter={() => !readonly && setHov(s)}
          onMouseLeave={() => !readonly && setHov(0)}
          style={{ background:"none", border:"none", cursor:readonly?"default":"pointer", padding:1, lineHeight:1, transition:"transform 0.1s", transform:(!readonly&&hov===s)?"scale(1.2)":"scale(1)" }}>
          <svg width={size} height={size} viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={s<=show?"#f59e0b":"#E2E8F0"} stroke={s<=show?"#f59e0b":"#E2E8F0"} strokeWidth="1"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

const ago = d => {
  const days = Math.floor((Date.now()-new Date(d))/86400000);
  if(!days) return "Today";
  if(days===1) return "Yesterday";
  if(days<30) return days+"d ago";
  return Math.floor(days/30)+"mo ago";
};
const inits = n => n ? n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2) : "?";

export default function ChallengeReviews({ challengeId, challengeName, topOnly=false }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [myReview, setMyReview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => { load(); }, [challengeId]);

  const load = async () => {
    setLoading(true);
    const { data } = await supabase
      .from("challenge_user_reviews")
      .select("id, challenge_id, user_id, rating, review, approved, created_at")
      .eq("challenge_id", challengeId)
      .order("created_at", { ascending: false });

    const all = data || [];
    const userIds = [...new Set(all.map(r => r.user_id))];
    let profileMap = {};
    if (userIds.length > 0) {
      const { data: profiles } = await supabase
        .from("profiles").select("id, full_name, avatar_url").in("id", userIds);
      (profiles||[]).forEach(p => { profileMap[p.id] = p; });
    }

    const merged = all.map(r => ({ ...r, profile: profileMap[r.user_id] || null }));
    setReviews(merged);

    if (user) {
      const mine = merged.find(r => r.user_id === user.id);
      if (mine) { setMyReview(mine); setRating(mine.rating); setText(mine.review||""); }
    }
    setLoading(false);
  };

  const submit = async () => {
    if (!rating || !user) return;
    setSubmitting(true);
    const { error } = await supabase.from("challenge_user_reviews").upsert(
      { challenge_id:challengeId, user_id:user.id, rating, review:text.trim()||null, approved:false },
      { onConflict:"challenge_id,user_id" }
    );
    if (error) { alert(error.message); setSubmitting(false); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    await load();
    setSubmitting(false);
  };

  const approved = reviews.filter(r => r.approved === true);
  const others = approved.filter(r => r.user_id !== user?.id);
  const displayReviews = topOnly ? others.slice(0,3) : others;

  if (loading) return <div style={{padding:24,textAlign:"center"}}><Loader size={20} color="#94A3B8" className="bspin"/></div>;

  // TopOnly mode - just show 3 best reviews
  if (topOnly) {
    if (displayReviews.length === 0) return null;
    return (
      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        <h3 style={{ fontSize:18, fontWeight:900, color:"#0f172a", margin:"0 0 4px" }}>What students say</h3>
        {displayReviews.map(r => (
          <div key={r.id} style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:"16px 18px" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:r.review?10:0 }}>
              <div style={{ width:36,height:36,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:800,color:"#fff",flexShrink:0,overflow:"hidden" }}>
                {r.profile?.avatar_url ? <img src={r.profile.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/> : inits(r.profile?.full_name||"U")}
              </div>
              <div style={{ flex:1 }}>
                <p style={{ fontSize:13,fontWeight:700,color:"#0f172a",margin:"0 0 3px" }}>{r.profile?.full_name||"Student"}</p>
                <Stars value={r.rating} size={13} readonly/>
              </div>
              <span style={{ fontSize:11,color:"#94A3B8" }}>{ago(r.created_at)}</span>
            </div>
            {r.review && <p style={{ fontSize:13,color:"#374151",margin:0,lineHeight:1.6,fontStyle:"italic" }}>"{r.review}"</p>}
          </div>
        ))}
        <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
      </div>
    );
  }

  // Full review form + list (for day page)
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

      {/* My submitted review */}
      {user && myReview && (
        <div style={{ background:"#FFFBEB", borderRadius:18, border:"1.5px solid #FDE68A", padding:"18px 20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:myReview.review?10:0 }}>
            <div style={{ width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#f59e0b,#d97706)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:14,fontWeight:800,flexShrink:0 }}>
              {inits(user?.user_metadata?.full_name||user?.email)}
            </div>
            <div>
              <p style={{ fontSize:12,fontWeight:700,color:"#92400E",margin:"0 0 4px" }}>Your review</p>
              <Stars value={myReview.rating} size={15} readonly/>
            </div>
          </div>
          {myReview.review && <p style={{ fontSize:14,color:"#374151",margin:0,lineHeight:1.65,paddingTop:10,borderTop:"1px solid #FDE68A" }}>"{myReview.review}"</p>}
        </div>
      )}

      {/* Review form */}
      {user && !myReview && (
        <div style={{ background:"#fff", borderRadius:18, border:"1.5px solid #E2E8F0", overflow:"hidden" }}>
          <div style={{ background:"linear-gradient(135deg,#1e1b4b,#0f172a)", padding:"16px 22px" }}>
            <p style={{ color:"#fff",fontSize:15,fontWeight:800,margin:0 }}>Rate this challenge</p>
            <p style={{ color:"rgba(255,255,255,0.4)",fontSize:12,margin:"2px 0 0" }}>Help others decide if this challenge is right for them</p>
          </div>
          <div style={{ padding:"20px 22px", display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <p style={{ fontSize:11,fontWeight:700,color:"#374151",margin:"0 0 8px" }}>YOUR RATING</p>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <Stars value={rating} onChange={setRating} size={32}/>
                {rating > 0 && <span style={{ fontSize:14,fontWeight:700,color:LABEL_COLORS[rating] }}>{LABELS[rating]}</span>}
              </div>
            </div>
            <div>
              <p style={{ fontSize:11,fontWeight:700,color:"#374151",margin:"0 0 8px" }}>
                WRITTEN REVIEW <span style={{ color:"#94A3B8",fontWeight:400 }}>· optional</span>
              </p>
              <textarea value={text} onChange={e=>setText(e.target.value)}
                placeholder={"What did you think of " + challengeName + "?"}
                style={{ width:"100%",minHeight:90,padding:"11px 14px",borderRadius:12,border:"1.5px solid #E2E8F0",fontSize:14,resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:"inherit",lineHeight:1.6,color:"#374151" }}
                onFocus={e=>e.target.style.borderColor="#f59e0b"}
                onBlur={e=>e.target.style.borderColor="#E2E8F0"}
              />
            </div>
            <button onClick={submit} disabled={!rating||submitting}
              style={{ width:"100%",padding:"13px",borderRadius:12,border:"none",
                background:!rating?"#F1F5F9":"linear-gradient(135deg,#f59e0b,#d97706)",
                color:!rating?"#94A3B8":"#fff",fontSize:14,fontWeight:700,
                cursor:!rating?"not-allowed":"pointer",display:"flex",alignItems:"center",
                justifyContent:"center",gap:8,
                boxShadow:rating?"0 4px 14px rgba(245,158,11,0.3)":"none" }}>
              {submitting?<><Loader size={14} className="bspin"/> Submitting...</>
               :saved?<><Check size={14}/> Submitted!</>
               :"⭐ Submit Review"}
            </button>
          </div>
        </div>
      )}

      {!user && (
        <div style={{ textAlign:"center",padding:"16px",background:"#F8FAFC",borderRadius:14,border:"1.5px dashed #E2E8F0" }}>
          <p style={{ fontSize:14,color:"#64748B",margin:0 }}>
            <a href="/login" style={{ color:"#f59e0b",fontWeight:700,textDecoration:"none" }}>Sign in</a> to leave a review
          </p>
        </div>
      )}

      {/* Others reviews */}
      {others.length > 0 && (
        <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
          <h3 style={{ fontSize:15,fontWeight:800,color:"#0f172a",margin:0 }}>Reviews ({others.length})</h3>
          {others.map(r => (
            <div key={r.id} style={{ background:"#fff",borderRadius:16,border:"1.5px solid #F1F5F9",padding:"16px 18px" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:r.review?10:0 }}>
                <div style={{ width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:800,color:"#fff",flexShrink:0,overflow:"hidden" }}>
                  {r.profile?.avatar_url?<img src={r.profile.avatar_url} style={{width:"100%",height:"100%",objectFit:"cover"}} alt=""/>:inits(r.profile?.full_name||"U")}
                </div>
                <div style={{ flex:1 }}>
                  <p style={{ fontSize:13,fontWeight:700,color:"#0f172a",margin:"0 0 3px" }}>{r.profile?.full_name||"Student"}</p>
                  <Stars value={r.rating} size={14} readonly/>
                </div>
                <span style={{ fontSize:11,color:"#94A3B8" }}>{ago(r.created_at)}</span>
              </div>
              {r.review && <p style={{ fontSize:13,color:"#374151",margin:0,lineHeight:1.65,fontStyle:"italic" }}>"{r.review}"</p>}
            </div>
          ))}
        </div>
      )}

      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
```

### `components/courses/CourseReviews.jsx`
```jsx
"use client";

import { useState, useEffect } from "react";
import { Loader, Check, MessageCircle } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/lib/AuthContext";

const LABELS = ["","Poor","Fair","Good","Very Good","Excellent!"];
const LABEL_COLORS = ["","#ef4444","#f97316","#f59e0b","#22c55e","#10b981"];

function Stars({ value, onChange, size=28, readonly=false }) {
  const [hov, setHov] = useState(0);
  const show = hov || value;
  return (
    <div style={{ display:"flex", gap:3 }}>
      {[1,2,3,4,5].map(s => (
        <button key={s}
          onClick={() => !readonly && onChange?.(s)}
          onMouseEnter={() => !readonly && setHov(s)}
          onMouseLeave={() => !readonly && setHov(0)}
          style={{ background:"none", border:"none", cursor:readonly?"default":"pointer", padding:1, lineHeight:1, transition:"transform 0.1s", transform:(!readonly&&hov===s)?"scale(1.2)":"scale(1)" }}>
          <svg width={size} height={size} viewBox="0 0 24 24">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
              fill={s<=show?"#f59e0b":"#E2E8F0"} stroke={s<=show?"#f59e0b":"#E2E8F0"} strokeWidth="1"/>
          </svg>
        </button>
      ))}
    </div>
  );
}

const ago = d => {
  const days = Math.floor((Date.now()-new Date(d))/86400000);
  if(!days) return "Today";
  if(days===1) return "Yesterday";
  if(days<30) return days+"d ago";
  return Math.floor(days/30)+"mo ago";
};

const inits = n => n ? n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2) : "?";

const isApproved = r => r.approved === true;

export default function CourseReviews({ courseId, courseName }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [saved, setSaved] = useState(false);
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [myReview, setMyReview] = useState(null);

  useEffect(() => { load(); }, [courseId]);

  const load = async () => {
    setLoading(true);
    try {
      const { data: reviewData, error } = await supabase
        .from("course_reviews")
        .select("id, course_id, user_id, rating, review, created_at, updated_at, approved")
        .eq("course_id", courseId)
        .order("created_at", { ascending: false });

      if (error) { console.error(error); setLoading(false); return; }

      const all = reviewData || [];

      // Fetch profiles
      const userIds = [...new Set(all.map(r => r.user_id))];
      let profileMap = {};
      if (userIds.length > 0) {
        const { data: profileData } = await supabase
          .from("profiles")
          .select("id, full_name, avatar_url")
          .in("id", userIds);
        (profileData || []).forEach(p => { profileMap[p.id] = p; });
      }

      const merged = all.map(r => ({ ...r, profiles: profileMap[r.user_id] || null }));
      setReviews(merged);

      if (user) {
        const mine = merged.find(r => r.user_id === user.id);
        if (mine) { setMyReview(mine); setRating(mine.rating); setText(mine.review || ""); }
        else { setMyReview(null); }
      }
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  const submit = async () => {
    if (!rating || !user) return;
    setSubmitting(true);
    const { error } = await supabase.from("course_reviews").upsert(
      { course_id: courseId, user_id: user.id, rating, review: text.trim() || null, approved: false, updated_at: new Date().toISOString() },
      { onConflict: "course_id,user_id" }
    );
    if (error) { alert("Error: " + error.message); setSubmitting(false); return; }
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
    await load();
    setSubmitting(false);
  };

  // Only approved reviews from others
  const others = reviews.filter(r => r.user_id !== user?.id && r.approved === true);
  const approvedOnly = reviews.filter(r => isApproved(r));
  const total = approvedOnly.length;
  const avg = total ? approvedOnly.reduce((s,r) => s+r.rating, 0) / total : 0;
  const dist = [5,4,3,2,1].map(s => ({
    star: s,
    count: approvedOnly.filter(r => r.rating===s).length,
    pct: total ? Math.round(approvedOnly.filter(r => r.rating===s).length/total*100) : 0,
  }));

  if (loading) return <div style={{padding:40,textAlign:"center"}}><Loader size={22} color="#94A3B8" className="bspin"/></div>;

  return (
    <div style={{ display:"flex", flexDirection:"column", gap:20, paddingBottom:40 }}>

      {/* Aggregate */}
      {total > 0 && (
        <div style={{ background:"#0f172a", borderRadius:20, padding:"24px 28px", display:"flex", gap:28, alignItems:"center" }}>
          <div style={{ textAlign:"center", flexShrink:0 }}>
            <p style={{ fontSize:52, fontWeight:900, color:"#fff", margin:0, lineHeight:1 }}>{avg.toFixed(1)}</p>
            <div style={{ margin:"8px 0 6px" }}><Stars value={Math.round(avg)} size={16} readonly/></div>
            <p style={{ fontSize:12, color:"rgba(255,255,255,0.4)", margin:0 }}>{total} review{total!==1?"s":""}</p>
          </div>
          <div style={{ flex:1, display:"flex", flexDirection:"column", gap:6 }}>
            {dist.map(({star,count,pct}) => (
              <div key={star} style={{ display:"flex", alignItems:"center", gap:8 }}>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.4)", width:8 }}>{star}</span>
                <svg width={12} height={12} viewBox="0 0 24 24" style={{flexShrink:0}}>
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" fill="#f59e0b"/>
                </svg>
                <div style={{ flex:1, height:6, background:"rgba(255,255,255,0.08)", borderRadius:999, overflow:"hidden" }}>
                  <div style={{ height:"100%", borderRadius:999, background:"linear-gradient(to right,#f59e0b,#fbbf24)", width:pct+"%", transition:"width 0.5s" }}/>
                </div>
                <span style={{ fontSize:11, color:"rgba(255,255,255,0.3)", width:16, textAlign:"right" }}>{count}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Your submitted review */}
      {user && myReview && (
        <div style={{ background:"#FFFBEB", borderRadius:18, border:"1.5px solid #FDE68A", padding:"18px 20px" }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:10 }}>
            <div style={{ width:38,height:38,borderRadius:"50%",background:"linear-gradient(135deg,#f59e0b,#d97706)",display:"flex",alignItems:"center",justifyContent:"center",color:"#fff",fontSize:14,fontWeight:800,flexShrink:0 }}>
              {inits(user?.user_metadata?.full_name || user?.email)}
            </div>
            <div>
              <p style={{ fontSize:12,fontWeight:700,color:"#92400E",margin:"0 0 4px" }}>Your review</p>
              <Stars value={myReview.rating} size={15} readonly/>
            </div>
          </div>
          {myReview.review && (
            <p style={{ fontSize:14,color:"#374151",margin:0,lineHeight:1.65,paddingTop:10,borderTop:"1px solid #FDE68A" }}>
              "{myReview.review}"
            </p>
          )}
        </div>
      )}

      {/* Review form — only if no existing review */}
      {user && !myReview && (
        <div style={{ background:"#fff", borderRadius:18, border:"1.5px solid #E2E8F0", overflow:"hidden" }}>
          <div style={{ background:"linear-gradient(135deg,#1e1b4b,#0f172a)", padding:"16px 22px" }}>
            <p style={{ color:"#fff",fontSize:15,fontWeight:800,margin:0 }}>Rate this course</p>
            <p style={{ color:"rgba(255,255,255,0.4)",fontSize:12,margin:"2px 0 0" }}>Your feedback helps other learners</p>
          </div>
          <div style={{ padding:"20px 22px", display:"flex", flexDirection:"column", gap:16 }}>
            <div>
              <p style={{ fontSize:11,fontWeight:700,color:"#374151",margin:"0 0 8px",letterSpacing:0.5 }}>YOUR RATING</p>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <Stars value={rating} onChange={setRating} size={32}/>
                {rating > 0 && <span style={{ fontSize:14,fontWeight:700,color:LABEL_COLORS[rating] }}>{LABELS[rating]}</span>}
              </div>
            </div>
            <div>
              <p style={{ fontSize:11,fontWeight:700,color:"#374151",margin:"0 0 8px",letterSpacing:0.5 }}>
                WRITTEN REVIEW <span style={{ color:"#94A3B8",fontWeight:400,textTransform:"none",letterSpacing:0 }}>· optional</span>
              </p>
              <textarea value={text} onChange={e => setText(e.target.value)}
                placeholder={"What did you think of " + courseName + "?"}
                style={{ width:"100%",minHeight:90,padding:"11px 14px",borderRadius:12,border:"1.5px solid #E2E8F0",fontSize:14,resize:"vertical",outline:"none",boxSizing:"border-box",fontFamily:"inherit",lineHeight:1.6,color:"#374151" }}
                onFocus={e => e.target.style.borderColor="#f59e0b"}
                onBlur={e => e.target.style.borderColor="#E2E8F0"}
              />
            </div>
            <button onClick={submit} disabled={!rating || submitting}
              style={{ width:"100%",padding:"13px",borderRadius:12,border:"none",
                background:!rating?"#F1F5F9":"linear-gradient(135deg,#f59e0b,#d97706)",
                color:!rating?"#94A3B8":"#fff",
                fontSize:14,fontWeight:700,cursor:!rating?"not-allowed":"pointer",
                display:"flex",alignItems:"center",justifyContent:"center",gap:8,
                boxShadow:rating?"0 4px 14px rgba(245,158,11,0.3)":"none",transition:"all 0.15s" }}>
              {submitting ? <><Loader size={14} className="bspin"/> Submitting...</>
               : saved ? <><Check size={14}/> Submitted!</>
               : "⭐ Submit Review"}
            </button>
          </div>
        </div>
      )}

      {!user && (
        <div style={{ textAlign:"center",padding:"20px",background:"#F8FAFC",borderRadius:14,border:"1.5px dashed #E2E8F0" }}>
          <p style={{ fontSize:14,color:"#64748B",margin:0 }}>
            <a href="/login" style={{ color:"#f59e0b",fontWeight:700,textDecoration:"none" }}>Sign in</a> to leave a review
          </p>
        </div>
      )}

      {/* Approved reviews from others */}
      {others.length > 0 && (
        <div>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:14 }}>
            <MessageCircle size={16} color="#94A3B8"/>
            <h3 style={{ fontSize:15,fontWeight:800,color:"#0f172a",margin:0 }}>All Reviews ({others.length})</h3>
          </div>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {others.map(r => (
              <div key={r.id} style={{ background:"#fff",borderRadius:16,border:"1.5px solid #F1F5F9",padding:"16px 20px",transition:"all 0.15s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor="#FDE68A"; e.currentTarget.style.boxShadow="0 3px 12px rgba(0,0,0,0.06)"; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor="#F1F5F9"; e.currentTarget.style.boxShadow="none"; }}>
                <div style={{ display:"flex", alignItems:"flex-start", gap:12 }}>
                  <div style={{ width:40,height:40,borderRadius:"50%",background:"linear-gradient(135deg,#7c3aed,#4f46e5)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:15,fontWeight:800,color:"#fff",flexShrink:0,overflow:"hidden" }}>
                    {r.profiles?.avatar_url
                      ? <img src={r.profiles.avatar_url} alt="" style={{width:"100%",height:"100%",objectFit:"cover"}}/>
                      : inits(r.profiles?.full_name || "User")}
                  </div>
                  <div style={{ flex:1,minWidth:0 }}>
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:5 }}>
                      <div>
                        <p style={{ fontSize:14,fontWeight:700,color:"#0f172a",margin:"0 0 3px" }}>{r.profiles?.full_name || "Student"}</p>
                        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                          <Stars value={r.rating} size={14} readonly/>
                          <span style={{ fontSize:12,fontWeight:700,color:LABEL_COLORS[r.rating] }}>{LABELS[r.rating]}</span>
                        </div>
                      </div>
                      <span style={{ fontSize:11,color:"#94A3B8",flexShrink:0 }}>{ago(r.created_at)}</span>
                    </div>
                    {r.review && (
                      <p style={{ fontSize:13,color:"#374151",margin:"10px 0 0",lineHeight:1.65,paddingTop:10,borderTop:"1px solid #F8FAFC" }}>
                        "{r.review}"
                      </p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {total === 0 && !myReview && (
        <div style={{ textAlign:"center",padding:"40px 20px",background:"#fff",borderRadius:18,border:"2px dashed #E2E8F0" }}>
          <div style={{ fontSize:40,marginBottom:12 }}>⭐</div>
          <p style={{ fontSize:15,fontWeight:800,color:"#0f172a",margin:"0 0 4px" }}>No reviews yet</p>
          <p style={{ fontSize:13,color:"#94A3B8",margin:0 }}>Be the first to review this course</p>
        </div>
      )}

      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}
```

### `components/admin/AdminReviews.jsx`
```jsx
"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Check, X, Trash2, Star, Loader, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminReviews() {
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("pending");

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/reviews');
      const data = await res.json();
      setReviews(data || []);
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  const approve = async (id) => {
    const review = reviews.find(r => r.id === id);
    await fetch('/api/admin/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved: true, reviewType: review?.reviewType })
    });
    setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: true } : r));
  };

  const reject = async (id) => {
    const review = reviews.find(r => r.id === id);
    await fetch('/api/admin/reviews', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, approved: false, reviewType: review?.reviewType })
    });
    setReviews(prev => prev.map(r => r.id === id ? { ...r, approved: false } : r));
  };

  const del = async (id) => {
    if (!confirm("Delete this review permanently?")) return;
    const review = reviews.find(r => r.id === id);
    await fetch('/api/admin/reviews', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, reviewType: review?.reviewType })
    });
    setReviews(prev => prev.filter(r => r.id !== id));
  };

  const filtered = reviews.filter(r =>
    filter === "all" ? true :
    filter === "pending" ? !r.approved :
    r.approved
  );

  const pending = reviews.filter(r => !r.approved).length;
  const approved = reviews.filter(r => r.approved).length;

  const inits = (n) => n ? n.split(" ").map(x=>x[0]).join("").toUpperCase().slice(0,2) : "?";

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Reviews</h1>
            <p style={{ color:"#64748B", fontSize:14, marginTop:4 }}>
              {pending > 0 && <span style={{ color:"#f97316", fontWeight:700 }}>{pending} pending approval · </span>}
              {approved} approved · {reviews.length} total
            </p>
          </div>
        </div>

        {/* Filter tabs */}
        <div style={{ display:"flex", gap:4, background:"#F1F5F9", borderRadius:12, padding:3, width:"fit-content" }}>
          {[["pending","⏳ Pending"], ["approved","✅ Approved"], ["all","All"]].map(([val,label]) => (
            <button key={val} onClick={() => setFilter(val)} style={{ padding:"8px 16px", borderRadius:9, border:"none", background:filter===val?"#fff":"transparent", color:filter===val?"#0f172a":"#64748B", fontSize:13, fontWeight:600, cursor:"pointer", boxShadow:filter===val?"0 1px 4px rgba(0,0,0,0.08)":"none" }}>
              {label}
            </button>
          ))}
        </div>

        {/* Reviews list */}
        {loading ? (
          <div style={{ padding:60, textAlign:"center" }}><Loader size={24} color="#94A3B8" className="bspin"/></div>
        ) : filtered.length === 0 ? (
          <div style={{ textAlign:"center", padding:"48px 20px", background:"#fff", borderRadius:20, border:"2px dashed #E2E8F0" }}>
            <MessageSquare size={32} color="#E2E8F0" style={{ margin:"0 auto 12px" }}/>
            <p style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 4px" }}>No reviews</p>
            <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>
              {filter === "pending" ? "All reviews have been reviewed" : "No reviews found"}
            </p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {filtered.map(r => (
              <div key={r.id} style={{ background:"#fff", borderRadius:18, border:`1.5px solid ${r.approved?"#E2E8F0":"#FED7AA"}`, padding:"18px 22px", boxShadow:"0 2px 8px rgba(0,0,0,0.04)" }}>

                {/* Status badge */}
                {!r.approved && (
                  <div style={{ display:"inline-flex", alignItems:"center", gap:5, background:"#FFF7ED", border:"1.5px solid #FED7AA", borderRadius:999, padding:"3px 10px", marginBottom:12 }}>
                    <div style={{ width:6, height:6, borderRadius:"50%", background:"#f97316" }}/>
                    <span style={{ fontSize:11, fontWeight:700, color:"#c2410c" }}>Pending Approval</span>
                  </div>
                )}

                <div style={{ display:"flex", alignItems:"flex-start", gap:14 }}>
                  {/* Avatar */}
                  <div style={{ width:44, height:44, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:15, fontWeight:800, flexShrink:0, overflow:"hidden" }}>
                    {r.profile?.avatar_url
                      ? <img src={r.profile.avatar_url} style={{ width:"100%", height:"100%", objectFit:"cover" }} alt=""/>
                      : inits(r.profile?.full_name || r.profile?.email)}
                  </div>

                  <div style={{ flex:1, minWidth:0 }}>
                    {/* Name + course + stars */}
                    <div style={{ display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:12, flexWrap:"wrap" }}>
                      <div>
                        <p style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:"0 0 2px" }}>
                          {r.profile?.full_name || r.profile?.email || "Unknown user"}
                        </p>
                        <p style={{ fontSize:12, color:"#94A3B8", margin:"0 0 6px" }}>
                          {r.course?.emoji} {r.course?.title || r.course_id}
                        </p>
                        {/* Stars */}
                        <div style={{ display:"flex", gap:2 }}>
                          {[1,2,3,4,5].map(s => (
                            <svg key={s} width={14} height={14} viewBox="0 0 24 24">
                              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"
                                fill={s<=r.rating?"#f59e0b":"#E2E8F0"} stroke={s<=r.rating?"#f59e0b":"#E2E8F0"} strokeWidth="1"/>
                            </svg>
                          ))}
                          <span style={{ fontSize:12, color:"#64748B", marginLeft:4 }}>{r.rating}/5</span>
                        </div>
                      </div>

                      {/* Actions */}
                      <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                        {!r.approved ? (
                          <button onClick={() => approve(r.id)} style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 14px", borderRadius:10, border:"none", background:"#22c55e", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer", boxShadow:"0 2px 8px rgba(34,197,94,0.3)" }}>
                            <Check size={13}/> Approve
                          </button>
                        ) : (
                          <button onClick={() => reject(r.id)} style={{ display:"flex", alignItems:"center", gap:5, padding:"8px 14px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff", color:"#64748B", fontSize:12, fontWeight:600, cursor:"pointer" }}>
                            <X size={13}/> Unapprove
                          </button>
                        )}
                        <button onClick={() => del(r.id)} style={{ width:34, height:34, borderRadius:9, border:"1.5px solid #FEE2E2", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <Trash2 size={13} color="#EF4444"/>
                        </button>
                      </div>
                    </div>

                    {/* Review text */}
                    {r.review && (
                      <p style={{ fontSize:14, color:"#374151", margin:"12px 0 0", lineHeight:1.65, padding:"12px 14px", background:"#F8FAFC", borderRadius:10 }}>
                        "{r.review}"
                      </p>
                    )}

                    <p style={{ fontSize:11, color:"#94A3B8", margin:"8px 0 0" }}>
                      {new Date(r.created_at).toLocaleDateString("en-US", { year:"numeric", month:"short", day:"numeric" })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}
```

### `components/admin/AdminUsers.jsx`
```jsx
"use client";

import { useEffect, useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Search, Shield, ShieldOff, Trash2, Users, Loader } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState(null);

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("id, full_name, email, is_admin, created_at, avatar_url")
        .order("created_at", { ascending: false });
      if (error) console.error("Users error:", error);
      setUsers(data || []);
    } catch(e) {
      console.error(e);
    }
    setLoading(false);
  };

  const toggleAdmin = async (id, current) => {
    await fetch('/api/admin/users', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id, is_admin: !current })
    });
    setUsers(prev => prev.map(u => u.id === id ? { ...u, is_admin: !current } : u));
  };

  const deleteUser = async (id) => {
    if (!confirm("Delete this user permanently?")) return;
    await fetch('/api/admin/users', {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id })
    });
    setUsers(prev => prev.filter(u => u.id !== id));
  };

  const timeAgo = (d) => {
    const days = Math.floor((Date.now()-new Date(d).getTime())/86400000);
    if (days===0) return "Today";
    if (days===1) return "Yesterday";
    if (days<30) return days+"d ago";
    return Math.floor(days/30)+"mo ago";
  };

  const filtered = users.filter(u => {
    const matchSearch = !search || (u.full_name||"").toLowerCase().includes(search.toLowerCase()) || (u.email||"").toLowerCase().includes(search.toLowerCase());
    const matchFilter = filter==="all" || (filter==="admin" && u.is_admin) || (filter==="user" && !u.is_admin);
    return matchSearch && matchFilter;
  });

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:20 }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Users</h1>
            <p style={{ color:"#64748B", fontSize:14, marginTop:4 }}>{users.length} total users</p>
          </div>
        </div>

        {/* Filters */}
        <div style={{ display:"flex", gap:12, alignItems:"center" }}>
          <div style={{ position:"relative", flex:1 }}>
            <Search size={15} color="#94A3B8" style={{ position:"absolute", left:12, top:"50%", transform:"translateY(-50%)" }}/>
            <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search by name or email..." style={{ width:"100%", paddingLeft:36, paddingRight:14, paddingTop:10, paddingBottom:10, borderRadius:12, border:"1.5px solid #E2E8F0", fontSize:13, outline:"none", boxSizing:"border-box" }}/>
          </div>
          <div style={{ display:"flex", gap:4, background:"#F1F5F9", borderRadius:12, padding:3 }}>
            {[["all","All"],["admin","Admins"],["user","Users"]].map(([val,label]) => (
              <button key={val} onClick={()=>setFilter(val)} style={{ padding:"7px 14px", borderRadius:9, border:"none", background:filter===val?"#fff":"transparent", color:filter===val?"#0f172a":"#64748B", fontSize:12, fontWeight:600, cursor:"pointer", boxShadow:filter===val?"0 1px 4px rgba(0,0,0,0.08)":"none" }}>{label}</button>
            ))}
          </div>
        </div>

        {/* Table */}
        <div style={{ background:"#fff", borderRadius:20, border:"1.5px solid #F1F5F9", overflow:"hidden" }}>
          {/* Header */}
          <div style={{ display:"grid", gridTemplateColumns:"2fr 2fr auto auto auto", gap:16, padding:"12px 20px", background:"#F8FAFC", borderBottom:"1px solid #F1F5F9" }}>
            {["Name","Email","Role","Joined","Actions"].map(h => (
              <p key={h} style={{ fontSize:11, fontWeight:700, color:"#94A3B8", margin:0, textTransform:"uppercase", letterSpacing:0.5 }}>{h}</p>
            ))}
          </div>

          {loading ? (
            <div style={{ padding:48, textAlign:"center" }}><Loader size={24} color="#94A3B8" className="bspin"/></div>
          ) : filtered.map((u, i) => (
            <div key={u.id} style={{ display:"grid", gridTemplateColumns:"2fr 2fr auto auto auto", gap:16, padding:"14px 20px", alignItems:"center", borderBottom:i<filtered.length-1?"1px solid #F8FAFC":"none" }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, minWidth:0 }}>
                <div style={{ width:34, height:34, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:13, fontWeight:700, flexShrink:0, overflow:"hidden" }}>
                  {u.avatar_url ? <img src={u.avatar_url} style={{ width:"100%", height:"100%", objectFit:"cover" }}/> : (u.full_name||"?")[0].toUpperCase()}
                </div>
                <p style={{ fontSize:13, fontWeight:600, color:"#0f172a", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.full_name||"No name"}</p>
              </div>
              <p style={{ fontSize:12, color:"#64748B", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{u.email}</p>
              <span style={{ fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:999, background:u.is_admin?"#EEF2FF":"#F8FAFC", color:u.is_admin?"#6366f1":"#94A3B8", whiteSpace:"nowrap" }}>
                {u.is_admin?"Admin":"User"}
              </span>
              <span style={{ fontSize:12, color:"#94A3B8", whiteSpace:"nowrap" }}>{timeAgo(u.created_at)}</span>
              <div style={{ display:"flex", gap:6 }}>
                <button onClick={()=>toggleAdmin(u.id,u.is_admin)} title={u.is_admin?"Remove admin":"Make admin"} style={{ width:30, height:30, borderRadius:8, border:`1.5px solid ${u.is_admin?"#FEE2E2":"#E2E8F0"}`, background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                  {u.is_admin ? <ShieldOff size={13} color="#EF4444"/> : <Shield size={13} color="#6366f1"/>}
                </button>
                {deleteTarget===u.id ? (
                  <>
                    <button onClick={()=>deleteUser(u.id)} style={{ padding:"4px 8px", borderRadius:7, border:"none", background:"#EF4444", color:"#fff", fontSize:11, fontWeight:700, cursor:"pointer" }}>Delete</button>
                    <button onClick={()=>setDeleteTarget(null)} style={{ padding:"4px 8px", borderRadius:7, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:11, cursor:"pointer" }}>Cancel</button>
                  </>
                ) : (
                  <button onClick={()=>setDeleteTarget(u.id)} style={{ width:30, height:30, borderRadius:8, border:"1.5px solid #FEE2E2", background:"#fff", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <Trash2 size={13} color="#EF4444"/>
                  </button>
                )}
              </div>
            </div>
          ))}

          {!loading && filtered.length===0 && (
            <div style={{ padding:48, textAlign:"center" }}>
              <Users size={32} color="#E2E8F0" style={{ margin:"0 auto 12px" }}/>
              <p style={{ color:"#94A3B8", fontSize:14 }}>No users found</p>
            </div>
          )}
        </div>
      </div>
      <style>{`.bspin{animation:bspin 0.7s linear infinite}@keyframes bspin{to{transform:rotate(360deg)}}`}</style>
    </AdminLayout>
  );
}
```

### `components/admin/AdminCourses.jsx`
```jsx
"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Pencil, Trash2, X, BookOpen, Clock, Sparkles } from "lucide-react";
import MediaLibrary from "@/components/admin/builder/MediaLibrary";
import { supabase } from "@/lib/supabase";

const EMPTY = { id:"", title:"", description:"", emoji:"📚", image_url:"", gradient_from:"#6366f1", gradient_to:"#8b5cf6", hours:1, level:"Beginner", category:"Design" };
const LEVELS = ["Beginner","Intermediate","Advanced"];
const CATEGORIES = ["Design","Productivity","Video","No Code"];
const PRESET_GRADIENTS = [
  ["#ec4899","#8b5cf6"],["#6366f1","#0ea5e9"],["#f97316","#fbbf24"],
  ["#ec4899","#f43f5e"],["#10b981","#06b6d4"],["#10a37f","#0ea5e9"],
  ["#6b7280","#374151"],["#f59e0b","#ef4444"],["#8b5cf6","#4f46e5"],
];

export default function AdminCourses({ courses: initial }) {
  const [courses, setCourses] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = () => { setForm(EMPTY); setEditing(null); setShowForm(true); };
  const openEdit = (course) => {
    setForm({ id:course.id, title:course.title, description:course.description||"", emoji:course.emoji, image_url:course.imageUrl||"", gradient_from:course.gradientFrom, gradient_to:course.gradientTo, hours:course.hours, level:course.level, category:course.category });
    setEditing(course.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.id || !form.title) { alert("ID and Title are required"); return; }
    setLoading(true);
    const row = { id:form.id, title:form.title, description:form.description, emoji:form.emoji, image_url:form.image_url||null, gradient_from:form.gradient_from, gradient_to:form.gradient_to, hours:parseInt(form.hours), level:form.level, category:form.category, is_published:true };
    const { error } = await supabase.from("courses").upsert(row, { onConflict:"id" });
    if (error) { alert(error.message); setLoading(false); return; }
    setLoading(false);
    setShowForm(false);
    const updated = { id:form.id, title:form.title, description:form.description, emoji:form.emoji, imageUrl:form.image_url, gradientFrom:form.gradient_from, gradientTo:form.gradient_to, hours:parseInt(form.hours), level:form.level, category:form.category, units:editing?courses.find(c=>c.id===editing)?.units||[]:[] };
    if (editing) { setCourses(prev => prev.map(c => c.id === editing ? updated : c)); }
    else { setCourses(prev => [...prev, updated]); }
  };

  const handleDelete = async (id) => {
    await supabase.from("challenge_days").delete().eq("course_id", id);
    await supabase.from("lessons").delete().eq("course_id", id);
    await supabase.from("course_units").delete().eq("course_id", id);
    const { error } = await supabase.from("courses").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    setCourses(prev => prev.filter(c => c.id !== id));
    setDeleteId(null);
  };

  const previewGrad = `linear-gradient(135deg, ${form.gradient_from}, ${form.gradient_to})`;

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:24 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Courses</h1>
            <p style={{ color:"#64748B", fontSize:14, marginTop:4 }}>{courses.length} courses in database</p>
          </div>
          <button onClick={openAdd} style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 20px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#6366f1,#4f46e5)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 14px rgba(99,102,241,0.35)" }}>
            <Plus size={16}/> Add Course
          </button>
        </div>

        {/* Course list */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {courses.map(course => (
            <div key={course.id} style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:"14px 18px", display:"flex", alignItems:"center", gap:14, transition:"all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#E0E7FF"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="#F1F5F9"; e.currentTarget.style.boxShadow="none"; }}>
              <div style={{ width:46, height:46, borderRadius:13, background:course.imageUrl?`url(${course.imageUrl}) center/cover`:`linear-gradient(135deg,${course.gradientFrom},${course.gradientTo})`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                {!course.imageUrl && course.emoji}
              </div>
              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                  <h3 style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:0 }}>{course.title}</h3>
                  <span style={{ fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:999, background:"#F0F9FF", color:"#0369A1" }}>{course.category}</span>
                  <span style={{ fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:999, background:"#F0FDF4", color:"#15803D" }}>{course.level}</span>
                </div>
                <p style={{ fontSize:11, color:"#94A3B8", margin:0 }}>
                  {course.id} &nbsp;·&nbsp; {course.units.flatMap(u=>u.lessons).length} lessons &nbsp;·&nbsp; {course.hours}h
                </p>
              </div>
              <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                <a href={"/admin/courses/" + course.id} style={{ padding:"7px 14px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#EEF2FF", fontSize:12, fontWeight:600, color:"#6366f1", cursor:"pointer", display:"flex", alignItems:"center", gap:5, textDecoration:"none" }}>
                  Manage
                </a>
                <button onClick={() => openEdit(course)} style={{ padding:"7px 14px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:12, fontWeight:600, color:"#374151", cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                  <Pencil size={12}/> Edit
                </button>
                {deleteId === course.id ? (
                  <div style={{ display:"flex", gap:4 }}>
                    <button onClick={() => handleDelete(course.id)} style={{ padding:"7px 12px", borderRadius:9, border:"none", background:"#EF4444", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}>Delete</button>
                    <button onClick={() => setDeleteId(null)} style={{ padding:"7px 10px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#fff", color:"#374151", fontSize:12, cursor:"pointer" }}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteId(course.id)} style={{ padding:"7px 10px", borderRadius:9, border:"1.5px solid #FEE2E2", background:"#fff", color:"#EF4444", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center" }}>
                    <Trash2 size={13}/>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal ── */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.6)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(4px)" }}>
          <div style={{ background:"#fff", borderRadius:28, width:"100%", maxWidth:580, maxHeight:"92vh", overflow:"auto", boxShadow:"0 32px 80px rgba(0,0,0,0.3)" }}>

            {/* Modal header with gradient preview */}
            <div style={{ background:previewGrad, padding:"28px 32px 24px", borderRadius:"28px 28px 0 0", position:"relative" }}>
              <div style={{ position:"absolute", top:-20, right:-20, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.08)" }} />
              <button onClick={() => setShowForm(false)} style={{ position:"absolute", top:16, right:16, width:32, height:32, borderRadius:"50%", background:"rgba(255,255,255,0.2)", border:"none", cursor:"pointer", display:"flex", alignItems:"center", justifyContent:"center" }}>
                <X size={16} color="#fff"/>
              </button>
              <div style={{ display:"flex", alignItems:"center", gap:14 }}>
                <div style={{ width:60, height:60, borderRadius:18, background:"rgba(255,255,255,0.2)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:30 }}>
                  {form.image_url ? <img src={form.image_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"inherit" }}/> : (form.emoji || "📚")}
                </div>
                <div>
                  <p style={{ color:"rgba(255,255,255,0.7)", fontSize:11, fontWeight:700, letterSpacing:1, margin:"0 0 4px" }}>
                    {editing ? "EDITING COURSE" : "NEW COURSE"}
                  </p>
                  <h2 style={{ color:"#fff", fontSize:20, fontWeight:900, margin:0 }}>
                    {form.title || "Course title"}
                  </h2>
                  <p style={{ color:"rgba(255,255,255,0.6)", fontSize:12, margin:"3px 0 0" }}>
                    {form.category} · {form.level} · {form.hours}h
                  </p>
                </div>
              </div>
            </div>

            {/* Form body */}
            <div style={{ padding:"24px 32px 32px" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

                {/* ID + Emoji row */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:12 }}>
                  <Field label="Course ID" hint="e.g. canva-ai">
                    <input value={form.id} onChange={e => update("id", e.target.value.toLowerCase().replace(/\s/g,"-"))} disabled={!!editing} placeholder="course-id" style={inputSt(!!editing)} />
                  </Field>
                  <Field label="Emoji">
                    <input value={form.emoji} onChange={e => update("emoji", e.target.value)} placeholder="🎨" style={{ ...inputSt(), width:70, textAlign:"center", fontSize:22 }} />
                  </Field>
                </div>

                {/* Title */}
                <Field label="Title">
                  <input value={form.title} onChange={e => update("title", e.target.value)} placeholder="Course title" style={inputSt()} />
                </Field>

                {/* Description */}
                <Field label="Description">
                  <textarea value={form.description} onChange={e => update("description", e.target.value)} placeholder="Short description of the course..." style={{ ...inputSt(), height:72, resize:"vertical" }} />
                </Field>

                {/* Gradient */}
                <Field label="Gradient Colors">
                  {/* Presets */}
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
                    {PRESET_GRADIENTS.map(([from, to], i) => (
                      <button key={i} onClick={() => { update("gradient_from", from); update("gradient_to", to); }}
                        style={{ width:32, height:32, borderRadius:8, background:`linear-gradient(135deg,${from},${to})`, border:form.gradient_from===from?"2.5px solid #0f172a":"2px solid transparent", cursor:"pointer" }} />
                    ))}
                  </div>
                  <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:10 }}>
                    <div style={{ display:"flex", gap:8, alignItems:"center", background:"#F8FAFC", borderRadius:10, padding:"8px 12px", border:"1.5px solid #E2E8F0" }}>
                      <input type="color" value={form.gradient_from} onChange={e => update("gradient_from", e.target.value)} style={{ width:28, height:28, borderRadius:6, border:"none", cursor:"pointer", padding:0, background:"none" }} />
                      <span style={{ fontSize:11, color:"#64748B", fontWeight:600 }}>{form.gradient_from}</span>
                    </div>
                    <div style={{ display:"flex", gap:8, alignItems:"center", background:"#F8FAFC", borderRadius:10, padding:"8px 12px", border:"1.5px solid #E2E8F0" }}>
                      <input type="color" value={form.gradient_to} onChange={e => update("gradient_to", e.target.value)} style={{ width:28, height:28, borderRadius:6, border:"none", cursor:"pointer", padding:0, background:"none" }} />
                      <span style={{ fontSize:11, color:"#64748B", fontWeight:600 }}>{form.gradient_to}</span>
                    </div>
                  </div>
                </Field>

                {/* Level + Category + Hours */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 80px", gap:12 }}>
                  <Field label="Category">
                    <select value={form.category} onChange={e => update("category", e.target.value)} style={inputSt()}>
                      {CATEGORIES.map(c => <option key={c}>{c}</option>)}
                    </select>
                  </Field>
                  <Field label="Level">
                    <select value={form.level} onChange={e => update("level", e.target.value)} style={inputSt()}>
                      {LEVELS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </Field>
                  <Field label="Hours">
                    <input type="number" min="1" value={form.hours} onChange={e => update("hours", e.target.value)} style={inputSt()} />
                  </Field>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display:"flex", gap:10, marginTop:24 }}>
                <button onClick={() => setShowForm(false)} style={{ flex:1, padding:"13px", borderRadius:13, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={loading} style={{ flex:2, padding:"13px", borderRadius:13, border:"none", background:previewGrad, color:"#fff", fontSize:14, fontWeight:700, cursor:loading?"not-allowed":"pointer", boxShadow:`0 4px 16px rgba(0,0,0,0.2)`, opacity:loading?0.7:1 }}>
                  {loading ? "Saving..." : (editing ? "Save Changes" : "Add Course")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

const inputSt = (disabled) => ({
  width:"100%", padding:"10px 13px", borderRadius:10,
  border:"1.5px solid #E2E8F0", fontSize:13, outline:"none",
  background: disabled ? "#F8FAFC" : "#fff",
  color: disabled ? "#94A3B8" : "#0f172a",
  boxSizing:"border-box", cursor: disabled ? "not-allowed" : "auto",
});

function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:6 }}>
        {label} {hint && <span style={{ color:"#94A3B8", fontWeight:400, fontSize:11 }}>· {hint}</span>}
      </label>
      {children}
    </div>
  );
}
```

### `components/admin/AdminChallenges.jsx`
```jsx
"use client";

import { useState } from "react";
import AdminLayout from "@/components/admin/AdminLayout";
import { Plus, Pencil, Trash2, X } from "lucide-react";
import MediaLibrary from "@/components/admin/builder/MediaLibrary";
import { supabase } from "@/lib/supabase";

const EMPTY = { id:"", title:"", subtitle:"", description:"", emoji:"🚀", image_url:"", gradient_bg:"linear-gradient(135deg,#6366f1,#8b5cf6)", days:14, level:"Beginner" };
const LEVELS = ["Beginner","Intermediate","Advanced"];

const PRESETS = [
  "linear-gradient(135deg,#667eea,#764ba2)",
  "linear-gradient(135deg,#f093fb,#f5576c)",
  "linear-gradient(135deg,#4facfe,#00f2fe)",
  "linear-gradient(135deg,#43e97b,#38f9d7)",
  "linear-gradient(135deg,#fa709a,#fee140)",
  "linear-gradient(135deg,#a18cd1,#fbc2eb)",
  "linear-gradient(135deg,#ffecd2,#fcb69f)",
  "linear-gradient(135deg,#ff9a9e,#fecfef)",
  "linear-gradient(135deg,#a1c4fd,#c2e9fb)",
  "linear-gradient(135deg,#d4fc79,#96e6a1)",
  "linear-gradient(135deg,#60a5fa,#06b6d4)",
  "linear-gradient(135deg,#f97316,#fbbf24)",
];

export default function AdminChallenges({ challenges: initial }) {
  const [challenges, setChallenges] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const update = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const openAdd = () => { setForm(EMPTY); setEditing(null); setShowForm(true); };
  const openEdit = (ch) => {
    setForm({ id:ch.id, title:ch.title, subtitle:ch.subtitle||"", description:ch.description||"", emoji:ch.emoji, image_url:ch.imageUrl||"", gradient_bg:ch.gradientBg, days:ch.days, level:ch.level });
    setEditing(ch.id);
    setShowForm(true);
  };

  const handleSave = async () => {
    if (!form.id || !form.title) { alert("ID and Title required"); return; }
    setLoading(true);
    const { error } = await supabase.from("challenges").upsert({
      id:form.id, title:form.title, subtitle:form.subtitle, description:form.description,
      emoji:form.emoji, image_url:form.image_url||null, gradient_bg:form.gradient_bg, days:parseInt(form.days),
      level:form.level, is_published:true,
    }, { onConflict:"id" });
    if (error) { alert(error.message); setLoading(false); return; }
    setLoading(false);
    setShowForm(false);
    const updated = { id:form.id, title:form.title, subtitle:form.subtitle, description:form.description, emoji:form.emoji, imageUrl:form.image_url, gradientBg:form.gradient_bg, days:parseInt(form.days), level:form.level, challengeDays:[], reviews:[] };
    if (editing) { setChallenges(prev => prev.map(c => c.id === editing ? updated : c)); }
    else { setChallenges(prev => [...prev, updated]); }
  };

  const handleDelete = async (id) => {
    await supabase.from("challenge_days").delete().eq("challenge_id", id);
    await supabase.from("challenge_reviews").delete().eq("challenge_id", id);
    await supabase.from("challenge_progress").delete().eq("challenge_id", id);
    await supabase.from("challenge_joins").delete().eq("challenge_id", id);
    const { error } = await supabase.from("challenges").delete().eq("id", id);
    if (error) { alert(error.message); return; }
    setChallenges(prev => prev.filter(c => c.id !== id));
    setDeleteId(null);
  };

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:24 }}>

        {/* Header */}
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div>
            <h1 style={{ fontSize:24, fontWeight:900, color:"#0f172a", margin:0 }}>Challenges</h1>
            <p style={{ color:"#64748B", fontSize:14, marginTop:4 }}>{challenges.length} challenges in database</p>
          </div>
          <button onClick={openAdd} style={{ display:"flex", alignItems:"center", gap:8, padding:"11px 20px", borderRadius:12, border:"none", background:"linear-gradient(135deg,#f59e0b,#f97316)", color:"#fff", fontSize:13, fontWeight:700, cursor:"pointer", boxShadow:"0 4px 14px rgba(245,158,11,0.35)" }}>
            <Plus size={16}/> Add Challenge
          </button>
        </div>

        {/* Challenge list */}
        <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
          {challenges.map(ch => (
            <div key={ch.id} style={{ background:"#fff", borderRadius:16, border:"1.5px solid #F1F5F9", padding:"14px 18px", display:"flex", alignItems:"center", gap:14, transition:"all 0.15s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor="#FEF3C7"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.06)"; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor="#F1F5F9"; e.currentTarget.style.boxShadow="none"; }}>

              {/* Emoji hero */}
              <div style={{ width:48, height:48, borderRadius:13, background:ch.imageUrl?`url(${ch.imageUrl}) center/cover`:ch.gradientBg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:22, flexShrink:0 }}>
                {!ch.imageUrl && ch.emoji}
              </div>

              <div style={{ flex:1, minWidth:0 }}>
                <div style={{ display:"flex", alignItems:"center", gap:6, marginBottom:3 }}>
                  <h3 style={{ fontSize:14, fontWeight:700, color:"#0f172a", margin:0 }}>{ch.title}</h3>
                  <span style={{ fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:999, background:"#FFF7ED", color:"#C2410C" }}>{ch.days} days</span>
                  <span style={{ fontSize:10, fontWeight:600, padding:"2px 7px", borderRadius:999, background:"#F0FDF4", color:"#15803D" }}>{ch.level}</span>
                </div>
                <p style={{ fontSize:11, color:"#94A3B8", margin:0 }}>{ch.id} · {ch.subtitle}</p>
              </div>

              <div style={{ display:"flex", gap:6, flexShrink:0 }}>
                <a href={"/admin/challenges/" + ch.id} style={{ padding:"7px 14px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#FFF7ED", fontSize:12, fontWeight:600, color:"#f59e0b", cursor:"pointer", display:"flex", alignItems:"center", gap:5, textDecoration:"none" }}>
                  Manage
                </a>
                <button onClick={() => openEdit(ch)} style={{ padding:"7px 14px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:12, fontWeight:600, color:"#374151", cursor:"pointer", display:"flex", alignItems:"center", gap:5 }}>
                  <Pencil size={12}/> Edit
                </button>
                {deleteId === ch.id ? (
                  <div style={{ display:"flex", gap:4 }}>
                    <button onClick={() => handleDelete(ch.id)} style={{ padding:"7px 12px", borderRadius:9, border:"none", background:"#EF4444", color:"#fff", fontSize:12, fontWeight:700, cursor:"pointer" }}>Delete</button>
                    <button onClick={() => setDeleteId(null)} style={{ padding:"7px 10px", borderRadius:9, border:"1.5px solid #E2E8F0", background:"#fff", color:"#374151", fontSize:12, cursor:"pointer" }}>Cancel</button>
                  </div>
                ) : (
                  <button onClick={() => setDeleteId(ch.id)} style={{ padding:"7px 10px", borderRadius:9, border:"1.5px solid #FEE2E2", background:"#fff", color:"#EF4444", fontSize:12, cursor:"pointer", display:"flex", alignItems:"center" }}>
                    <Trash2 size={13}/>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Modal ── */}
      {showForm && (
        <div style={{ position:"fixed", inset:0, background:"rgba(15,23,42,0.6)", zIndex:100, display:"flex", alignItems:"center", justifyContent:"center", padding:20, backdropFilter:"blur(4px)" }}>
          <div style={{ background:"#fff", borderRadius:28, width:"100%", maxWidth:580, maxHeight:"92vh", overflow:"auto", boxShadow:"0 32px 80px rgba(0,0,0,0.3)" }}>

            {/* Gradient preview header */}
            <div style={{ background:form.gradient_bg, padding:"28px 32px 24px", borderRadius:"28px 28px 0 0", position:"relative", overflow:"hidden" }}>
              <div style={{ position:"absolute",top:-30,right:-30,width:140,height:140,borderRadius:"50%",background:"rgba(255,255,255,0.08)" }} />
              <button onClick={() => setShowForm(false)} style={{ position:"absolute",top:16,right:16,width:32,height:32,borderRadius:"50%",background:"rgba(255,255,255,0.2)",border:"none",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center" }}>
                <X size={16} color="#fff"/>
              </button>
              <div style={{ display:"flex", alignItems:"center", gap:14, position:"relative", zIndex:1 }}>
                <div style={{ width:64,height:64,borderRadius:20,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32 }}>
                  {form.image_url ? <img src={form.image_url} alt="" style={{ width:"100%", height:"100%", objectFit:"cover", borderRadius:"inherit" }}/> : (form.emoji || "🚀")}
                </div>
                <div>
                  <p style={{ color:"rgba(255,255,255,0.65)",fontSize:10,fontWeight:700,letterSpacing:1,margin:"0 0 4px" }}>
                    {editing ? "EDITING CHALLENGE" : "NEW CHALLENGE"}
                  </p>
                  <h2 style={{ color:"#fff",fontSize:20,fontWeight:900,margin:0,lineHeight:1.2 }}>
                    {form.title || "Challenge title"}
                  </h2>
                  <p style={{ color:"rgba(255,255,255,0.6)",fontSize:12,margin:"4px 0 0" }}>
                    {form.days} days · {form.level}
                  </p>
                </div>
              </div>
            </div>

            {/* Form body */}
            <div style={{ padding:"24px 32px 32px" }}>
              <div style={{ display:"flex", flexDirection:"column", gap:16 }}>

                {/* ID + Emoji */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr auto", gap:12 }}>
                  <Field label="Challenge ID" hint="e.g. ai-side-gigs">
                    <input value={form.id} onChange={e => update("id", e.target.value.toLowerCase().replace(/\s/g,"-"))} disabled={!!editing} placeholder="challenge-id" style={inputSt(!!editing)} />
                  </Field>
                  <Field label="Emoji">
                    <input value={form.emoji} onChange={e => update("emoji", e.target.value)} placeholder="🚀" style={{ ...inputSt(), width:70, textAlign:"center", fontSize:22 }} />
                  </Field>
                </div>

                {/* Title */}
                <Field label="Title">
                  <input value={form.title} onChange={e => update("title", e.target.value)} placeholder="Challenge title" style={inputSt()} />
                </Field>

                {/* Subtitle */}
                <Field label="Subtitle" hint="short tagline">
                  <input value={form.subtitle} onChange={e => update("subtitle", e.target.value)} placeholder="Turn AI skills into real income" style={inputSt()} />
                </Field>

                {/* Description */}
                <Field label="Description">
                  <textarea value={form.description} onChange={e => update("description", e.target.value)} placeholder="Full description of the challenge..." style={{ ...inputSt(), height:80, resize:"vertical" }} />
                </Field>

                {/* Gradient presets */}
                <Field label="Gradient">
                  <div style={{ display:"flex", gap:6, flexWrap:"wrap", marginBottom:10 }}>
                    {PRESETS.map((g, i) => (
                      <button key={i} onClick={() => update("gradient_bg", g)}
                        style={{ width:36, height:36, borderRadius:9, background:g, border:form.gradient_bg===g?"3px solid #0f172a":"2px solid transparent", cursor:"pointer", transition:"all 0.1s" }} />
                    ))}
                  </div>
                  {/* Custom gradient input */}
                  <div style={{ background:"#F8FAFC", borderRadius:10, padding:"10px 14px", border:"1.5px solid #E2E8F0" }}>
                    <p style={{ fontSize:10, fontWeight:700, color:"#94A3B8", margin:"0 0 6px" }}>CUSTOM CSS GRADIENT</p>
                    <input value={form.gradient_bg} onChange={e => update("gradient_bg", e.target.value)} style={{ ...inputSt(), background:"transparent", border:"none", padding:0, fontSize:12 }} />
                  </div>
                  {/* Preview bar */}
                  <div style={{ height:10, borderRadius:999, background:form.gradient_bg, marginTop:8 }} />
                </Field>

                {/* Days + Level */}
                <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12 }}>
                  <Field label="Number of Days">
                    <input type="number" min="1" value={form.days} onChange={e => update("days", e.target.value)} style={inputSt()} />
                  </Field>
                  <Field label="Level">
                    <select value={form.level} onChange={e => update("level", e.target.value)} style={inputSt()}>
                      {LEVELS.map(l => <option key={l}>{l}</option>)}
                    </select>
                  </Field>
                </div>
              </div>

              {/* Actions */}
              <div style={{ display:"flex", gap:10, marginTop:24 }}>
                <button onClick={() => setShowForm(false)} style={{ flex:1, padding:"13px", borderRadius:13, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:13, fontWeight:600, color:"#374151", cursor:"pointer" }}>
                  Cancel
                </button>
                <button onClick={handleSave} disabled={loading} style={{ flex:2, padding:"13px", borderRadius:13, border:"none", background:form.gradient_bg, color:"#fff", fontSize:14, fontWeight:700, cursor:loading?"not-allowed":"pointer", boxShadow:"0 4px 16px rgba(0,0,0,0.2)", opacity:loading?0.7:1 }}>
                  {loading ? "Saving..." : (editing ? "Save Changes" : "Add Challenge")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

const inputSt = (disabled) => ({
  width:"100%", padding:"10px 13px", borderRadius:10,
  border:"1.5px solid #E2E8F0", fontSize:13, outline:"none",
  background:disabled?"#F8FAFC":"#fff",
  color:disabled?"#94A3B8":"#0f172a",
  boxSizing:"border-box", cursor:disabled?"not-allowed":"auto",
});

function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{ fontSize:12, fontWeight:700, color:"#374151", display:"block", marginBottom:6 }}>
        {label} {hint && <span style={{ color:"#94A3B8", fontWeight:400, fontSize:11 }}>· {hint}</span>}
      </label>
      {children}
    </div>
  );
}
```

### `components/admin/AdminChallengeDetail.jsx`
```jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  DndContext, closestCenter, PointerSensor, useSensor, useSensors
} from "@dnd-kit/core";
import {
  SortableContext, verticalListSortingStrategy, useSortable, arrayMove
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import AdminLayout from "@/components/admin/AdminLayout";
import { ChevronLeft, Plus, Pencil, Trash2, X, GripVertical, Link as LinkIcon } from "lucide-react";
import { supabase } from "@/lib/supabase";

const EMOJIS = ["🚀","⭐","💼","🛠️","🤖","💬","🎨","🔍","⚡","🎬","💻","📊","📱","🌟","🔄","🎯","📚","💡","🔥","🏆"];

export default function AdminChallengeDetail({ challenge: initial, courses }) {
  const router = useRouter();
  const [challenge, setChallenge] = useState(initial);
  const [dayForm, setDayForm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState(null);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint:{ distance:6 } }));

  // ── Drag reorder ──
  const handleDragEnd = async ({ active, over }) => {
    if (!over || active.id === over.id) return;
    const days = challenge.challengeDays;
    const oldIdx = days.findIndex(d => String(d.day) === String(active.id));
    const newIdx = days.findIndex(d => String(d.day) === String(over.id));
    const reordered = arrayMove(days, oldIdx, newIdx);
    // Reassign day numbers
    const renumbered = reordered.map((d, i) => ({ ...d, day: i+1 }));
    setChallenge(p => ({ ...p, challengeDays: renumbered }));
    // Persist
    for (const d of renumbered) {
      await supabase.from("challenge_days")
        .update({ day_number: d.day })
        .eq("challenge_id", challenge.id)
        .eq("day_number", d.day);
    }
  };

  const saveDay = async () => {
    if (!dayForm.topic) return;
    setLoading(true);
    const dayNum = dayForm.day_number || (challenge.challengeDays.length + 1);
    const row = { challenge_id:challenge.id, day_number:dayNum, topic:dayForm.topic, emoji:dayForm.emoji, course_id:dayForm.course_id||null, lesson_id:dayForm.lesson_id||null };
    const { error } = await supabase.from("challenge_days").upsert(row, { onConflict:"challenge_id,day_number" });
    if (error) { alert(error.message); setLoading(false); return; }
    const updated = { day:dayNum, topic:dayForm.topic, emoji:dayForm.emoji, courseId:row.course_id, lessonId:row.lesson_id };
    if (dayForm.day_number) setChallenge(p=>({...p,challengeDays:p.challengeDays.map(d=>d.day===dayForm.day_number?updated:d)}));
    else setChallenge(p=>({...p,challengeDays:[...p.challengeDays, updated]}));
    setDayForm(null);
    setLoading(false);
  };

  const deleteDay = async (dayNum) => {
    await supabase.from("challenge_days").delete().eq("challenge_id",challenge.id).eq("day_number",dayNum);
    setChallenge(p=>({...p,challengeDays:p.challengeDays.filter(d=>d.day!==dayNum)}));
    setDeleteTarget(null);
  };

  return (
    <AdminLayout>
      <div style={{ display:"flex", flexDirection:"column", gap:24, maxWidth:820 }}>

        <div>
          <Link href="/admin/challenges" style={{ textDecoration:"none",display:"inline-flex",alignItems:"center",gap:6,color:"#64748B",fontSize:13,fontWeight:600,marginBottom:16 }}>
            <ChevronLeft size={15}/> Back to challenges
          </Link>
          <div style={{ background:challenge.gradientBg,borderRadius:20,padding:"24px 28px",display:"flex",alignItems:"center",gap:18,position:"relative",overflow:"hidden" }}>
            <div style={{ position:"absolute",top:-30,right:-30,width:140,height:140,borderRadius:"50%",background:"rgba(255,255,255,0.08)" }}/>
            <div style={{ width:64,height:64,borderRadius:20,background:"rgba(255,255,255,0.2)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:32,flexShrink:0 }}>{challenge.emoji}</div>
            <div style={{ position:"relative",zIndex:1,flex:1 }}>
              <h1 style={{ color:"#fff",fontSize:22,fontWeight:900,margin:0 }}>{challenge.title}</h1>
              <p style={{ color:"rgba(255,255,255,0.6)",fontSize:13,margin:"4px 0 0" }}>{challenge.challengeDays.length}/{challenge.days} days configured · drag rows to reorder</p>
            </div>
            <button onClick={() => setDayForm({ topic:"", emoji:"🚀", course_id:"", lesson_id:"" })} style={{ padding:"10px 18px",borderRadius:12,border:"none",background:"rgba(255,255,255,0.2)",color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer",display:"flex",alignItems:"center",gap:6,flexShrink:0 }}>
              <Plus size={15}/> Add Day
            </button>
          </div>
        </div>

        {/* Note about content sharing */}
        <div style={{ background:"#EFF6FF",borderRadius:14,padding:"12px 16px",border:"1.5px solid #BFDBFE",display:"flex",gap:10,alignItems:"flex-start" }}>
          <LinkIcon size={16} color="#2563eb" style={{ flexShrink:0,marginTop:1 }}/>
          <p style={{ fontSize:13,color:"#1e40af",margin:0,lineHeight:1.5 }}>
            <strong>Independent content:</strong> Each challenge day has its own content — separate from courses. Use <strong>✍️ Content</strong> to build what students see for that day. The course mapping is optional metadata only.
          </p>
        </div>

        {/* Days list with drag */}
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={challenge.challengeDays.map(d=>String(d.day))} strategy={verticalListSortingStrategy}>
            <div style={{ display:"flex",flexDirection:"column",gap:8 }}>
              {challenge.challengeDays.map((day, idx) => (
                <SortableDay
                  key={day.day}
                  day={day}
                  idx={idx}
                  challenge={challenge}
                  courses={courses}
                  deleteTarget={deleteTarget}
                  setDeleteTarget={setDeleteTarget}
                  onEdit={() => setDayForm({ day_number:day.day, topic:day.topic, emoji:day.emoji, course_id:day.courseId||"", lesson_id:day.lessonId||"" })}
                  onDelete={() => deleteDay(day.day)}
                  onContent={() => router.push(`/admin/builder/challenge_${challenge.id}_day_${day.day}?title=${encodeURIComponent("Day "+day.day+" - "+day.topic)}&backTo=${encodeURIComponent("/admin/challenges/"+challenge.id)}`)}
                />
              ))}
            </div>
          </SortableContext>
        </DndContext>

        {challenge.challengeDays.length===0 && (
          <div style={{ textAlign:"center",padding:"40px 20px",background:"#fff",borderRadius:16,border:"2px dashed #E2E8F0" }}>
            <p style={{ fontSize:32,marginBottom:8 }}>📅</p>
            <p style={{ fontSize:14,fontWeight:700,color:"#0f172a",margin:"0 0 4px" }}>No days yet</p>
            <p style={{ fontSize:13,color:"#94A3B8",margin:0 }}>Click "Add Day" to start building</p>
          </div>
        )}
      </div>

      {/* Day modal */}
      {dayForm && (
        <div style={{ position:"fixed",inset:0,background:"rgba(15,23,42,0.6)",zIndex:100,display:"flex",alignItems:"center",justifyContent:"center",padding:20,backdropFilter:"blur(4px)" }}>
          <div style={{ background:"#fff",borderRadius:24,width:"100%",maxWidth:500,boxShadow:"0 32px 80px rgba(0,0,0,0.3)",overflow:"auto",maxHeight:"90vh" }}>
            <div style={{ padding:"24px 28px 0",display:"flex",alignItems:"center",justifyContent:"space-between" }}>
              <h2 style={{ fontSize:17,fontWeight:800,color:"#0f172a",margin:0 }}>{dayForm.day_number?`Edit Day ${dayForm.day_number}`:`Add Day ${challenge.challengeDays.length+1}`}</h2>
              <button onClick={()=>setDayForm(null)} style={{ background:"none",border:"none",cursor:"pointer" }}><X size={18} color="#94A3B8"/></button>
            </div>
            <div style={{ padding:"20px 28px 28px",display:"flex",flexDirection:"column",gap:14 }}>
              <div>
                <label style={lbl()}>Topic</label>
                <input value={dayForm.topic} onChange={e=>setDayForm(p=>({...p,topic:e.target.value}))} placeholder="Day topic..." style={iSt()} autoFocus/>
              </div>
              <div>
                <label style={lbl()}>Emoji</label>
                <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
                  {EMOJIS.map(e=>(
                    <button key={e} onClick={()=>setDayForm(p=>({...p,emoji:e}))} style={{ width:36,height:36,borderRadius:8,border:dayForm.emoji===e?"2.5px solid #6366f1":"1.5px solid #E2E8F0",background:dayForm.emoji===e?"#EEF2FF":"#fff",fontSize:18,cursor:"pointer" }}>{e}</button>
                  ))}
                </div>
              </div>
              <div>
                <label style={lbl()}>Map to Course <span style={{ color:"#94A3B8",fontWeight:400 }}>· optional</span></label>
                <select value={dayForm.course_id} onChange={e=>setDayForm(p=>({...p,course_id:e.target.value,lesson_id:""}))} style={iSt()}>
                  <option value="">— No course —</option>
                  {courses.map(c=><option key={c.id} value={c.id}>{c.emoji} {c.title}</option>)}
                </select>
              </div>
              {dayForm.course_id && (
                <div>
                  <label style={lbl()}>Map to Lesson <span style={{ color:"#94A3B8",fontWeight:400 }}>· optional</span></label>
                  <select value={dayForm.lesson_id} onChange={e=>setDayForm(p=>({...p,lesson_id:e.target.value}))} style={iSt()}>
                    <option value="">— Select lesson —</option>
                    {courses.find(c=>c.id===dayForm.course_id)?.units.flatMap(u=>u.lessons).map(l=>(
                      <option key={l.id} value={l.id}>{l.title}</option>
                    ))}
                  </select>
                </div>
              )}
              <div style={{ display:"flex",gap:10,marginTop:4 }}>
                <button onClick={()=>setDayForm(null)} style={{ flex:1,padding:"11px",borderRadius:11,border:"1.5px solid #E2E8F0",background:"#fff",fontSize:13,fontWeight:600,color:"#374151",cursor:"pointer" }}>Cancel</button>
                <button onClick={saveDay} disabled={loading} style={{ flex:2,padding:"11px",borderRadius:11,border:"none",background:challenge.gradientBg,color:"#fff",fontSize:13,fontWeight:700,cursor:"pointer" }}>
                  {loading?"Saving...":(dayForm.day_number?"Save Changes":"Add Day")}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </AdminLayout>
  );
}

function SortableDay({ day, idx, challenge, courses, deleteTarget, setDeleteTarget, onEdit, onDelete, onContent }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: String(day.day) });
  const style = { transform:CSS.Transform.toString(transform), transition, opacity:isDragging?0.4:1 };
  const mappedCourse = courses.find(c=>c.id===day.courseId);

  return (
    <div ref={setNodeRef} style={{ ...style,background:isDragging?"#F5F3FF":"#fff",borderRadius:14,border:"1.5px solid #F1F5F9",padding:"12px 16px",display:"flex",alignItems:"center",gap:12 }}>
      <button {...attributes} {...listeners} style={{ cursor:"grab",border:"none",background:"none",padding:2,display:"flex",touchAction:"none",color:"#CBD5E1" }}>
        <GripVertical size={16}/>
      </button>
      <div style={{ width:32,height:32,borderRadius:9,background:"#F1F5F9",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:800,color:"#64748B",flexShrink:0 }}>D{idx+1}</div>
      <span style={{ fontSize:20,flexShrink:0 }}>{day.emoji}</span>
      <div style={{ flex:1,minWidth:0 }}>
        <p style={{ fontSize:13,fontWeight:700,color:"#0f172a",margin:0 }}>{day.topic}</p>
        <p style={{ fontSize:11,color:"#94A3B8",margin:0 }}>
          {mappedCourse ? `📚 ${mappedCourse.title}` : "No lesson mapped"}
        </p>
      </div>
      <div style={{ display:"flex",gap:6,flexShrink:0 }}>
        <button onClick={onContent} style={btn("#EEF2FF","#6366f1","#C7D2FE")}>✍️ Content</button>
        <button onClick={onEdit} style={btn()}><Pencil size={11}/> Edit</button>
        {deleteTarget===day.day ? (
          <><button onClick={onDelete} style={btn("#EF4444","#fff")}>Delete</button><button onClick={()=>setDeleteTarget(null)} style={btn()}>Cancel</button></>
        ) : (
          <button onClick={()=>setDeleteTarget(day.day)} style={btn("#fff","#EF4444","#FEE2E2")}><Trash2 size={11}/></button>
        )}
      </div>
    </div>
  );
}

const iSt = () => ({ width:"100%",padding:"10px 13px",borderRadius:10,border:"1.5px solid #E2E8F0",fontSize:13,outline:"none",background:"#fff",color:"#0f172a",boxSizing:"border-box" });
const lbl = () => ({ fontSize:12,fontWeight:700,color:"#374151",display:"block",marginBottom:6 });
const btn = (bg="#fff",color="#374151",border="1.5px solid #E2E8F0") => ({ padding:"6px 11px",borderRadius:8,border,background:bg,color,fontSize:11,fontWeight:600,cursor:"pointer",display:"flex",alignItems:"center",gap:4 });
```

### `components/admin/AdminLayout.jsx`
```jsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { LayoutDashboard, BookOpen, Trophy, Users, TrendingUp, HardDrive, Settings, ChevronRight, LogOut, MessageSquare } from "lucide-react";
import { supabase } from "@/lib/supabase";

const NAV = [
  { href:"/admin",            icon:LayoutDashboard, label:"Dashboard"   },
  { href:"/admin/courses",    icon:BookOpen,        label:"Courses"     },
  { href:"/admin/challenges", icon:Trophy,          label:"Challenges"  },
  { href:"/admin/users",      icon:Users,           label:"Users"       },
  { href:"/admin/analytics",  icon:TrendingUp,      label:"Analytics"   },
  { href:"/admin/media",      icon:HardDrive,       label:"Media"       },
  { href:"/admin/reviews",    icon:MessageSquare,   label:"Reviews"     },
  { href:"/admin/settings",   icon:Settings,        label:"Settings"    },
];

export default function AdminLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
  };

  return (
    <div style={{ display:"flex", minHeight:"100vh" }}>

      {/* Sidebar */}
      <div style={{ width:240, background:"#0f172a", display:"flex", flexDirection:"column", position:"fixed", top:0, left:0, height:"100vh", zIndex:50 }}>
        {/* Logo */}
        <div style={{ padding:"24px 20px", borderBottom:"1px solid rgba(255,255,255,0.08)" }}>
          <Link href="/" style={{ textDecoration:"none" }}>
            <span style={{ fontSize:20, fontWeight:900, color:"#fff", fontStyle:"italic" }}>✦ Coursiv</span>
          </Link>
          <div style={{ marginTop:4, background:"rgba(99,102,241,0.25)", borderRadius:6, padding:"2px 8px", display:"inline-block" }}>
            <span style={{ color:"#a5b4fc", fontSize:10, fontWeight:700, letterSpacing:1 }}>ADMIN</span>
          </div>
        </div>

        {/* Nav */}
        <nav style={{ flex:1, padding:"12px 10px" }}>
          {NAV.map(({ href, icon: Icon, label }) => {
            const active = pathname === href;
            return (
              <Link key={href} href={href} style={{ textDecoration:"none" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, marginBottom:2, background:active?"rgba(99,102,241,0.2)":"transparent", color:active?"#a5b4fc":"rgba(255,255,255,0.5)", transition:"all 0.15s" }}
                  onMouseEnter={e => { if (!active) e.currentTarget.style.background="rgba(255,255,255,0.05)"; }}
                  onMouseLeave={e => { if (!active) e.currentTarget.style.background="transparent"; }}>
                  <Icon size={16} />
                  <span style={{ fontSize:13, fontWeight:600 }}>{label}</span>
                  {active && <ChevronRight size={13} style={{ marginLeft:"auto" }} />}
                </div>
              </Link>
            );
          })}
        </nav>

        {/* Bottom */}
        <div style={{ padding:"12px 10px", borderTop:"1px solid rgba(255,255,255,0.08)" }}>
          <Link href="/" style={{ textDecoration:"none" }}>
            <div style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, color:"rgba(255,255,255,0.4)", marginBottom:2 }}>
              <Settings size={15} />
              <span style={{ fontSize:13, fontWeight:600 }}>View Site</span>
            </div>
          </Link>
          <button onClick={handleSignOut} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"10px 12px", borderRadius:10, border:"none", background:"transparent", color:"rgba(239,68,68,0.7)", cursor:"pointer", fontSize:13, fontWeight:600 }}>
            <LogOut size={15} />
            Sign Out
          </button>
        </div>
      </div>

      {/* Main content */}
      <div style={{ marginLeft:240, flex:1, padding:"32px 36px" }}>
        {children}
      </div>
    </div>
  );
}
```

### `components/auth/AuthPage.jsx`
```jsx
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

const PERKS = [
  "Track progress across all AI courses",
  "Earn verified certificates",
  "Join daily challenges & streaks",
  "Access 500+ AI prompts library",
];

export default function AuthPage({ mode }) {
  const router = useRouter();
  const isLogin = mode === "login";
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 768);
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, []);

  async function handleSubmit() {
    setError("");
    setSuccess("");

    // Validate
    if (!email || !password) {
      setError("Please fill in all fields");
      return;
    }
    if (!isLogin && !name) {
      setError("Please enter your name");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    if (isLogin) {
      // SIGN IN
      const { data, error: err } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
      });

      setLoading(false);

      if (err) {
        const msg = err.message.toLowerCase();
        if (msg.includes("not confirmed")) {
          setError("Email not confirmed yet. Please check your inbox and click the confirmation link first.");
        } else if (msg.includes("invalid") || msg.includes("credentials")) {
          setError("Wrong email or password. Please try again.");
        } else {
          setError(err.message);
        }
        return;
      }

      // Success — go home
      router.push("/");
      router.refresh();

    } else {
      // SIGN UP
      const { data, error: err } = await supabase.auth.signUp({
        email: email,
        password: password,
        options: {
          data: { full_name: name },
        },
      });

      setLoading(false);

      if (err) {
        setError(err.message);
        return;
      }

      setSuccess("Account created! Check your email and click the confirmation link to activate.");
    }
  }

  async function handleGoogle() {
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: window.location.origin + "/" },
    });
  }

  const formContent = (
    <div style={{ width: "100%" }}>
      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <div style={{ width: 48, height: 48, borderRadius: 14, background: "linear-gradient(135deg,#7c3aed,#4f46e5)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 12px", boxShadow: "0 6px 18px rgba(124,58,237,0.45)" }}>
          <Sparkles size={20} color="#fff" />
        </div>
        <h1 style={{ color: "#fff", fontSize: 20, fontWeight: 800, margin: "0 0 4px" }}>
          {isLogin ? "Sign in" : "Create your account"}
        </h1>
        <p style={{ color: "rgba(255,255,255,0.38)", fontSize: 12, margin: 0 }}>
          {isLogin ? "Enter your credentials to continue" : "Free forever · No credit card needed"}
        </p>
      </div>

      {/* Error */}
      {error !== "" && (
        <div style={{ background: "rgba(239,68,68,0.15)", border: "1px solid rgba(239,68,68,0.35)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, color: "#fca5a5", fontSize: 13 }}>
          {error}
        </div>
      )}

      {/* Success */}
      {success !== "" && (
        <div style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.35)", borderRadius: 10, padding: "10px 14px", marginBottom: 14, color: "#86efac", fontSize: 13 }}>
          {success}
        </div>
      )}

      {/* Fields */}
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {!isLogin && (
          <InputField
            icon={<User size={14} color="#818cf8" />}
            placeholder="Full name"
            value={name}
            onChange={setName}
            onEnter={handleSubmit}
          />
        )}
        <InputField
          icon={<Mail size={14} color="#818cf8" />}
          placeholder="Email address"
          type="email"
          value={email}
          onChange={setEmail}
          onEnter={handleSubmit}
        />
        <InputField
          icon={<Lock size={14} color="#818cf8" />}
          placeholder="Password"
          type={showPw ? "text" : "password"}
          value={password}
          onChange={setPassword}
          onEnter={handleSubmit}
          suffix={
            <button
              onClick={() => setShowPw(!showPw)}
              style={{ background: "none", border: "none", cursor: "pointer", padding: 2, display: "flex", opacity: 0.55 }}
            >
              {showPw ? <EyeOff size={13} color="#fff" /> : <Eye size={13} color="#fff" />}
            </button>
          }
        />
      </div>

      {isLogin && (
        <div style={{ textAlign: "right", marginTop: 6 }}>
          <span style={{ color: "#a78bfa", fontSize: 12, cursor: "pointer", fontWeight: 600 }}>
            Forgot password?
          </span>
        </div>
      )}

      {/* Submit button */}
      <button
        onClick={handleSubmit}
        disabled={loading || redirecting}
        style={{
          width: "100%", marginTop: 16, padding: "13px", borderRadius: 12, border: "none",
          background: loading ? "rgba(99,102,241,0.5)" : "linear-gradient(135deg,#7c3aed,#4f46e5)",
          color: "#fff", fontSize: 14, fontWeight: 700,
          cursor: loading ? "not-allowed" : "pointer",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
          boxShadow: loading ? "none" : "0 4px 16px rgba(124,58,237,0.4)",
          transition: "all 0.2s",
        }}
      >
        {loading ? (
          <>
            <div style={{ width: 15, height: 15, borderRadius: "50%", border: "2px solid rgba(255,255,255,0.3)", borderTopColor: "#fff", animation: "spin 0.7s linear infinite" }} />
            {isLogin ? "Signing in..." : "Creating account..."}
          </>
        ) : (
          <>
            {isLogin ? "Sign in" : "Create account"}
            <ArrowRight size={14} />
          </>
        )}
      </button>

      {/* Divider */}
      <div style={{ display: "flex", alignItems: "center", gap: 8, margin: "14px 0" }}>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
        <span style={{ color: "rgba(255,255,255,0.22)", fontSize: 11 }}>or</span>
        <div style={{ flex: 1, height: 1, background: "rgba(255,255,255,0.08)" }} />
      </div>

      {/* Google */}
      <button
        onClick={handleGoogle}
        style={{ width: "100%", padding: "11px", borderRadius: 12, background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.1)", color: "rgba(255,255,255,0.65)", fontSize: 13, fontWeight: 600, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", gap: 8 }}
        onMouseEnter={e => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}
        onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.05)"}
      >
        <svg width="15" height="15" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
        </svg>
        Continue with Google
      </button>

      {/* Toggle login/signup */}
      <p style={{ textAlign: "center", color: "rgba(255,255,255,0.3)", fontSize: 12, margin: "14px 0 0" }}>
        {isLogin ? "No account? " : "Have an account? "}
        <Link href={isLogin ? "/signup" : "/login"} style={{ color: "#a78bfa", fontWeight: 700, textDecoration: "none" }}>
          {isLogin ? "Sign up free" : "Sign in"}
        </Link>
      </p>
    </div>
  );

  /* ── MOBILE ── */
  if (isMobile) {
    return (
      <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", padding: "24px 20px" }}>
        <Link href="/" style={{ textDecoration: "none", marginBottom: 28 }}>
          <span style={{ fontSize: 24, fontWeight: 900, color: "#fff", fontStyle: "italic" }}>✦ Coursiv</span>
        </Link>
        <div style={{ width: "100%", maxWidth: 400, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.09)", borderRadius: 22, padding: "28px 24px" }}>
          {formContent}
        </div>
        <p style={{ color: "rgba(255,255,255,0.18)", fontSize: 11, textAlign: "center", marginTop: 16 }}>
          By continuing you agree to our Terms of Service
        </p>
      </div>
    );
  }

  /* ── DESKTOP ── */
  return (
    <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: "32px 24px" }}>
      <div style={{ width: "100%", maxWidth: 880, display: "grid", gridTemplateColumns: "1fr 1fr", borderRadius: 26, overflow: "hidden", boxShadow: "0 28px 70px rgba(0,0,0,0.5)", border: "1px solid rgba(255,255,255,0.07)" }}>

        {/* Left */}
        <div style={{ background: "rgba(255,255,255,0.03)", padding: "48px 40px", display: "flex", flexDirection: "column", justifyContent: "center", borderRight: "1px solid rgba(255,255,255,0.07)", position: "relative", overflow: "hidden" }}>
          <div style={{ position: "absolute", top: -80, right: -60, width: 250, height: 250, borderRadius: "50%", background: "rgba(139,92,246,0.12)", filter: "blur(40px)", pointerEvents: "none" }} />

          <div style={{ position: "relative", zIndex: 1 }}>
            <Link href="/" style={{ textDecoration: "none" }}>
              <span style={{ fontSize: 22, fontWeight: 900, color: "#fff", fontStyle: "italic", display: "block", marginBottom: 36 }}>✦ Coursiv</span>
            </Link>
            <h2 style={{ color: "#fff", fontSize: 30, fontWeight: 900, margin: "0 0 10px", lineHeight: 1.2 }}>
              {isLogin ? "Welcome back!" : "Start your AI journey."}
            </h2>
            <p style={{ color: "rgba(255,255,255,0.45)", fontSize: 14, margin: "0 0 28px", lineHeight: 1.6 }}>
              {isLogin ? "Sign in to continue building your AI skills." : "Join thousands mastering AI tools that matter."}
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 32 }}>
              {PERKS.map((perk, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div style={{ width: 18, height: 18, borderRadius: "50%", background: "rgba(167,139,250,0.2)", border: "1px solid rgba(167,139,250,0.4)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                    <CheckCircle2 size={10} color="#a78bfa" />
                  </div>
                  <span style={{ color: "rgba(255,255,255,0.55)", fontSize: 13 }}>{perk}</span>
                </div>
              ))}
            </div>
            <div style={{ display: "flex", gap: 6 }}>
              {[["🎨","Canva AI"], ["🤖","ChatGPT"], ["🖼️","Midjourney"]].map(([e, t]) => (
                <div key={t} style={{ background: "rgba(255,255,255,0.06)", border: "1px solid rgba(255,255,255,0.1)", borderRadius: 10, padding: "6px 10px", display: "flex", alignItems: "center", gap: 5 }}>
                  <span style={{ fontSize: 14 }}>{e}</span>
                  <span style={{ color: "rgba(255,255,255,0.6)", fontSize: 11, fontWeight: 600 }}>{t}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right */}
        <div style={{ background: "rgba(255,255,255,0.02)", padding: "48px 40px", display: "flex", alignItems: "center", justifyContent: "center" }}>
          {formContent}
        </div>
      </div>
    </div>
  );
}

function InputField({ icon, placeholder, type = "text", value, onChange, suffix, onEnter }) {
  const [focused, setFocused] = useState(false);
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 9, background: "rgba(20,16,60,0.85)", border: `1.5px solid ${focused ? "rgba(99,102,241,0.6)" : "rgba(255,255,255,0.1)"}`, borderRadius: 11, padding: "11px 13px", transition: "all 0.15s", boxShadow: focused ? "0 0 0 3px rgba(99,102,241,0.12)" : "none" }}>
      <span style={{ flexShrink: 0, opacity: 0.75 }}>{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        autoComplete="off"
        onChange={e => onChange(e.target.value)}
        onKeyDown={e => { if (e.key === "Enter") onEnter(); }}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={{ flex: 1, background: "transparent", border: "none", outline: "none", color: "#fff", fontSize: 13, caretColor: "#a78bfa", WebkitTextFillColor: "#fff" }}
      />
      {suffix}
    </div>
  );
}
```

### `components/layout/Navbar.jsx`
```jsx
"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, BookOpen, Trophy, Flame, ChevronDown, LogOut, User, Settings, Shield, Search, Menu, X } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import SearchModal from "@/components/layout/SearchModal";
import NotificationBell from "@/components/layout/NotificationBell";
import { useStreak } from "@/hooks/useStreak";

const NAV_LINKS = [
  { label:"Home",       href:"/",           icon:Home     },
  { label:"Courses",    href:"/courses",     icon:BookOpen },
  { label:"Challenges", href:"/challenges",  icon:Trophy   },
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user } = useAuth();
  const [showMenu, setShowMenu] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const { streak } = useStreak();
  const menuRef = useRef(null);

  const initials = user?.user_metadata?.full_name
    ? user.user_metadata.full_name.split(" ").map(n => n[0]).join("").toUpperCase().slice(0,2)
    : user?.email?.slice(0,2).toUpperCase() || "?";

  const displayName = user?.user_metadata?.full_name
    || user?.email?.split("@")[0]
    || "Learner";

  useEffect(() => {
    if (!user) return;
    supabase.from("profiles").select("is_admin").eq("id", user.id).single()
      .then(({ data }) => setIsAdmin(data?.is_admin || false));
  }, [user]);

  useEffect(() => {
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setShowMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault(); setShowSearch(true);
      }
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  };

  // Close mobile nav on route change
  useEffect(() => { setShowMobileNav(false); setShowMenu(false); }, [pathname]);

  return (
    <>
      <nav style={{ position:"sticky", top:0, zIndex:50, width:"100%", background:"#fff", borderBottom:"1px solid #F1F5F9", boxShadow:"0 1px 4px rgba(0,0,0,0.04)" }}>
        <div style={{ maxWidth:1152, margin:"0 auto", padding:"0 16px", height:60, display:"flex", alignItems:"center", justifyContent:"space-between", gap:12 }}>

          {/* Logo */}
          <Link href="/" style={{ textDecoration:"none", flexShrink:0 }}>
            <span style={{ fontSize:22, fontWeight:900, color:"#7c3aed", fontStyle:"italic" }}>✦ Coursiv</span>
          </Link>

          {/* Desktop nav links */}
          <div style={{ display:"flex", alignItems:"center", gap:2 }} className="hidden-mobile">
            {NAV_LINKS.map(({ label, href, icon: Icon }) => {
              const isActive = pathname === href;
              return (
                <Link key={href} href={href} style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:6, padding:"7px 14px", borderRadius:12, fontSize:13, fontWeight:600, background:isActive?"#EEF2FF":"transparent", color:isActive?"#6366f1":"#64748B", transition:"all 0.15s" }}>
                  <Icon size={15}/>{label}
                </Link>
              );
            })}
          </div>

          {/* Right side */}
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>

            {/* Search - desktop only */}
            <button onClick={() => setShowSearch(true)} className="hidden-mobile" style={{ display:"flex", alignItems:"center", gap:6, padding:"7px 12px", borderRadius:10, border:"1.5px solid #E2E8F0", background:"#F8FAFC", color:"#94A3B8", fontSize:12, cursor:"pointer" }}>
              <Search size={14}/> <span>Search</span>
              <kbd style={{ padding:"1px 5px", borderRadius:5, border:"1.5px solid #E2E8F0", background:"#fff", fontSize:10, fontWeight:700 }}>⌘K</kbd>
            </button>

            {/* Admin badge - desktop only */}
            {isAdmin && (
              <Link href="/admin" style={{ textDecoration:"none" }} className="hidden-mobile">
                <div style={{ display:"flex", alignItems:"center", gap:5, padding:"6px 11px", borderRadius:9, background:"linear-gradient(135deg,#4f46e5,#7c3aed)", boxShadow:"0 2px 8px rgba(99,102,241,0.35)", cursor:"pointer" }}>
                  <Shield size={12} color="#fff"/>
                  <span style={{ color:"#fff", fontSize:11, fontWeight:700 }}>Admin</span>
                </div>
              </Link>
            )}

            {/* Streak */}
            <div style={{ display:"flex", alignItems:"center", gap:5, background:"#FFF7ED", borderRadius:10, padding:"6px 10px", flexShrink:0 }}>
              <Flame size={14} fill="#f97316" color="#f97316"/>
              <span style={{ fontSize:13, fontWeight:700, color:"#f97316" }}>{streak}</span>
            </div>

            {/* Notifications */}
            <NotificationBell/>

            {/* User avatar button */}
            <div ref={menuRef} style={{ position:"relative" }}>
              <button onClick={() => setShowMenu(!showMenu)} style={{ width:36, height:36, borderRadius:"50%", background:"linear-gradient(135deg,#7c3aed,#4f46e5)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:13, fontWeight:800, color:"#fff", border:"2px solid #fff", boxShadow:"0 2px 8px rgba(0,0,0,0.12)", cursor:"pointer", flexShrink:0 }}>
                {initials}
              </button>

              {showMenu && (
                <div style={{ position:"absolute", right:0, top:"calc(100% + 8px)", width:200, background:"#fff", borderRadius:16, border:"1px solid #E5E7EB", boxShadow:"0 8px 32px rgba(0,0,0,0.12)", overflow:"hidden", zIndex:100 }}>
                  <div style={{ padding:"12px 14px", borderBottom:"1px solid #F3F4F6" }}>
                    <p style={{ fontSize:13, fontWeight:700, color:"#111827", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{displayName}</p>
                    <p style={{ fontSize:11, color:"#9CA3AF", margin:0, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{user?.email}</p>
                  </div>
                  <div style={{ padding:"6px" }}>
                    <DropItem icon={<User size={14}/>} label="Profile" onClick={() => router.push("/profile")}/>
                    {isAdmin && <DropItem icon={<Shield size={14}/>} label="Admin Panel" onClick={() => router.push("/admin")} accent/>}
                    <DropItem icon={<Search size={14}/>} label="Search" onClick={() => setShowSearch(true)}/>
                    <div style={{ height:1, background:"#F3F4F6", margin:"4px 0" }}/>
                    <DropItem icon={<LogOut size={14}/>} label="Sign out" onClick={handleSignOut} danger/>
                  </div>
                </div>
              )}
            </div>

            {/* Mobile hamburger */}
            <button onClick={() => setShowMobileNav(!showMobileNav)} className="show-mobile" style={{ width:36, height:36, borderRadius:10, border:"1.5px solid #E2E8F0", background:"#fff", display:"none", alignItems:"center", justifyContent:"center", cursor:"pointer" }}>
              {showMobileNav ? <X size={18} color="#374151"/> : <Menu size={18} color="#374151"/>}
            </button>
          </div>
        </div>

        {/* Mobile nav menu */}
        {showMobileNav && (
          <div style={{ background:"#fff", borderTop:"1px solid #F1F5F9", padding:"12px 16px 16px" }}>
            {NAV_LINKS.map(({ label, href, icon: Icon }) => (
              <Link key={href} href={href} style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:10, padding:"12px 14px", borderRadius:12, marginBottom:4, background:pathname===href?"#EEF2FF":"transparent", color:pathname===href?"#6366f1":"#374151", fontSize:14, fontWeight:600 }}>
                <Icon size={17}/> {label}
              </Link>
            ))}
            {isAdmin && (
              <Link href="/admin" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:10, padding:"12px 14px", borderRadius:12, marginBottom:4, background:"linear-gradient(135deg,#4f46e5,#7c3aed)", color:"#fff", fontSize:14, fontWeight:700 }}>
                <Shield size={17}/> Admin Panel
              </Link>
            )}
            <button onClick={() => { setShowMobileNav(false); setShowSearch(true); }} style={{ width:"100%", display:"flex", alignItems:"center", gap:10, padding:"12px 14px", borderRadius:12, border:"1.5px solid #E2E8F0", background:"#F8FAFC", color:"#64748B", fontSize:14, fontWeight:600, cursor:"pointer", marginTop:4 }}>
              <Search size={17}/> Search
            </button>
          </div>
        )}
      </nav>

      {showSearch && <SearchModal onClose={() => setShowSearch(false)}/>}

      <style>{`
        @media (max-width: 640px) {
          .hidden-mobile { display: none !important; }
          .show-mobile { display: flex !important; }
        }
        @media (min-width: 641px) {
          .show-mobile { display: none !important; }
          .hidden-mobile { display: flex !important; }
        }
      `}</style>
    </>
  );
}

function DropItem({ icon, label, onClick, danger, accent }) {
  const [hovered, setHovered] = useState(false);
  const color = danger?"#EF4444":accent?"#6366f1":"#374151";
  const hoverBg = danger?"#FEF2F2":accent?"#EEF2FF":"#F9FAFB";
  return (
    <button onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ width:"100%", display:"flex", alignItems:"center", gap:8, padding:"8px 10px", borderRadius:9, border:"none", background:hovered?hoverBg:"transparent", cursor:"pointer", color, fontSize:13, fontWeight:500, transition:"all 0.1s" }}>
      <span style={{ color:danger?"#EF4444":accent?"#6366f1":"#9CA3AF" }}>{icon}</span>
      {label}
    </button>
  );
}
```

### `components/home/BrowseCourses.jsx`
```jsx
"use client";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";

const STYLES = {
  "canva-ai":             { g:"linear-gradient(135deg,#ec4899,#8b5cf6)", e:"🎨", a:"#8b5cf6" },
  "midjourney":           { g:"linear-gradient(135deg,#6366f1,#0ea5e9)", e:"🖼️", a:"#6366f1" },
  "communicating-with-ai":{ g:"linear-gradient(135deg,#f97316,#fbbf24)", e:"💬", a:"#f97316" },
  "kling":                { g:"linear-gradient(135deg,#ec4899,#f43f5e)", e:"🎬", a:"#ec4899" },
  "lovable":              { g:"linear-gradient(135deg,#10b981,#06b6d4)", e:"💻", a:"#10b981" },
  "chatgpt":              { g:"linear-gradient(135deg,#10a37f,#0ea5e9)", e:"🤖", a:"#10a37f" },
  "notion-ai":            { g:"linear-gradient(135deg,#6b7280,#374151)", e:"📓", a:"#6b7280" },
};

export default function BrowseCourses({ courses = [] }) {
  const { getCoursePercent } = useProgress();

  return (
    <>
      <div>
        <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: 18 }}>
          <div>
            <h2 style={{ fontSize: 21, fontWeight: 900, color: "#0f172a", margin: "0 0 2px" }}>Browse Courses</h2>
            <p style={{ fontSize: 13, color: "#94A3B8", margin: 0 }}>Pick a course · Learn at your pace</p>
          </div>
          <Link href="/courses" style={{ textDecoration: "none", display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 700, color: "#5B4EFF", background: "#EEF0FF", padding: "9px 16px", borderRadius: 14 }}>
            View all <ArrowRight size={14} />
          </Link>
        </div>

        <div className="courses-grid">
          {courses.map((course) => {
            const s = STYLES[course.id] || { g: "linear-gradient(135deg,#6366f1,#8b5cf6)", e: "📚", a: "#6366f1" };
            const total = (course.units || []).flatMap(u => u.lessons || []).length;
            const pct = getCoursePercent(course.id, total);

            return (
              <Link key={course.id} href={"/courses/" + course.id} style={{ textDecoration: "none", display: "block", height: "100%" }}>
                <div
                  style={{ background: "#fff", borderRadius: 20, overflow: "hidden", border: "1.5px solid #F0F0F0", cursor: "pointer", transition: "all 0.2s", height: "100%", display: "flex", flexDirection: "column" }}
                  onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-4px)"; e.currentTarget.style.boxShadow = "0 12px 30px " + s.a + "30"; e.currentTarget.style.borderColor = s.a + "40"; } }
                  onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; e.currentTarget.style.borderColor = "#F0F0F0"; } }
                >
                  <div style={{ background: course.imageUrl ? `url(${course.imageUrl}) center/cover` : s.g, height: 100, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 42, position: "relative", overflow: "hidden" }}>
                    <div style={{ position: "absolute", top: -20, right: -20, width: 80, height: 80, borderRadius: "50%", background: "rgba(255,255,255,0.1)" }} />
                    {!course.imageUrl && <span style={{ position: "relative", zIndex: 1 }}>{s.e}</span>}
                    {pct === 100 && (
                      <div style={{ position: "absolute", top: 8, right: 8, background: "#22C55E", color: "#fff", fontSize: 8, fontWeight: 700, padding: "2px 7px", borderRadius: 999 }}>✓ DONE</div>
                    )}
                  </div>
                  <div style={{ padding: "12px 14px 14px", flex: 1, display: "flex", flexDirection: "column" }}>
                    <h3 style={{ fontSize: 13, fontWeight: 800, color: "#0f172a", margin: "0 0 2px", lineHeight: 1.3 }}>{course.title}</h3>
                    <p style={{ fontSize: 11, color: "#94A3B8", margin: "0 0 8px", flex: 1 }}>{total} lessons · {course.hours}h</p>
                    {pct > 0 && (
                      <div style={{ background: "#F1F5F9", borderRadius: 999, height: 4, overflow: "hidden" }}>
                        <div style={{ height: "100%", borderRadius: 999, background: s.g, width: pct + "%", transition: "width 0.6s" }} />
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>

      <style>{`
        .courses-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 14px;
        }
        @media (max-width: 640px) {
          .courses-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 12px;
          }
        }
      `}</style>
    </>
  );
}```

### `components/home/ChallengesSection.jsx`
```jsx
"use client";
import Link from "next/link";
import { ArrowRight, Flame, Zap } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";

export default function ChallengesSection({ challenges = [] }) {
  const { getChallengeDayPercent, hasJoinedChallenge } = useProgress();

  return (
    <div>
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:20 }}>
        <div>
          <h2 style={{ fontSize:22, fontWeight:900, color:"#0f172a", margin:"0 0 4px" }}>Daily Challenges</h2>
          <p style={{ fontSize:13, color:"#94A3B8", margin:0 }}>Level up one day at a time</p>
        </div>
        <Link href="/challenges" style={{ textDecoration:"none", display:"flex", alignItems:"center", gap:6, fontSize:13, fontWeight:700, color:"#f97316", background:"#FFF7ED", padding:"9px 18px", borderRadius:12 }}>
          View all <ArrowRight size={14}/>
        </Link>
      </div>

      <div className="ch-grid">
        {challenges.map((ch, i) => {
          const pct = getChallengeDayPercent(ch.id, ch.days);
          const joined = hasJoinedChallenge(ch.id);

          return (
            <Link key={ch.id} href={"/challenges/"+ch.id} style={{ textDecoration:"none", display:"block", height:"100%" }}>
              <div style={{ background:"#fff", borderRadius:20, overflow:"hidden", border:"1.5px solid #F1F5F9", transition:"all 0.2s", cursor:"pointer", height:"100%", display:"flex", flexDirection:"column" }}
                onMouseEnter={e=>{ e.currentTarget.style.transform="translateY(-3px)"; e.currentTarget.style.boxShadow="0 12px 32px rgba(0,0,0,0.1)"; }}
                onMouseLeave={e=>{ e.currentTarget.style.transform=""; e.currentTarget.style.boxShadow=""; }}>

                {/* Gradient header */}
                <div style={{ background:ch.imageUrl ? `url(${ch.imageUrl}) center/cover` : (ch.gradientBg||"linear-gradient(135deg,#667eea,#764ba2)"), height:130, padding:"16px", display:"flex", flexDirection:"column", justifyContent:"space-between", position:"relative", overflow:"hidden" }}>
                  <div style={{ position:"absolute", top:-30, right:-30, width:120, height:120, borderRadius:"50%", background:"rgba(255,255,255,0.08)" }}/>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                    {!ch.imageUrl && <span style={{ fontSize:36 }}>{ch.emoji}</span>}
                    <div style={{ background:"rgba(255,255,255,0.2)", borderRadius:999, padding:"4px 10px", display:"flex", alignItems:"center", gap:4 }}>
                      <Zap size={11} color="#fff" fill="#fff"/>
                      <span style={{ color:"#fff", fontSize:11, fontWeight:800 }}>{ch.days} DAYS</span>
                    </div>
                  </div>
                  <div>
                    <h3 style={{ color:"#fff", fontSize:15, fontWeight:800, margin:"0 0 2px", lineHeight:1.3 }}>{ch.title}</h3>
                    <p style={{ color:"rgba(255,255,255,0.7)", fontSize:11, margin:0 }}>{ch.subtitle}</p>
                  </div>
                </div>

                {/* Bottom */}
                <div style={{ padding:"14px 16px", flex:1, display:"flex", flexDirection:"column", justifyContent:"flex-end" }}>
                  {pct > 0 ? (
                    <div>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:6 }}>
                        <span style={{ fontSize:11, color:"#64748B", fontWeight:600 }}>Progress</span>
                        <span style={{ fontSize:11, fontWeight:800, color:"#f97316" }}>{pct}%</span>
                      </div>
                      <div style={{ background:"#F1F5F9", borderRadius:999, height:5, overflow:"hidden" }}>
                        <div style={{ height:"100%", borderRadius:999, background:"linear-gradient(to right,#f97316,#fbbf24)", width:pct+"%", transition:"width 0.6s" }}/>
                      </div>
                    </div>
                  ) : (
                    <div style={{ display:"flex", alignItems:"center", gap:6, padding:"9px 14px", borderRadius:10, background:"#FFF7ED", border:"1.5px solid #FED7AA" }}>
                      <Flame size={14} color="#f97316" fill="#f97316"/>
                      <span style={{ fontSize:12, fontWeight:700, color:"#c2410c" }}>
                        {joined ? "Continue challenge" : "Start challenge"}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          );
        })}
      </div>


      <style>{`
        .ch-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:16px; }
        @media (max-width: 1024px) { .ch-grid { grid-template-columns:repeat(2,1fr); gap:12px; } }
        @media (max-width: 640px) { .ch-grid { grid-template-columns:1fr; gap:12px; } }
      `}</style>
    </div>
  );
}
```

### `components/home/CurrentCourseWidget.jsx`
```jsx
"use client";
import Link from "next/link";
import { Play, BookOpen, CheckCircle2, Layers } from "lucide-react";
import { useProgress } from "@/hooks/useProgress";

const STYLES = {
  "canva-ai":             { grad:"linear-gradient(135deg,#ec4899 0%,#8b5cf6 100%)", emoji:"🎨", accent:"#8b5cf6" },
  "midjourney":           { grad:"linear-gradient(135deg,#6366f1 0%,#06b6d4 100%)", emoji:"🖼️", accent:"#6366f1" },
  "communicating-with-ai":{ grad:"linear-gradient(135deg,#f97316 0%,#facc15 100%)", emoji:"💬", accent:"#f97316" },
  "kling":                { grad:"linear-gradient(135deg,#ec4899 0%,#f43f5e 100%)", emoji:"🎬", accent:"#ec4899" },
  "lovable":              { grad:"linear-gradient(135deg,#10b981 0%,#06b6d4 100%)", emoji:"💻", accent:"#10b981" },
  "chatgpt":              { grad:"linear-gradient(135deg,#10a37f 0%,#0ea5e9 100%)", emoji:"🤖", accent:"#10a37f" },
  "notion-ai":            { grad:"linear-gradient(135deg,#374151 0%,#111827 100%)", emoji:"📓", accent:"#6b7280" },
};

export default function CurrentCourseWidget({ courses = [] }) {
  if (!courses || courses.length === 0) return (
    <div style={{ background:"#fff", borderRadius:24, border:"1px solid #EFEFEF", padding:"40px 24px", textAlign:"center" }}>
      <div style={{ fontSize:32, marginBottom:8 }}>📚</div>
      <p style={{ fontSize:14, color:"#94A3B8", margin:0 }}>No courses yet</p>
    </div>
  );
  const { getCoursePercent, getCompletedLessons } = useProgress();

  const activeCourse = courses.find(c => {
    const total = c.units.flatMap(u => u.lessons).length;
    const pct = getCoursePercent(c.id, total);
    return pct > 0 && pct < 100;
  }) || courses[0];

  const allLessons = activeCourse.units.flatMap(u => u.lessons);
  const total = allLessons.length;
  const pct = getCoursePercent(activeCourse.id, total);
  const done = getCompletedLessons(activeCourse.id).length;
  const next = allLessons.find(l => !getCompletedLessons(activeCourse.id).includes(l.id));
  const s = STYLES[activeCourse.id] || { grad:"linear-gradient(135deg,#6366f1,#8b5cf6)", emoji:"📚", accent:"#6366f1" };

  return (
    <div style={{ background:"#fff",borderRadius:24,border:"1px solid #EFEFEF",overflow:"hidden",boxShadow:"0 4px 16px rgba(0,0,0,0.06)" }}>
      {/* Gradient hero */}
      <div style={{ background:s.grad,padding:"22px 24px 0",position:"relative",overflow:"hidden" }}>
        <div style={{ position:"absolute",top:-40,right:-30,width:160,height:160,borderRadius:"50%",background:"rgba(255,255,255,0.08)" }} />
        <div style={{ position:"absolute",top:10,right:60,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.05)" }} />

        <div style={{ position:"relative",zIndex:1,display:"flex",justifyContent:"space-between",alignItems:"flex-start",marginBottom:16 }}>
          <div>
            <div style={{ display:"inline-flex",alignItems:"center",gap:5,background:"rgba(255,255,255,0.18)",borderRadius:8,padding:"3px 10px",marginBottom:8 }}>
              <BookOpen size={10} color="#fff" />
              <span style={{ color:"#fff",fontSize:10,fontWeight:700,letterSpacing:0.5 }}>CURRENT COURSE</span>
            </div>
            <h3 style={{ color:"#fff",fontSize:"clamp(18px,4vw,24px)",fontWeight:900,margin:"0 0 4px",lineHeight:1.15 }}>{activeCourse.title}</h3>
            <p style={{ color:"rgba(255,255,255,0.65)",fontSize:13,margin:0 }}>{activeCourse.description}</p>
          </div>
          <div style={{ fontSize:48,lineHeight:1,marginTop:-4,flexShrink:0 }}>{s.emoji}</div>
        </div>

        {/* Stats row */}
        <div style={{ display:"flex",gap:8,flexWrap:"wrap",marginBottom:0 }}>
          {[
            { icon:<Layers size={13} color="rgba(255,255,255,0.7)" />, label:`${total} lessons` },
            { icon:<CheckCircle2 size={13} color="rgba(255,255,255,0.7)" />, label:`${done} done` },
            { icon:<Play size={13} color="rgba(255,255,255,0.7)" fill="rgba(255,255,255,0.7)" />, label:`${activeCourse.hours}h total` },
          ].map((item, i) => (
            <div key={i} style={{ display:"flex",alignItems:"center",gap:5,background:"rgba(255,255,255,0.12)",borderRadius:8,padding:"5px 10px" }}>
              {item.icon}
              <span style={{ color:"rgba(255,255,255,0.85)",fontSize:11,fontWeight:600 }}>{item.label}</span>
            </div>
          ))}
        </div>

        {/* Progress bar flush */}
        <div style={{ marginTop:16,height:5,background:"rgba(255,255,255,0.15)" }}>
          <div style={{ height:"100%",background:"rgba(255,255,255,0.9)",width:`${pct}%`,transition:"width 0.8s ease" }} />
        </div>
      </div>

      {/* Bottom */}
      <div style={{ padding:"16px 20px" }}>
        {next && (
          <div style={{ display:"flex",alignItems:"center",gap:10,background:"#F9FAFB",borderRadius:12,padding:"10px 14px",marginBottom:12 }}>
            <div style={{ width:7,height:7,borderRadius:"50%",background:s.accent,flexShrink:0 }} />
            <span style={{ fontSize:12,color:"#6B7280" }}>Next: </span>
            <span style={{ fontSize:12,fontWeight:600,color:"#111827",flex:1,overflow:"hidden",textOverflow:"ellipsis",whiteSpace:"nowrap" }}>{next.title}</span>
            <span style={{ fontSize:11,color:"#9CA3AF",fontWeight:600,flexShrink:0 }}>{pct}%</span>
          </div>
        )}
        <div style={{ display:"flex",gap:10 }}>
          <Link href="/courses" style={{ textDecoration:"none",flex:1 }}>
            <div style={{ padding:"12px",borderRadius:14,border:"1.5px solid #E5E7EB",textAlign:"center",fontSize:13,fontWeight:600,color:"#4B5563",cursor:"pointer" }}>
              All courses
            </div>
          </Link>
          <Link href={`/courses/${activeCourse.id}`} style={{ textDecoration:"none",flex:2 }}>
            <div style={{ padding:"12px",borderRadius:14,background:s.grad,textAlign:"center",fontSize:13,fontWeight:700,color:"#fff",cursor:"pointer",display:"flex",alignItems:"center",justifyContent:"center",gap:6,boxShadow:`0 4px 14px ${s.accent}55` }}>
              <Play size={13} fill="#fff" color="#fff" />
              {pct > 0 ? "Continue learning" : "Start course"}
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
```

### `components/courses/CoursesList.jsx`
```jsx
"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, BookOpen, Clock, Trophy, ArrowRight, CheckCircle2, Play } from "lucide-react";

import { useProgress } from "@/hooks/useProgress";

const CATS = ["All", "Design", "Productivity", "Video", "No Code"];

const S = {
  "canva-ai":             { g:"linear-gradient(135deg,#ec4899,#8b5cf6)", e:"🎨", a:"#8b5cf6", al:"rgba(139,92,246,0.12)" },
  "midjourney":           { g:"linear-gradient(135deg,#6366f1,#0ea5e9)", e:"🖼️", a:"#6366f1", al:"rgba(99,102,241,0.12)" },
  "communicating-with-ai":{ g:"linear-gradient(135deg,#f97316,#fbbf24)", e:"💬", a:"#f97316", al:"rgba(249,115,22,0.12)" },
  "kling":                { g:"linear-gradient(135deg,#ec4899,#f43f5e)", e:"🎬", a:"#ec4899", al:"rgba(236,72,153,0.12)" },
  "lovable":              { g:"linear-gradient(135deg,#10b981,#06b6d4)", e:"💻", a:"#10b981", al:"rgba(16,185,129,0.12)" },
  "chatgpt":              { g:"linear-gradient(135deg,#10a37f,#0ea5e9)", e:"🤖", a:"#10a37f", al:"rgba(16,163,127,0.12)" },
  "notion-ai":            { g:"linear-gradient(135deg,#6b7280,#374151)", e:"📓", a:"#6b7280", al:"rgba(107,114,128,0.12)" },
};

const coursesGridStyle = `
  .courses-list-grid { display:grid; grid-template-columns: repeat(4, 1fr); gap:20px; }
  @media (max-width: 1024px) { .courses-list-grid { grid-template-columns: repeat(2, 1fr); gap:14px; } }
  @media (max-width: 640px) { .courses-list-grid { grid-template-columns: repeat(2, 1fr); gap:12px; } }
`;

export default function CoursesList({ courses = [] }) {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");
  const { getCoursePercent } = useProgress();

  const filtered = courses.filter(c => {
    const mQ = !q || c.title.toLowerCase().includes(q.toLowerCase()) || c.description.toLowerCase().includes(q.toLowerCase());
    const mC = cat === "All" || c.category === cat;
    return mQ && mC;
  });

  const inProgress = courses.filter(c => {
    const total = (c.units || []).flatMap(u => u.lessons || []).length;
    const pct = getCoursePercent(c.id, total);
    return pct > 0 && pct < 100;
  }).length;

  const completed = courses.filter(c => {
    const total = c.units.flatMap(u => u.lessons).length;
    return getCoursePercent(c.id, total) === 100;
  }).length;

  return (
    <>
      <div style={{ display:"flex", flexDirection:"column", gap:28 }}>

        {/* ── Hero ── */}
        <div style={{
          background:"linear-gradient(135deg,#0f172a 0%,#1e1b4b 55%,#0f2744 100%)",
          borderRadius:24,padding:"36px 40px",position:"relative",overflow:"hidden",
        }}>
          <div style={{ position:"absolute",top:-60,right:80,width:220,height:220,borderRadius:"50%",background:"rgba(99,102,241,0.08)" }} />
          <div style={{ position:"absolute",bottom:-40,left:100,width:140,height:140,borderRadius:"50%",background:"rgba(139,92,246,0.07)" }} />
          <div style={{ position:"absolute",top:20,right:220,width:5,height:5,borderRadius:"50%",background:"#818cf8",opacity:0.8 }} />
          <div style={{ position:"absolute",top:40,right:180,width:3,height:3,borderRadius:"50%",background:"#a78bfa",opacity:0.5 }} />

          <div style={{ position:"relative",zIndex:1 }}>
            <div style={{ display:"inline-flex",alignItems:"center",gap:6,background:"rgba(99,102,241,0.2)",borderRadius:8,padding:"4px 12px",marginBottom:14 }}>
              <BookOpen size={12} color="#a5b4fc" />
              <span style={{ color:"#a5b4fc",fontSize:11,fontWeight:700,letterSpacing:0.8 }}>AI COURSES</span>
            </div>
            <h1 style={{ color:"#fff",fontSize:30,fontWeight:900,margin:"0 0 8px",lineHeight:1.2 }}>
              Learn the tools<br />
              <span style={{ color:"#818cf8" }}>shaping the future.</span>
            </h1>
            <p style={{ color:"rgba(255,255,255,0.45)",fontSize:14,margin:"0 0 24px",maxWidth:420 }}>
              Practical, bite-sized courses on the AI tools that matter. Learn at your own pace.
            </p>

            {/* Stats row */}
            <div style={{ display:"flex",gap:28 }}>
              {[
                [courses.length, "Total courses"],
                [inProgress, "In progress"],
                [completed, "Completed"],
              ].map(([v, l]) => (
                <div key={l}>
                  <div style={{ color:"#fff",fontSize:24,fontWeight:900,lineHeight:1 }}>{v}</div>
                  <div style={{ color:"rgba(255,255,255,0.4)",fontSize:11,marginTop:3 }}>{l}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── Search + Filters ── */}
        <div style={{ display:"flex",flexWrap:"wrap",gap:10,alignItems:"center" }}>
          {/* Search */}
          <div style={{ position:"relative",flex:1,minWidth:200 }}>
            <Search size={15} color="#94A3B8" style={{ position:"absolute",left:14,top:"50%",transform:"translateY(-50%)",pointerEvents:"none" }} />
            <input
              value={q}
              onChange={e => setQ(e.target.value)}
              placeholder="Search courses..."
              style={{
                width:"100%",boxSizing:"border-box",
                paddingLeft:40,paddingRight:16,paddingTop:11,paddingBottom:11,
                borderRadius:14,border:"1.5px solid #E2E8F0",
                fontSize:13,outline:"none",background:"#fff",color:"#0f172a",
                boxShadow:"0 1px 3px rgba(0,0,0,0.04)",
              }}
              onFocus={e => { e.target.style.borderColor="#5B4EFF"; e.target.style.boxShadow="0 0 0 3px rgba(91,78,255,0.1)"; }}
              onBlur={e => { e.target.style.borderColor="#E2E8F0"; e.target.style.boxShadow="0 1px 3px rgba(0,0,0,0.04)"; }}
            />
          </div>

          {/* Category pills */}
          <div style={{ display:"flex",gap:6,flexWrap:"wrap" }}>
            {CATS.map(c => (
              <button key={c} onClick={() => setCat(c)} style={{
                padding:"9px 18px",borderRadius:999,fontSize:13,fontWeight:600,cursor:"pointer",
                border: cat===c ? "none" : "1.5px solid #E2E8F0",
                background: cat===c ? "#5B4EFF" : "#fff",
                color: cat===c ? "#fff" : "#64748B",
                boxShadow: cat===c ? "0 4px 12px rgba(91,78,255,0.3)" : "none",
                transition:"all 0.15s",
              }}>
                {c}
              </button>
            ))}
          </div>

          <span style={{ color:"#94A3B8",fontSize:13,marginLeft:"auto",flexShrink:0 }}>
            {filtered.length} course{filtered.length!==1?"s":""}
          </span>
        </div>

        {/* ── In-progress section ── */}
        {cat === "All" && !q && inProgress > 0 && (
          <div>
            <h2 style={{ fontSize:17,fontWeight:800,color:"#0f172a",margin:"0 0 14px" }}>Continue learning</h2>
            <div className="courses-list-grid">
              {courses.filter(c => {
                const total = c.units.flatMap(u => u.lessons).length;
                const pct = getCoursePercent(c.id, total);
                return pct > 0 && pct < 100;
              }).map(course => <CourseCard key={course.id} course={course} getCoursePercent={getCoursePercent} isHighlighted />)}
            </div>
          </div>
        )}

        {/* ── All courses grid ── */}
        <div>
          {cat === "All" && !q && inProgress > 0 && (
            <h2 style={{ fontSize:17,fontWeight:800,color:"#0f172a",margin:"0 0 14px" }}>All courses</h2>
          )}

          {filtered.length > 0 ? (
            <div className="courses-list-grid">
              {filtered.map(course => (
                <CourseCard key={course.id} course={course} getCoursePercent={getCoursePercent} />
              ))}
            </div>
          ) : (
            <div style={{ display:"flex",flexDirection:"column",alignItems:"center",justifyContent:"center",padding:"64px 20px",textAlign:"center" }}>
              <div style={{ fontSize:52,marginBottom:16 }}>🔍</div>
              <h3 style={{ fontSize:18,fontWeight:800,color:"#0f172a",margin:"0 0 6px" }}>No courses found</h3>
              <p style={{ fontSize:14,color:"#94A3B8",margin:0 }}>Try a different search or category</p>
            </div>
          )}
        </div>
      </div>
      
      {/* ── Globally injected CSS block ── */}
      <style>{coursesGridStyle}</style>
    </>
  );
}

function CourseCard({ course, getCoursePercent, isHighlighted }) {
  const s = S[course.id] || { g:"linear-gradient(135deg,#6366f1,#8b5cf6)", e:"📚", a:"#6366f1", al:"rgba(99,102,241,0.1)" };
  const total = course.units.flatMap(u => u.lessons).length;
  const pct = getCoursePercent(course.id, total);
  const isDone = pct === 100;
  const isStarted = pct > 0;

  return (
    <Link href={`/courses/${course.id}`} style={{ textDecoration:"none", display:"block", height:"100%" }}>
      <div
        style={{
          background:"#fff",borderRadius:22,overflow:"hidden",cursor:"pointer",
          border: isHighlighted ? `1.5px solid ${s.a}40` : "1.5px solid #F1F5F9",
          boxShadow: isHighlighted ? `0 4px 20px ${s.a}18` : "0 2px 8px rgba(0,0,0,0.05)",
          transition:"all 0.2s",
          height:"100%", display:"flex", flexDirection:"column",
        }}
        onMouseEnter={e => { e.currentTarget.style.transform="translateY(-5px)"; e.currentTarget.style.boxShadow=`0 16px 40px ${s.a}25`; e.currentTarget.style.borderColor=`${s.a}40`; }}
        onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow=isHighlighted?`0 4px 20px ${s.a}18`:"0 2px 8px rgba(0,0,0,0.05)"; e.currentTarget.style.borderColor=isHighlighted?`${s.a}40`:"#F1F5F9"; }}
      >
        {/* Hero */}
        <div style={{ background:course.imageUrl ? `url(${course.imageUrl}) center/cover` : s.g,height:155,display:"flex",alignItems:"center",justifyContent:"space-between",padding:"20px 22px",position:"relative",overflow:"hidden" }}>
          <div style={{ position:"absolute",top:-30,right:-30,width:130,height:130,borderRadius:"50%",background:"rgba(255,255,255,0.09)" }} />
          <div style={{ position:"absolute",bottom:-20,left:40,width:80,height:80,borderRadius:"50%",background:"rgba(255,255,255,0.06)" }} />
          
          {!course.imageUrl && <span style={{ fontSize:52,position:"relative",zIndex:1,filter:"drop-shadow(0 4px 12px rgba(0,0,0,0.2))" }}>{s.e}</span>}

          <div style={{ position:"relative",zIndex:1,display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6 }}>
            <span style={{ background:"rgba(255,255,255,0.22)",color:"#fff",fontSize:10,fontWeight:700,padding:"3px 10px",borderRadius:999,letterSpacing:0.5 }}>
              {course.level}
            </span>
            {isDone && (
              <div style={{ background:"rgba(34,197,94,0.9)",borderRadius:999,padding:"3px 10px",display:"flex",alignItems:"center",gap:4 }}>
                <CheckCircle2 size={10} color="#fff" />
                <span style={{ color:"#fff",fontSize:10,fontWeight:700 }}>Complete</span>
              </div>
            )}
            {isStarted && !isDone && (
              <div style={{ background:"rgba(255,255,255,0.18)",borderRadius:999,padding:"3px 10px" }}>
                <span style={{ color:"#fff",fontSize:10,fontWeight:700 }}>{pct}%</span>
              </div>
            )}
          </div>
        </div>

        {/* Body */}
        <div style={{ padding:"18px 20px 20px", flex:1, display:"flex", flexDirection:"column" }}>
          <h3 style={{ fontSize:16,fontWeight:800,color:"#0f172a",margin:"0 0 4px",lineHeight:1.3 }}>{course.title}</h3>
          <p style={{ fontSize:13,color:"#64748B",margin:"0 0 14px",lineHeight:1.55,overflow:"hidden",display:"-webkit-box",WebkitLineClamp:2,WebkitBoxOrient:"vertical" }}>
            {course.description}
          </p>

          {/* Meta pills */}
          <div style={{ display:"flex",gap:6,marginBottom:14,flexWrap:"wrap" }}>
            {[
              { icon:<BookOpen size={10} color={s.a} />, text:`${total} lessons` },
              { icon:<Clock size={10} color={s.a} />, text:`${course.hours}h` },
              { icon:<Trophy size={10} color={s.a} />, text:course.category },
            ].map((m, i) => (
              <div key={i} style={{ display:"flex",alignItems:"center",gap:4,background:s.al,borderRadius:8,padding:"4px 9px" }}>
                {m.icon}
                <span style={{ fontSize:11,fontWeight:600,color:s.a }}>{m.text}</span>
              </div>
            ))}
          </div>

          {/* Progress or CTA */}
          <div style={{ marginTop:"auto" }}>
          {isStarted ? (
            <div>
              <div style={{ display:"flex",justifyContent:"space-between",marginBottom:5 }}>
                <span style={{ fontSize:11,color:"#94A3B8" }}>
                  {isDone ? "Completed!" : "In progress"}
                </span>
                <span style={{ fontSize:11,fontWeight:700,color:s.a }}>{pct}%</span>
              </div>
              <div style={{ background:"#F1F5F9",borderRadius:999,height:5,overflow:"hidden" }}>
                <div style={{ height:5,borderRadius:999,background:s.g,width:`${pct}%`,transition:"width 0.6s" }} />
              </div>
            </div>
          ) : (
            <div style={{ display:"flex",alignItems:"center",justifyContent:"space-between",background:s.al,borderRadius:13,padding:"11px 14px" }}>
              <span style={{ fontSize:13,fontWeight:700,color:s.a }}>Start course</span>
              <div style={{ width:26,height:26,borderRadius:"50%",background:s.g,display:"flex",alignItems:"center",justifyContent:"center" }}>
                <Play size={12} color="#fff" fill="#fff" />
              </div>
            </div>
          )}
          </div>
        </div>
      </div>
    </Link>
  );
}```

### `components/challenges/ChallengesList.jsx`
```jsx
"use client";

import Link from "next/link";
import { useState } from "react";

import { useProgress } from "@/hooks/useProgress";
import { Clock, BarChart2, Flame, ArrowRight, CheckCircle2 } from "lucide-react";

const FILTERS = ["All", "14 days", "28 days"];

const CARD_STYLES = [
  { grad:"linear-gradient(135deg,#667eea,#764ba2)", light:"#f5f3ff", tag:"#7c3aed", tagBg:"#ede9fe" },
  { grad:"linear-gradient(135deg,#f093fb,#f5576c)", light:"#fdf2f8", tag:"#be185d", tagBg:"#fce7f3" },
  { grad:"linear-gradient(135deg,#4facfe,#00f2fe)", light:"#f0f9ff", tag:"#0369a1", tagBg:"#e0f2fe" },
  { grad:"linear-gradient(135deg,#43e97b,#38f9d7)", light:"#ecfdf5", tag:"#065f46", tagBg:"#d1fae5" },
];

export default function ChallengesList({ challenges = [] }) {
  const { getChallengeDayPercent, hasJoinedChallenge } = useProgress();
  const [filter, setFilter] = useState("All");

  const filtered = challenges.filter(c => {
    if (filter === "All") return true;
    if (filter === "14 days") return c.days === 14;
    if (filter === "28 days") return c.days === 28;
    return true;
  });

  const totalEnrolled = challenges.filter(c => hasJoinedChallenge(c.id)).length;

  return (
    <div>
      {/* Hero header */}
      <div style={{ background:"linear-gradient(135deg,#1e1b4b,#312e81,#4c1d95)", borderRadius:24, padding:"48px 40px", marginBottom:32, position:"relative", overflow:"hidden" }}>
        <div style={{ position:"absolute", top:-60, right:-60, width:240, height:240, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />
        <div style={{ position:"absolute", bottom:-40, left:120, width:160, height:160, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />
        <div style={{ position:"absolute", top:20, right:180, width:80, height:80, borderRadius:"50%", background:"rgba(167,139,250,0.12)" }} />
        <div style={{ position:"relative", zIndex:1 }}>
          <div style={{ display:"inline-flex", alignItems:"center", gap:6, background:"rgba(167,139,250,0.2)", borderRadius:10, padding:"5px 12px", marginBottom:16 }}>
            <Flame size={13} color="#c4b5fd" />
            <span style={{ color:"#c4b5fd", fontSize:11, fontWeight:700, letterSpacing:1 }}>DAILY CHALLENGES</span>
          </div>
          <h1 style={{ color:"#fff", fontSize:34, fontWeight:800, margin:"0 0 8px", lineHeight:1.2 }}>
            Push your limits.<br />
            <span style={{ color:"#a78bfa" }}>Level up every day.</span>
          </h1>
          <p style={{ color:"rgba(255,255,255,0.55)", fontSize:15, margin:"0 0 28px", maxWidth:440 }}>
            Short daily lessons that build real AI skills. Pick a challenge and commit to the streak.
          </p>
          <div style={{ display:"flex", gap:28 }}>
            {[["Challenges", challenges.length], ["Enrolled", totalEnrolled], ["Max days", 28]].map(([label, val]) => (
              <div key={label}>
                <div style={{ color:"#fff", fontSize:26, fontWeight:800, lineHeight:1 }}>{val}</div>
                <div style={{ color:"rgba(255,255,255,0.45)", fontSize:12, marginTop:3 }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Filters */}
      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:24 }}>
        {FILTERS.map(f => (
          <button key={f} onClick={() => setFilter(f)} style={{
            padding:"8px 18px", borderRadius:999, fontSize:13, fontWeight:600, cursor:"pointer",
            border: filter===f ? "none" : "1.5px solid #E5E7EB",
            background: filter===f ? "#5B4EFF" : "#fff",
            color: filter===f ? "#fff" : "#6B7280",
            transition:"all 0.15s",
          }}>
            {f}
          </button>
        ))}
        <span style={{ marginLeft:"auto", color:"#9CA3AF", fontSize:13 }}>
          {filtered.length} challenge{filtered.length !== 1 ? "s" : ""}
        </span>
      </div>

      {/* Grid */}
      <style>{`
        .challenges-list-grid { display:grid; grid-template-columns:repeat(4,1fr); gap:20px; }
        @media (max-width: 1024px) { .challenges-list-grid { grid-template-columns:repeat(2,1fr); gap:14px; } }
        @media (max-width: 640px) { .challenges-list-grid { grid-template-columns:repeat(2,1fr); gap:12px; } }
      `}</style>
      <div className="challenges-list-grid">
        {filtered.map((challenge, i) => {
          const s       = CARD_STYLES[i % CARD_STYLES.length];
          const percent = getChallengeDayPercent(challenge.id, challenge.days);
          const joined  = hasJoinedChallenge(challenge.id);
          const daysDone = Math.round((percent / 100) * challenge.days);
          const daysLeft = challenge.days - daysDone;

          return (
            <Link key={challenge.id} href={`/challenges/${challenge.id}${joined?"?joined=true":""}`}
              style={{ textDecoration:"none", display:"block", height:"100%" }}>
              <div
                style={{ background:"#fff", borderRadius:20, overflow:"hidden", border:"1px solid #F0F0F0", boxShadow:"0 2px 8px rgba(0,0,0,0.05)", transition:"all 0.2s ease", cursor:"pointer", height:"100%", display:"flex", flexDirection:"column" }}
                onMouseEnter={e => { e.currentTarget.style.transform="translateY(-4px)"; e.currentTarget.style.boxShadow="0 16px 40px rgba(0,0,0,0.12)"; }}
                onMouseLeave={e => { e.currentTarget.style.transform="translateY(0)"; e.currentTarget.style.boxShadow="0 2px 8px rgba(0,0,0,0.05)"; }}
              >
                {/* Hero */}
                <div style={{ background:challenge.imageUrl ? `url(${challenge.imageUrl}) center/cover` : s.grad, height:165, padding:"24px 26px", position:"relative", overflow:"hidden", display:"flex", flexDirection:"column", justifyContent:"space-between" }}>
                  <div style={{ position:"absolute", top:-40, right:-40, width:140, height:140, borderRadius:"50%", background:"rgba(255,255,255,0.09)" }} />
                  <div style={{ position:"absolute", bottom:-24, left:40, width:96, height:96, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }} />

                  {/* Top row */}
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", position:"relative", zIndex:1 }}>
                    {!challenge.imageUrl && <span style={{ fontSize:44, lineHeight:1 }}>{challenge.emoji}</span>}
                    {joined && (
                      <div style={{ background:"rgba(255,255,255,0.92)", borderRadius:10, padding:"4px 10px", display:"flex", alignItems:"center", gap:5 }}>
                        <CheckCircle2 size={12} color="#22C55E" />
                        <span style={{ fontSize:11, fontWeight:700, color:"#15803D" }}>Enrolled</span>
                      </div>
                    )}
                  </div>

                  {/* Bottom pills */}
                  <div style={{ display:"flex", gap:6, position:"relative", zIndex:1 }}>
                    <span style={{ background:"rgba(255,255,255,0.22)", backdropFilter:"blur(4px)", color:"#fff", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:999 }}>
                      {challenge.days} DAYS
                    </span>
                    <span style={{ background:"rgba(255,255,255,0.22)", backdropFilter:"blur(4px)", color:"#fff", fontSize:11, fontWeight:700, padding:"3px 10px", borderRadius:999 }}>
                      {challenge.level.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Body */}
                <div style={{ padding:"20px 22px 22px", flex:1, display:"flex", flexDirection:"column" }}>
                  <h3 style={{ fontSize:15, fontWeight:800, color:"#111827", margin:"0 0 5px", lineHeight:1.3 }}>
                    {challenge.title}
                  </h3>
                  <p style={{ fontSize:13, color:"#6B7280", margin:"0 0 16px", lineHeight:1.55 }}>
                    {challenge.subtitle}
                  </p>

                  {/* Progress or tags */}
                  {joined && percent > 0 ? (
                    <div style={{ marginBottom:14 }}>
                      <div style={{ display:"flex", justifyContent:"space-between", marginBottom:5 }}>
                        <span style={{ fontSize:12, color:"#9CA3AF" }}>
                          {percent < 100
                            ? `${daysDone}/${challenge.days} days done`
                            : "All done! 🎉"}
                        </span>
                        <span style={{ fontSize:12, fontWeight:700, color:s.tag }}>{percent}%</span>
                      </div>
                      <div style={{ background:"#F3F4F6", borderRadius:999, height:5 }}>
                        <div style={{ height:5, borderRadius:999, background:s.grad, width:`${percent}%`, transition:"width 0.6s ease" }} />
                      </div>
                    </div>
                  ) : (
                    <div style={{ display:"flex", gap:8, marginBottom:14 }}>
                      <div style={{ display:"flex", alignItems:"center", gap:5, background:s.light, padding:"4px 10px", borderRadius:8 }}>
                        <Clock size={11} color={s.tag} />
                        <span style={{ fontSize:11, fontWeight:600, color:s.tag }}>{challenge.days} days</span>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:5, background:s.light, padding:"4px 10px", borderRadius:8 }}>
                        <BarChart2 size={11} color={s.tag} />
                        <span style={{ fontSize:11, fontWeight:600, color:s.tag }}>{challenge.level}</span>
                      </div>
                    </div>
                  )}

                  {/* CTA row */}
                  <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", background:s.light, borderRadius:12, padding:"11px 14px", marginTop:"auto" }}>
                    <span style={{ fontSize:13, fontWeight:700, color:s.tag }}>
                      {!joined ? "Start challenge"
                        : percent === 0 ? "Continue"
                        : percent < 100 ? "Continue challenge"
                        : "View progress"}
                    </span>
                    <div style={{ width:26, height:26, borderRadius:"50%", background:s.grad, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <ArrowRight size={13} color="#fff" />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
```

### `hooks/useProgress.js`
```jsx
"use client";
import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useProgress() {
  const [userId, setUserId] = useState(null);
  const [progress, setProgress] = useState({});
  const [loaded, setLoaded] = useState(false);

  // Get current user
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Load all progress once user is known
  useEffect(() => {
    if (!userId) { setProgress({}); setLoaded(true); return; }
    loadAll();
  }, [userId]);

  const loadAll = async () => {
    const [{ data: lessons }, { data: certs }, { data: chalDays }, { data: chalJoins }] = await Promise.all([
      supabase.from("lesson_progress").select("course_id,lesson_id").eq("user_id", userId),
      supabase.from("certificates").select("course_id").eq("user_id", userId),
      supabase.from("challenge_progress").select("challenge_id,day_number").eq("user_id", userId),
      supabase.from("challenge_joins").select("challenge_id").eq("user_id", userId),
    ]);

    const p = {};

    // Build course progress
    (lessons || []).forEach(({ course_id, lesson_id }) => {
      if (!p[course_id]) p[course_id] = { completedLessons: [], certificateEarned: false };
      p[course_id].completedLessons.push(lesson_id);
    });
    (certs || []).forEach(({ course_id }) => {
      if (!p[course_id]) p[course_id] = { completedLessons: [], certificateEarned: false };
      p[course_id].certificateEarned = true;
    });

    // Build challenge progress
    (chalJoins || []).forEach(({ challenge_id }) => {
      const key = `challenge_${challenge_id}`;
      if (!p[key]) p[key] = { completedDays: [], joined: false };
      p[key].joined = true;
    });
    (chalDays || []).forEach(({ challenge_id, day_number }) => {
      const key = `challenge_${challenge_id}`;
      if (!p[key]) p[key] = { completedDays: [], joined: true };
      if (!p[key].completedDays.includes(day_number)) p[key].completedDays.push(day_number);
    });

    setProgress(p);
    setLoaded(true);
  };

  /* ── Course ── */
  const markLessonComplete = useCallback(async (courseId, lessonId) => {
    if (!userId) return;
    await supabase.from("lesson_progress").upsert({ user_id: userId, course_id: courseId, lesson_id: lessonId }, { onConflict: "user_id,course_id,lesson_id" });
    setProgress(prev => {
      const course = prev[courseId] || { completedLessons: [], certificateEarned: false };
      if (course.completedLessons.includes(lessonId)) return prev;
      return { ...prev, [courseId]: { ...course, completedLessons: [...course.completedLessons, lessonId] } };
    });
  }, [userId]);

  const markCertificateEarned = useCallback(async (courseId) => {
    if (!userId) return;
    await supabase.from("certificates").upsert({ user_id: userId, course_id: courseId }, { onConflict: "user_id,course_id" });
    setProgress(prev => ({ ...prev, [courseId]: { ...prev[courseId], certificateEarned: true, earnedAt: new Date().toISOString() } }));
  }, [userId]);

  const getCompletedLessons = useCallback((courseId) => progress[courseId]?.completedLessons || [], [progress]);
  const getCoursePercent = useCallback((courseId, total) => {
    if (!total) return 0;
    return Math.round(((progress[courseId]?.completedLessons?.length || 0) / total) * 100);
  }, [progress]);
  const isCourseComplete = useCallback((courseId, total) => (progress[courseId]?.completedLessons?.length || 0) >= total, [progress]);
  const hasCertificate = useCallback((courseId) => progress[courseId]?.certificateEarned || false, [progress]);

  const resetCourse = useCallback(async (courseId) => {
    if (!userId) return;
    await Promise.all([
      supabase.from("lesson_progress").delete().eq("user_id", userId).eq("course_id", courseId),
      supabase.from("certificates").delete().eq("user_id", userId).eq("course_id", courseId),
    ]);
    setProgress(prev => ({ ...prev, [courseId]: { completedLessons: [], certificateEarned: false } }));
  }, [userId]);

  /* ── Challenges ── */
  const joinChallenge = useCallback(async (challengeId) => {
    if (!userId) return;
    await supabase.from("challenge_joins").upsert({ user_id: userId, challenge_id: challengeId }, { onConflict: "user_id,challenge_id" });
    const key = `challenge_${challengeId}`;
    setProgress(prev => ({ ...prev, [key]: { ...(prev[key] || { completedDays: [] }), joined: true } }));
  }, [userId]);

  const markChallengeDay = useCallback(async (challengeId, day) => {
    if (!userId) return;
    await supabase.from("challenge_progress").upsert({ user_id: userId, challenge_id: challengeId, day_number: day }, { onConflict: "user_id,challenge_id,day_number" });
    await updateStreak();
    const key = `challenge_${challengeId}`;
    setProgress(prev => {
      const existing = prev[key] || { completedDays: [], joined: true };
      if (existing.completedDays.includes(day)) return prev;
      return { ...prev, [key]: { ...existing, completedDays: [...existing.completedDays, day] } };
    });
  }, [userId]);

  const hasJoinedChallenge = useCallback((challengeId) => progress[`challenge_${challengeId}`]?.joined || false, [progress]);
  const getChallengeCompletedDays = useCallback((challengeId) => progress[`challenge_${challengeId}`]?.completedDays || [], [progress]);
  const getChallengeDayPercent = useCallback((challengeId, totalDays) => {
    if (!totalDays) return 0;
    return Math.round(((progress[`challenge_${challengeId}`]?.completedDays?.length || 0) / totalDays) * 100);
  }, [progress]);

  const resetChallenge = useCallback(async (challengeId) => {
    if (!userId) return;
    await supabase.from("challenge_progress").delete().eq("user_id", userId).eq("challenge_id", challengeId);
    const key = `challenge_${challengeId}`;
    setProgress(prev => ({ ...prev, [key]: { completedDays: [], joined: true } }));
  }, [userId]);

  return {
    loaded, userId,
    markLessonComplete, markCertificateEarned, getCompletedLessons,
    getCoursePercent, isCourseComplete, hasCertificate, resetCourse,
    joinChallenge, markChallengeDay, hasJoinedChallenge,
    getChallengeCompletedDays, getChallengeDayPercent, resetChallenge,
  };
}
```

### `hooks/useStreak.js`
```jsx
"use client";

import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/lib/supabase";

export function useStreak() {
  const [userId, setUserId] = useState(null);
  const [streak, setStreak] = useState(0);
  const [longestStreak, setLongestStreak] = useState(0);
  const [weeklyActivity, setWeeklyActivity] = useState([false,false,false,false,false,false,false]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUserId(session?.user?.id ?? null);
    });
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setUserId(session?.user?.id ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!userId) { setLoaded(true); return; }
    loadStreak(userId);
  }, [userId]);

  const loadStreak = async (uid) => {
    try {
      // Use maybeSingle() instead of single() — returns null if no row exists
      const { data, error } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", uid)
        .maybeSingle();

      if (error) {
        console.error("Streak load error:", error);
        setLoaded(true);
        return;
      }

      if (!data) {
        // No streak record yet — first time user
        setStreak(0);
        setLongestStreak(0);
        setWeeklyActivity([false,false,false,false,false,false,false]);
        setLoaded(true);
        return;
      }

      // Check if streak should reset
      const today = new Date().toISOString().split("T")[0];
      const lastActivity = data.last_activity_date;

      if (lastActivity) {
        const last = new Date(lastActivity);
        const now = new Date(today);
        const diffDays = Math.floor((now - last) / (1000 * 60 * 60 * 24));

        if (diffDays > 1) {
          // Missed a day — reset streak
          await supabase
            .from("user_streaks")
            .update({ current_streak: 0 })
            .eq("user_id", uid);
          setStreak(0);
        } else {
          setStreak(data.current_streak || 0);
        }
      } else {
        setStreak(data.current_streak || 0);
      }

      setLongestStreak(data.longest_streak || 0);
      const activity = Array.isArray(data.weekly_activity) ? data.weekly_activity : [];
      setWeeklyActivity(buildWeeklyActivity(activity));

    } catch (e) {
      console.error("Streak error:", e);
    } finally {
      setLoaded(true);
    }
  };

  const updateStreak = useCallback(async () => {
    if (!userId) return;

    const today = new Date().toISOString().split("T")[0];

    try {
      const { data: existing } = await supabase
        .from("user_streaks")
        .select("*")
        .eq("user_id", userId)
        .maybeSingle();

      let newStreak = 1;
      let longest = 1;
      let activity = [];

      if (existing) {
        const lastDate = existing.last_activity_date;
        longest = existing.longest_streak || 0;
        activity = Array.isArray(existing.weekly_activity) ? existing.weekly_activity : [];

        // Already active today
        if (lastDate === today) return;

        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split("T")[0];

        if (lastDate === yesterdayStr) {
          newStreak = (existing.current_streak || 0) + 1;
        } else {
          newStreak = 1;
        }
      }

      // Add today to activity
      if (!activity.includes(today)) activity.push(today);
      activity = activity.slice(-7);
      longest = Math.max(longest, newStreak);

      await supabase.from("user_streaks").upsert({
        user_id: userId,
        current_streak: newStreak,
        longest_streak: longest,
        last_activity_date: today,
        weekly_activity: activity,
        updated_at: new Date().toISOString(),
      }, { onConflict: "user_id" });

      setStreak(newStreak);
      setLongestStreak(longest);
      setWeeklyActivity(buildWeeklyActivity(activity));

    } catch (e) {
      console.error("updateStreak error:", e);
    }
  }, [userId]);

  return { streak, longestStreak, weeklyActivity, loaded, updateStreak };
}

function buildWeeklyActivity(dates) {
  // Map to Mon(0)...Sun(6) of the CURRENT week
  const days = [false, false, false, false, false, false, false];
  if (!Array.isArray(dates)) return days;

  const today = new Date();
  const dow = today.getDay(); // 0=Sun, 1=Mon ... 6=Sat
  // How many days back to get to Monday
  const toMonday = dow === 0 ? -6 : 1 - dow;

  for (let i = 0; i < 7; i++) {
    const d = new Date(today);
    d.setDate(today.getDate() + toMonday + i);
    const str = d.toISOString().split("T")[0];
    days[i] = dates.includes(str);
  }
  return days;
}
```

### `app/(main)/page.jsx`
```jsx
import CertificateBanner from "@/components/home/CertificateBanner";
import CurrentCourseWidget from "@/components/home/CurrentCourseWidget";
import WeeklyStreaks from "@/components/home/WeeklyStreaks";
import ChallengesSection from "@/components/home/ChallengesSection";
import BrowseCourses from "@/components/home/BrowseCourses";
import { getAllCourses, getAllChallenges } from "@/lib/db";

export const revalidate = 60;

export default async function HomePage() {
  const [courses, challenges] = await Promise.all([
    getAllCourses(),
    getAllChallenges(),
  ]);

  return (
    <>
      <style>{`
        .home-grid {
          display: grid;
          grid-template-columns: 1fr 300px;
          gap: 20px;
        }
        .home-stack {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }
        @media (max-width: 768px) {
          .home-grid {
            grid-template-columns: 1fr;
            gap: 16px;
          }
          .home-stack {
            gap: 16px;
          }
        }
      `}</style>

      <div className="home-stack">
        <CertificateBanner courses={courses} />
        <div className="home-grid">
          <CurrentCourseWidget courses={courses} />
          <WeeklyStreaks />
        </div>
                        <BrowseCourses courses={courses} />
        <ChallengesSection challenges={challenges} />
      </div>
    </>
  );
}
```

### `app/(course)/courses/[courseId]/lessons/[lessonId]/page.jsx`
```jsx
import LessonPage from "@/components/courses/LessonPage";
import { getCourseById } from "@/lib/db";
import { getLessonContent } from "@/data/lessonContent";
import { getLessonContentFromDB } from "@/lib/getlessonContent";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function LessonDetailPage({ params, searchParams }) {
  const { courseId, lessonId } = await params;
  const sp = await searchParams;

  const course = await getCourseById(courseId);
  if (!course) return notFound();

  const allLessons = course.units.flatMap(u => u.lessons);
  const lesson = allLessons.find(l => l.id === lessonId)
    || allLessons.find(l => l.id.endsWith(`_${lessonId}`));

  if (!lesson) return notFound();

  // Use DB content only - no static fallback
  const dbContent = await getLessonContentFromDB(lesson.id);
  const content = dbContent || [];

  return (
    <LessonPage
      course={course}
      lesson={lesson}
      content={content}
      mode={sp?.mode || "read"}
      challengeId={sp?.challengeId || null}
      challengeDay={sp?.day ? parseInt(sp.day) : null}
      firstJoin={sp?.firstJoin === "true"}
    />
  );
}
```

### `app/(course)/challenges/[challengeId]/page.jsx`
```jsx
import { getChallengeById } from "@/lib/db";
import ChallengePage from "@/components/challenges/ChallengePage";
import { notFound } from "next/navigation";

export const revalidate = 60;

export default async function ChallengeDetailPage({ params }) {
  const { challengeId } = await params;
  const challenge = await getChallengeById(challengeId);
  if (!challenge) return notFound();
  return <ChallengePage challenge={challenge} />;
}
```

### `app/(course)/challenges/[challengeId]/day/[day]/page.jsx`
```jsx
import LessonPage from "@/components/courses/LessonPage";
import ChallengeReviews from "@/components/challenges/ChallengeReviews";
import { getChallengeById } from "@/lib/db";
import { getLessonContentFromDB } from "@/lib/getlessonContent";
import { notFound } from "next/navigation";

export const revalidate = 0;

export default async function ChallengeDayPage({ params, searchParams }) {
  const { challengeId, day } = await params;
  const sp = await searchParams;

  const challenge = await getChallengeById(challengeId);
  if (!challenge) return notFound();

  const dayNum = parseInt(day);
  const challengeDay = challenge.challengeDays?.find(d => d.day === dayNum);
  if (!challengeDay) return notFound();

  const contentId = `challenge_${challengeId}_day_${dayNum}`;
  const content = await getLessonContentFromDB(contentId) || [];

  const lesson = {
    id: contentId,
    title: challengeDay.topic || `Day ${dayNum}`,
    type: "read",
    duration: 10,
  };

  const course = {
    id: challengeId,
    title: challenge.title,
    emoji: challenge.emoji,
    gradientFrom: "#667eea",
    gradientTo: "#764ba2",
    hours: 1,
    level: challenge.level,
    units: [{
      id: "days",
      title: "Challenge Days",
      lessons: (challenge.challengeDays || []).map(d => ({
        id: `challenge_${challengeId}_day_${d.day}`,
        title: d.topic || `Day ${d.day}`,
        type: "read",
        duration: 10,
      }))
    }]
  };

  return (
    <div>
      <LessonPage
        course={course}
        lesson={lesson}
        content={content}
        mode={sp?.mode || "read"}
        challengeId={challengeId}
        challengeDay={dayNum}
      />
      <div style={{ maxWidth:680, margin:"0 auto", padding:"40px 20px 80px" }}>
        <h2 style={{ fontSize:20, fontWeight:900, color:"#0f172a", margin:"0 0 20px" }}>
          Rate this Challenge
        </h2>
        <ChallengeReviews
          challengeId={challengeId}
          challengeName={challenge.title}
          topOnly={false}
        />
      </div>
    </div>
  );
}
```

### `app/(admin)/admin/builder/[lessonId]/page.jsx`
```jsx
import LessonBuilder from "@/components/admin/builder/LessonBuilder";

export const metadata = { title: "Lesson Builder - Coursiv" };

export default async function BuilderPage({ params, searchParams }) {
  const { lessonId } = await params;
  const sp = await searchParams;
  return (
    <LessonBuilder
      lessonId={lessonId}
      lessonTitle={sp?.title || "Lesson"}
      backTo={sp?.backTo || "/admin/courses"}
    />
  );
}
```

### `app/api/admin/reviews/route.js`
```jsx
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY
);

export async function GET() {
  const [{ data: courseReviews }, { data: challengeReviews }] = await Promise.all([
    supabaseAdmin.from("course_reviews").select("id, course_id, user_id, rating, review, approved, created_at").order("created_at", { ascending: false }),
    supabaseAdmin.from("challenge_user_reviews").select("id, challenge_id, user_id, rating, review, approved, created_at").order("created_at", { ascending: false }),
  ]);

  const all = [
    ...(courseReviews||[]).map(r => ({ ...r, reviewType:"course", entityId:r.course_id })),
    ...(challengeReviews||[]).map(r => ({ ...r, reviewType:"challenge", entityId:r.challenge_id })),
  ].sort((a,b) => new Date(b.created_at) - new Date(a.created_at));

  // Fetch profiles
  const userIds = [...new Set(all.map(r => r.user_id))];
  const courseIds = [...new Set(all.filter(r=>r.reviewType==="course").map(r=>r.entityId).filter(Boolean))];
  const challengeIds = [...new Set(all.filter(r=>r.reviewType==="challenge").map(r=>r.entityId).filter(Boolean))];

  const [{ data: profiles }, { data: courses }, { data: challenges }] = await Promise.all([
    userIds.length > 0 ? supabaseAdmin.from("profiles").select("id, full_name, email, avatar_url").in("id", userIds) : { data: [] },
    courseIds.length > 0 ? supabaseAdmin.from("courses").select("id, title, emoji").in("id", courseIds) : { data: [] },
    challengeIds.length > 0 ? supabaseAdmin.from("challenges").select("id, title, emoji").in("id", challengeIds) : { data: [] },
  ]);

  const profileMap = {};
  (profiles||[]).forEach(p => profileMap[p.id] = p);
  const courseMap = {};
  (courses||[]).forEach(c => courseMap[c.id] = c);
  const challengeMap = {};
  (challenges||[]).forEach(c => challengeMap[c.id] = c);

  return NextResponse.json(all.map(r => ({
    ...r,
    profile: profileMap[r.user_id] || null,
    entity: r.reviewType==="challenge" ? (challengeMap[r.entityId]||null) : (courseMap[r.entityId]||null),
  })));
}

export async function PATCH(req) {
  const { id, approved, reviewType } = await req.json();
  const table = reviewType === "challenge" ? "challenge_user_reviews" : "course_reviews";
  const { error } = await supabaseAdmin.from(table).update({ approved }).eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

export async function DELETE(req) {
  const { id, reviewType } = await req.json();
  const table = reviewType === "challenge" ? "challenge_user_reviews" : "course_reviews";
  const { error } = await supabaseAdmin.from(table).delete().eq("id", id);
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
```

## ENV VAR NAMES (no values)
```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET
SUPABASE_SERVICE_ROLE_KEY
```

## PACKAGE.JSON
```json
{
  "name": "coursiv",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint"
  },
  "dependencies": {
    "@dnd-kit/core": "^6.3.1",
    "@dnd-kit/sortable": "^10.0.0",
    "@dnd-kit/utilities": "^3.2.2",
    "@supabase/auth-helpers-nextjs": "^0.15.0",
    "@supabase/auth-helpers-react": "^0.15.0",
    "@supabase/ssr": "^0.12.0",
    "@supabase/supabase-js": "^2.108.0",
    "clsx": "^2.1.1",
    "html2canvas": "^1.4.1",
    "jspdf": "^4.2.1",
    "lucide-react": "^1.17.0",
    "next": "16.2.7",
    "react": "19.2.4",
    "react-dom": "19.2.4",
    "tailwind-merge": "^3.6.0"
  },
  "devDependencies": {
    "@tailwindcss/postcss": "^4",
    "autoprefixer": "^10.5.0",
    "eslint": "^9",
    "eslint-config-next": "16.2.7",
    "tailwindcss": "^4"
  }
}
```
