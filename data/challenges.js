const courses = ["canva-ai","chatgpt","midjourney","lovable","kling","notion-ai","communicating-with-ai"];
const lessons = ["l1","l2","l3","l4","l5"];

function mapDay(i) {
  return {
    courseId: courses[i % courses.length],
    lessonId: lessons[Math.floor(i / courses.length) % lessons.length],
  };
}

const aiSideGigsDays = [
  { day:1,  topic:"How to Start Side Hustling", emoji:"🚀" },
  { day:2,  topic:"Text Typer",                 emoji:"⌨️" },
  { day:3,  topic:"Freelance Writer",            emoji:"✍️" },
  { day:4,  topic:"Product Reviewer",            emoji:"📦" },
  { day:5,  topic:"Virtual Assistant",           emoji:"💼" },
  { day:6,  topic:"Content Moderator",           emoji:"🛡️" },
  { day:7,  topic:"Online Tutor",                emoji:"📚" },
  { day:8,  topic:"Social Media Manager",        emoji:"📱" },
  { day:9,  topic:"E-commerce Reseller",         emoji:"🛒" },
  { day:10, topic:"Customer Service Manager",    emoji:"🎧" },
  { day:11, topic:"Online Bookkeeper",           emoji:"📊" },
  { day:12, topic:"Illustrator",                 emoji:"🎨" },
  { day:13, topic:"SEO Specialist",              emoji:"🔍" },
  { day:14, topic:"Where to Find Sidegigs",      emoji:"🗺️" },
].map((d, i) => ({ ...d, ...mapDay(i) }));

const aiChallengeDays = [
  "Introduction to AI","ChatGPT Basics","Writing with AI","AI Image Generation",
  "AI for Research","Automating Tasks","AI Video Tools","Prompting Like a Pro",
  "AI for Email","Midjourney Deep Dive","AI Coding Basics","No-Code with AI",
  "AI for Marketing","Data Analysis with AI","AI Presentations","AI Audio Tools",
  "Building AI Workflows","AI for Social Media","AI Customer Support","AI SEO",
  "Stable Diffusion","AI Project Planning","AI for Design","AI Business Ideas",
  "Monetising AI Skills","AI Ethics","AI Future Trends","Your AI Action Plan",
].map((topic, i) => ({
  day: i + 1, topic,
  emoji: ["🤖","💬","✍️","🎨","🔍","⚡","🎬","🎯","📧","🖼️","💻","🛠️","📣","📊","📽️","🎵","🔄","📱","🎧","🔎","🌟","📋","🖌️","💡","💰","🌐","🚀","🏆"][i],
  ...mapDay(i),
}));

const juniorDays = [
  "What is AI?","How AI Learns","AI in Daily Life","Talking to AI",
  "AI Art Creator","AI Story Writer","AI Music Maker","Smart Assistants",
  "AI & Games","AI Safety Basics","AI & Animals","AI in Space",
  "Building with AI","AI Language Skills","AI Math Helper","AI Science Lab",
  "Ethical AI Choices","AI & Creativity","AI Friends & Robots","AI in Medicine",
  "Future Jobs & AI","AI Environment","AI & Sports","AI News Detector",
  "AI Business Ideas","AI Reading Buddy","AI Movie Maker","AI Showcase Day",
].map((topic, i) => ({
  day: i + 1, topic,
  emoji: ["🤖","🧠","🏠","💬","🎨","📖","🎵","🔊","🎮","🛡️","🐾","🚀","🔨","🌍","➕","🔬","⚖️","🌈","🤝","💊","💼","🌱","⚽","📰","💡","📚","🎬","🏆"][i],
  ...mapDay(i),
}));

const noCodeDays = [
  "Intro to No-Code","Your First App","UI Design Basics","Adding Logic",
  "Database Setup","User Auth","API Connections","Automations",
  "Deploy Your App","E-commerce Build","Landing Pages","Workflow Bots",
  "Analytics Dashboard","Launch Day",
].map((topic, i) => ({
  day: i + 1, topic,
  emoji: ["🛠️","📱","🎨","⚙️","🗄️","🔐","🔗","🤖","🚀","🛒","📄","🤯","📊","🏁"][i],
  ...mapDay(i),
}));

export const challenges = [
  {
    id: "28-day-ai-2026",
    title: "2026 28-Day AI Challenge",
    subtitle: "Master the most powerful AI tools in just 28 days",
    description: "Every day for 28 days, you'll learn one AI tool or concept — from writing assistants to image generators to automation tools. By the end, you'll have a complete AI toolkit and the confidence to use it in your work and life.",
    emoji: "🚀",
    gradient: "from-blue-400 to-cyan-500",
    gradientBg: "linear-gradient(135deg, #60a5fa, #06b6d4)",
    days: 28, level: "Beginner", enrolled: false,
    challengeDays: aiChallengeDays,
    reviews: [
      { name: "Sarah M.", text: "This challenge completely changed how I work. I now save 2+ hours every day using AI tools I learned here.", stars: 5 },
      { name: "James K.", text: "The structure is perfect. One tool per day feels manageable and by day 28 I felt like a completely different person.", stars: 5 },
      { name: "Priya L.", text: "I was skeptical at first but the daily format kept me accountable. Highly recommend to anyone curious about AI.", stars: 5 },
    ],
  },
  {
    id: "junior-ai",
    title: "Junior AI Challenge",
    subtitle: "Unlock your child's AI superpowers in 28 days",
    description: "What if your child's screen time helped them become future-ready? Each day, let your child explore a new AI topic — from how AI understands the world, to making smart, ethical choices, to discovering real tools they can start using creatively and responsibly.",
    emoji: "⭐",
    gradient: "from-pink-400 to-rose-500",
    gradientBg: "linear-gradient(135deg, #f472b6, #f43f5e)",
    days: 28, level: "Beginner", enrolled: false,
    challengeDays: juniorDays,
    reviews: [
      { name: "David", text: "After the challenge, my son even explained to his grandparents how ChatGPT works! Clear, fun, and super relevant.", stars: 5 },
      { name: "Carlos", text: "The ethical focus was a big plus for us. It's not just how AI works, but how to use it with kindness and fairness. Loved that.", stars: 5 },
      { name: "Maria T.", text: "My 10-year-old loved every single day. She's now building her own little AI projects. Worth every minute!", stars: 5 },
    ],
  },
  {
    id: "ai-side-gigs",
    title: "14-Day AI Side Gigs Challenge",
    subtitle: "Turn AI skills into real income in just 2 weeks",
    description: "Learn exactly how to use AI tools to start or grow a side income. Each day covers a different monetizable skill — from AI writing and design to automation and no-code apps. By day 14, you'll have a portfolio and a clear path to your first client.",
    emoji: "💼",
    gradient: "from-amber-400 to-orange-500",
    gradientBg: "linear-gradient(135deg, #fbbf24, #f97316)",
    days: 14, level: "Beginner", enrolled: false,
    challengeDays: aiSideGigsDays,
    reviews: [
      { name: "Alex R.", text: "I landed my first freelance client on day 10 of this challenge. The practical focus is unmatched.", stars: 5 },
      { name: "Nina S.", text: "Finally a course that teaches AI in a way that actually makes you money. No fluff, just results.", stars: 5 },
      { name: "Tom B.", text: "Made back 10x the cost of this challenge in my first month. The AI design lessons alone were worth it.", stars: 5 },
    ],
  },
  {
    id: "no-code",
    title: "No Code Challenge",
    subtitle: "Build real apps with AI — zero coding required",
    description: "You don't need to know how to code to build powerful apps anymore. Over 14 days, you'll learn to use the best no-code AI tools to create websites, automate workflows, build databases, and even launch your own product — all without writing a single line of code.",
    emoji: "🛠️",
    gradient: "from-violet-400 to-purple-500",
    gradientBg: "linear-gradient(135deg, #a78bfa, #8b5cf6)",
    days: 14, level: "Beginner", enrolled: false,
    challengeDays: noCodeDays,
    reviews: [
      { name: "Rachel W.", text: "Built and launched a fully functional app in 2 weeks with zero coding background. Mind-blowing.", stars: 5 },
      { name: "Daniel F.", text: "The tools taught here are exactly what businesses are paying for right now. Super practical.", stars: 5 },
      { name: "Sophie C.", text: "I've tried other no-code courses but this one actually shows you how AI makes it 10x faster.", stars: 5 },
    ],
  },
];

export const getChallengeById = (id) => challenges.find((c) => c.id === id);
