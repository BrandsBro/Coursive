const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  "https://xisywmtqebmjrmgiedvi.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhpc3l3bXRxZWJtanJtZ2llZHZpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODA5MDQ4NjUsImV4cCI6MjA5NjQ4MDg2NX0.zB5O6ya71CX3pcuvT3S4AqAkOz3ZDFSrN8zdecYAe2Q"
);

// ── COURSES DATA ──
const coursesData = [
  {
    id: "canva-ai",
    title: "Canva AI",
    description: "Master AI-powered design with Canva",
    emoji: "🎨",
    gradient_from: "#ec4899",
    gradient_to: "#8b5cf6",
    hours: 3,
    level: "Beginner",
    category: "Design",
    order_index: 1,
    units: [
      {
        id: "canva-ai-unit-1",
        title: "Introduction to Canva AI",
        order_index: 1,
        lessons: [
          { id: "l1", title: "Canva AI Essentials",           type: "read", duration: 10, order_index: 1 },
          { id: "l2", title: "The Design Feature",            type: "read", duration: 15, order_index: 2 },
          { id: "l3", title: "Video and Motion Generation",   type: "read", duration: 20, order_index: 3 },
          { id: "l4", title: "Writing Tool",                  type: "read", duration: 10, order_index: 4 },
          { id: "l5", title: "The Code Feature",              type: "quiz", duration: 15, order_index: 5 },
        ],
      },
      {
        id: "canva-ai-unit-2",
        title: "Canva AI in Professional Practice",
        order_index: 2,
        lessons: [
          { id: "l6", title: "Canva AI for Design",    type: "read", duration: 20, order_index: 1 },
          { id: "l7", title: "Canva AI for Marketing", type: "read", duration: 20, order_index: 2 },
          { id: "l8", title: "Canva AI for Sales",     type: "quiz", duration: 15, order_index: 3 },
        ],
      },
    ],
  },
  {
    id: "midjourney",
    title: "Midjourney",
    description: "Create stunning AI art with Midjourney",
    emoji: "🖼️",
    gradient_from: "#6366f1",
    gradient_to: "#0ea5e9",
    hours: 6,
    level: "Beginner",
    category: "Design",
    order_index: 2,
    units: [
      {
        id: "midjourney-unit-1",
        title: "Getting Started with Midjourney",
        order_index: 1,
        lessons: [
          { id: "l1", title: "What is Midjourney?",    type: "read", duration: 10, order_index: 1 },
          { id: "l2", title: "Setting Up Your Account",type: "read", duration: 10, order_index: 2 },
          { id: "l3", title: "Your First Image",       type: "read", duration: 15, order_index: 3 },
          { id: "l4", title: "Basic Prompting",        type: "read", duration: 20, order_index: 4 },
          { id: "l5", title: "Prompt Quiz",            type: "quiz", duration: 10, order_index: 5 },
        ],
      },
      {
        id: "midjourney-unit-2",
        title: "Advanced Midjourney",
        order_index: 2,
        lessons: [
          { id: "l6",  title: "Style Parameters", type: "read", duration: 20, order_index: 1 },
          { id: "l7",  title: "Aspect Ratios",    type: "read", duration: 15, order_index: 2 },
          { id: "l8",  title: "Remix Mode",       type: "read", duration: 20, order_index: 3 },
          { id: "l9",  title: "Inpainting",       type: "read", duration: 20, order_index: 4 },
          { id: "l10", title: "Advanced Quiz",    type: "quiz", duration: 10, order_index: 5 },
        ],
      },
      {
        id: "midjourney-unit-3",
        title: "Midjourney for Business",
        order_index: 3,
        lessons: [
          { id: "l11", title: "Brand Assets",   type: "read", duration: 20, order_index: 1 },
          { id: "l12", title: "Final Project",  type: "quiz", duration: 15, order_index: 2 },
        ],
      },
    ],
  },
  {
    id: "communicating-with-ai",
    title: "Communicating With AI",
    description: "Turn AI into a useful thinking partner",
    emoji: "💬",
    gradient_from: "#f97316",
    gradient_to: "#fbbf24",
    hours: 2,
    level: "Beginner",
    category: "Productivity",
    order_index: 3,
    units: [
      {
        id: "comm-ai-unit-1",
        title: "AI Communication Basics",
        order_index: 1,
        lessons: [
          { id: "l1", title: "How AI Thinks",         type: "read", duration: 15, order_index: 1 },
          { id: "l2", title: "Writing Better Prompts", type: "read", duration: 20, order_index: 2 },
          { id: "l3", title: "Context and Memory",     type: "read", duration: 15, order_index: 3 },
          { id: "l4", title: "AI as a Partner",        type: "read", duration: 20, order_index: 4 },
          { id: "l5", title: "Final Quiz",             type: "quiz", duration: 10, order_index: 5 },
        ],
      },
    ],
  },
  {
    id: "kling",
    title: "Kling",
    description: "AI video generation mastery",
    emoji: "🎬",
    gradient_from: "#ec4899",
    gradient_to: "#f43f5e",
    hours: 3,
    level: "Beginner",
    category: "Video",
    order_index: 4,
    units: [
      {
        id: "kling-unit-1",
        title: "Kling Fundamentals",
        order_index: 1,
        lessons: [
          { id: "l1", title: "Introduction to Kling", type: "read", duration: 10, order_index: 1 },
          { id: "l2", title: "Text to Video",         type: "read", duration: 20, order_index: 2 },
          { id: "l3", title: "Image to Video",        type: "read", duration: 20, order_index: 3 },
          { id: "l4", title: "Motion Controls",       type: "read", duration: 15, order_index: 4 },
          { id: "l5", title: "Quiz",                  type: "quiz", duration: 10, order_index: 5 },
        ],
      },
      {
        id: "kling-unit-2",
        title: "Kling for Content Creators",
        order_index: 2,
        lessons: [
          { id: "l6", title: "Social Media Videos", type: "read", duration: 20, order_index: 1 },
          { id: "l7", title: "Marketing Content",   type: "read", duration: 20, order_index: 2 },
          { id: "l8", title: "Final Project",       type: "quiz", duration: 15, order_index: 3 },
        ],
      },
    ],
  },
  {
    id: "lovable",
    title: "Lovable",
    description: "Build apps with AI, no code needed",
    emoji: "💻",
    gradient_from: "#10b981",
    gradient_to: "#06b6d4",
    hours: 4,
    level: "Beginner",
    category: "No Code",
    order_index: 5,
    units: [
      {
        id: "lovable-unit-1",
        title: "Getting Started with Lovable",
        order_index: 1,
        lessons: [
          { id: "l1", title: "What is Lovable?", type: "read", duration: 10, order_index: 1 },
          { id: "l2", title: "Your First App",   type: "read", duration: 20, order_index: 2 },
          { id: "l3", title: "UI Components",    type: "read", duration: 20, order_index: 3 },
          { id: "l4", title: "Adding Logic",     type: "read", duration: 20, order_index: 4 },
          { id: "l5", title: "Quiz",             type: "quiz", duration: 10, order_index: 5 },
        ],
      },
      {
        id: "lovable-unit-2",
        title: "Building Real Apps",
        order_index: 2,
        lessons: [
          { id: "l6", title: "Database Integration", type: "read", duration: 25, order_index: 1 },
          { id: "l7", title: "Authentication",       type: "read", duration: 20, order_index: 2 },
          { id: "l8", title: "Deploy Your App",      type: "quiz", duration: 15, order_index: 3 },
        ],
      },
    ],
  },
  {
    id: "chatgpt",
    title: "ChatGPT",
    description: "Master ChatGPT for work and life",
    emoji: "🤖",
    gradient_from: "#10a37f",
    gradient_to: "#0ea5e9",
    hours: 4,
    level: "Beginner",
    category: "Productivity",
    order_index: 6,
    units: [
      {
        id: "chatgpt-unit-1",
        title: "ChatGPT Basics",
        order_index: 1,
        lessons: [
          { id: "l1", title: "Introduction to ChatGPT", type: "read", duration: 10, order_index: 1 },
          { id: "l2", title: "Prompt Engineering",      type: "read", duration: 20, order_index: 2 },
          { id: "l3", title: "Custom Instructions",     type: "read", duration: 15, order_index: 3 },
          { id: "l4", title: "GPT-4 Features",          type: "read", duration: 20, order_index: 4 },
          { id: "l5", title: "Quiz",                    type: "quiz", duration: 10, order_index: 5 },
        ],
      },
      {
        id: "chatgpt-unit-2",
        title: "ChatGPT for Work",
        order_index: 2,
        lessons: [
          { id: "l6",  title: "Writing & Editing",      type: "read", duration: 20, order_index: 1 },
          { id: "l7",  title: "Research & Analysis",    type: "read", duration: 20, order_index: 2 },
          { id: "l8",  title: "Coding with ChatGPT",    type: "read", duration: 25, order_index: 3 },
          { id: "l9",  title: "Automations",            type: "read", duration: 20, order_index: 4 },
          { id: "l10", title: "Final Quiz",             type: "quiz", duration: 10, order_index: 5 },
        ],
      },
    ],
  },
  {
    id: "notion-ai",
    title: "Notion AI",
    description: "Supercharge your productivity with Notion AI",
    emoji: "📓",
    gradient_from: "#6b7280",
    gradient_to: "#374151",
    hours: 3,
    level: "Beginner",
    category: "Productivity",
    order_index: 7,
    units: [
      {
        id: "notion-unit-1",
        title: "Notion AI Essentials",
        order_index: 1,
        lessons: [
          { id: "l1", title: "Getting Started",       type: "read", duration: 10, order_index: 1 },
          { id: "l2", title: "AI Writing Assistant",  type: "read", duration: 20, order_index: 2 },
          { id: "l3", title: "Summarization",         type: "read", duration: 15, order_index: 3 },
          { id: "l4", title: "Database AI",           type: "read", duration: 20, order_index: 4 },
          { id: "l5", title: "Quiz",                  type: "quiz", duration: 10, order_index: 5 },
        ],
      },
      {
        id: "notion-unit-2",
        title: "Notion AI for Teams",
        order_index: 2,
        lessons: [
          { id: "l6", title: "Team Workflows", type: "read", duration: 20, order_index: 1 },
          { id: "l7", title: "Final Project",  type: "quiz", duration: 15, order_index: 2 },
        ],
      },
    ],
  },
];

// ── CHALLENGES DATA ──
const challengesData = [
  {
    id: "28-day-ai-2026",
    title: "2026 28-Day AI Challenge",
    subtitle: "Master the most powerful AI tools in just 28 days",
    description: "Every day for 28 days, you'll learn one AI tool or concept — from writing assistants to image generators to automation tools.",
    emoji: "🚀",
    gradient_bg: "linear-gradient(135deg, #60a5fa, #06b6d4)",
    days: 28,
    level: "Beginner",
    order_index: 1,
    reviews: [
      { reviewer_name: "Sarah M.", review_text: "This challenge completely changed how I work. I now save 2+ hours every day.", stars: 5, order_index: 1 },
      { reviewer_name: "James K.", review_text: "The structure is perfect. One tool per day feels manageable.", stars: 5, order_index: 2 },
      { reviewer_name: "Priya L.", review_text: "I was skeptical at first but the daily format kept me accountable.", stars: 5, order_index: 3 },
    ],
  },
  {
    id: "junior-ai",
    title: "Junior AI Challenge",
    subtitle: "Unlock your child's AI superpowers in 28 days",
    description: "What if your child's screen time helped them become future-ready? Each day, let your child explore a new AI topic.",
    emoji: "⭐",
    gradient_bg: "linear-gradient(135deg, #f472b6, #f43f5e)",
    days: 28,
    level: "Beginner",
    order_index: 2,
    reviews: [
      { reviewer_name: "David", review_text: "After the challenge, my son even explained to his grandparents how ChatGPT works!", stars: 5, order_index: 1 },
      { reviewer_name: "Carlos", review_text: "The ethical focus was a big plus for us.", stars: 5, order_index: 2 },
      { reviewer_name: "Maria T.", review_text: "My 10-year-old loved every single day.", stars: 5, order_index: 3 },
    ],
  },
  {
    id: "ai-side-gigs",
    title: "14-Day AI Side Gigs Challenge",
    subtitle: "Turn AI skills into real income in just 2 weeks",
    description: "Learn exactly how to use AI tools to start or grow a side income. Each day covers a different monetizable skill.",
    emoji: "💼",
    gradient_bg: "linear-gradient(135deg, #fbbf24, #f97316)",
    days: 14,
    level: "Beginner",
    order_index: 3,
    reviews: [
      { reviewer_name: "Alex R.", review_text: "I landed my first freelance client on day 10 of this challenge.", stars: 5, order_index: 1 },
      { reviewer_name: "Nina S.", review_text: "Finally a course that teaches AI in a way that actually makes you money.", stars: 5, order_index: 2 },
      { reviewer_name: "Tom B.", review_text: "Made back 10x the cost of this challenge in my first month.", stars: 5, order_index: 3 },
    ],
  },
  {
    id: "no-code",
    title: "No Code Challenge",
    subtitle: "Build real apps with AI — zero coding required",
    description: "You don't need to know how to code to build powerful apps anymore. Over 14 days, you'll learn to use the best no-code AI tools.",
    emoji: "🛠️",
    gradient_bg: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
    days: 14,
    level: "Beginner",
    order_index: 4,
    reviews: [
      { reviewer_name: "Rachel W.", review_text: "Built and launched a fully functional app in 2 weeks with zero coding background.", stars: 5, order_index: 1 },
      { reviewer_name: "Daniel F.", review_text: "The tools taught here are exactly what businesses are paying for right now.", stars: 5, order_index: 2 },
      { reviewer_name: "Sophie C.", review_text: "I've tried other no-code courses but this one actually shows you how AI makes it 10x faster.", stars: 5, order_index: 3 },
    ],
  },
];

// ── COURSE LESSON POOL for challenge days ──
const courseIds = ["canva-ai", "chatgpt", "midjourney", "lovable", "kling", "notion-ai", "communicating-with-ai"];
const lessonIds = ["l1", "l2", "l3", "l4", "l5"];
function mapDay(i) {
  return {
    course_id: courseIds[i % courseIds.length],
    lesson_id: lessonIds[Math.floor(i / courseIds.length) % lessonIds.length],
  };
}

async function seed() {
  console.log("🌱 Starting seed...\n");

  // ── 1. Insert courses ──
  console.log("📚 Inserting courses...");
  for (const course of coursesData) {
    const { units, ...courseRow } = course;

    const { error: courseErr } = await supabase
      .from("courses")
      .upsert(courseRow, { onConflict: "id" });

    if (courseErr) {
      console.error(`  ❌ Course ${course.id}:`, courseErr.message);
      continue;
    }
    console.log(`  ✅ Course: ${course.title}`);

    // ── 2. Insert units ──
    for (const unit of units) {
      const { lessons, ...unitRow } = unit;
      const { error: unitErr } = await supabase
        .from("course_units")
        .upsert({ ...unitRow, course_id: course.id }, { onConflict: "id" });

      if (unitErr) {
        console.error(`    ❌ Unit ${unit.id}:`, unitErr.message);
        continue;
      }
      console.log(`    ✅ Unit: ${unit.title}`);

      // ── 3. Insert lessons ──
      for (const lesson of lessons) {
        const lessonId = `${course.id}_${unit.id}_${lesson.id}`;
        const { error: lessonErr } = await supabase
          .from("lessons")
          .upsert({
            ...lesson,
            id: lessonId,
            unit_id: unit.id,
            course_id: course.id,
          }, { onConflict: "id" });

        if (lessonErr) {
          console.error(`      ❌ Lesson ${lesson.title}:`, lessonErr.message);
        } else {
          console.log(`      ✅ Lesson: ${lesson.title}`);
        }
      }
    }
  }

  // ── 4. Insert challenges ──
  console.log("\n🔥 Inserting challenges...");
  for (const challenge of challengesData) {
    const { reviews, ...challengeRow } = challenge;

    const { error: chalErr } = await supabase
      .from("challenges")
      .upsert(challengeRow, { onConflict: "id" });

    if (chalErr) {
      console.error(`  ❌ Challenge ${challenge.id}:`, chalErr.message);
      continue;
    }
    console.log(`  ✅ Challenge: ${challenge.title}`);

    // ── 5. Insert reviews ──
    for (const review of reviews) {
      const { error: revErr } = await supabase
        .from("challenge_reviews")
        .insert({ ...review, challenge_id: challenge.id });
      if (!revErr) console.log(`    ✅ Review: ${review.reviewer_name}`);
    }

    // ── 6. Insert challenge days ──
    const dayTopics = {
      "28-day-ai-2026": ["Introduction to AI","ChatGPT Basics","Writing with AI","AI Image Generation","AI for Research","Automating Tasks","AI Video Tools","Prompting Like a Pro","AI for Email","Midjourney Deep Dive","AI Coding Basics","No-Code with AI","AI for Marketing","Data Analysis with AI","AI Presentations","AI Audio Tools","Building AI Workflows","AI for Social Media","AI Customer Support","AI SEO","Stable Diffusion","AI Project Planning","AI for Design","AI Business Ideas","Monetising AI Skills","AI Ethics","AI Future Trends","Your AI Action Plan"],
      "junior-ai": ["What is AI?","How AI Learns","AI in Daily Life","Talking to AI","AI Art Creator","AI Story Writer","AI Music Maker","Smart Assistants","AI & Games","AI Safety Basics","AI & Animals","AI in Space","Building with AI","AI Language Skills","AI Math Helper","AI Science Lab","Ethical AI Choices","AI & Creativity","AI Friends & Robots","AI in Medicine","Future Jobs & AI","AI Environment","AI & Sports","AI News Detector","AI Business Ideas","AI Reading Buddy","AI Movie Maker","AI Showcase Day"],
      "ai-side-gigs": ["How to Start Side Hustling","Text Typer","Freelance Writer","Product Reviewer","Virtual Assistant","Content Moderator","Online Tutor","Social Media Manager","E-commerce Reseller","Customer Service Manager","Online Bookkeeper","Illustrator","SEO Specialist","Where to Find Sidegigs"],
      "no-code": ["Intro to No-Code","Your First App","UI Design Basics","Adding Logic","Database Setup","User Auth","API Connections","Automations","Deploy Your App","E-commerce Build","Landing Pages","Workflow Bots","Analytics Dashboard","Launch Day"],
    };

    const dayEmojis = ["🚀","⭐","💼","🛠️","🤖","💬","🎨","🔍","⚡","🎬","💻","📊","📱","🌟","🔄","🎯","📚","💡","🔥","🏆","🌍","🎵","🔗","📋","💰","⚖️","🌱","🎪"];

    const topics = dayTopics[challenge.id] || [];
    for (let i = 0; i < topics.length; i++) {
      const mapped = mapDay(i);
      const { error: dayErr } = await supabase
        .from("challenge_days")
        .upsert({
          challenge_id: challenge.id,
          day_number: i + 1,
          topic: topics[i],
          emoji: dayEmojis[i % dayEmojis.length],
          course_id: mapped.course_id,
          lesson_id: mapped.lesson_id,
        }, { onConflict: "challenge_id,day_number" });

      if (!dayErr) console.log(`    ✅ Day ${i + 1}: ${topics[i]}`);
      else console.error(`    ❌ Day ${i + 1}:`, dayErr.message);
    }
  }

  console.log("\n🎉 Seed complete!");
}

seed().catch(console.error);
