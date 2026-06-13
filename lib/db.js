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
    gradientBg: ch.gradient_bg,
    days: ch.days,
    level: ch.level,
    challengeDays: days,
    reviews: reviews,
  };
}
