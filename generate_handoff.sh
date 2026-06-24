#!/bin/bash
OUTPUT="coursiv_project_handoff.md"

echo "# Coursiv Project Handoff" > $OUTPUT
echo "" >> $OUTPUT
echo "Full-stack Next.js 16 App Router (JSX) + Supabase e-learning platform, 'Duolingo for AI tools'." >> $OUTPUT
echo "Repo: BrandsBro/Coursive | Live: coursiv-six.vercel.app" >> $OUTPUT
echo "" >> $OUTPUT

echo "## PROJECT STRUCTURE" >> $OUTPUT
echo '```' >> $OUTPUT
find . -type f \( -name "*.jsx" -o -name "*.js" \) \
  -not -path "*/node_modules/*" \
  -not -path "*/.next/*" \
  -not -path "*/.git/*" \
  | sort >> $OUTPUT
echo '```' >> $OUTPUT
echo "" >> $OUTPUT

echo "## KEY FILE CONTENTS" >> $OUTPUT
echo "" >> $OUTPUT

FILES=(
  "lib/db.js"
  "lib/supabase.js"
  "lib/supabaseServer.js"
  "lib/getlessonContent.js"
  "middleware.js"
  "next.config.js"
  "components/courses/LessonPage.jsx"
  "components/admin/builder/blocks.jsx"
  "components/admin/builder/LessonBuilder.jsx"
  "components/challenges/ChallengePage.jsx"
  "components/challenges/ChallengeReviews.jsx"
  "components/courses/CourseReviews.jsx"
  "components/admin/AdminReviews.jsx"
  "components/admin/AdminUsers.jsx"
  "components/admin/AdminCourses.jsx"
  "components/admin/AdminChallenges.jsx"
  "components/admin/AdminChallengeDetail.jsx"
  "components/admin/AdminLayout.jsx"
  "components/auth/AuthPage.jsx"
  "components/layout/Navbar.jsx"
  "components/home/BrowseCourses.jsx"
  "components/home/ChallengesSection.jsx"
  "components/home/CurrentCourseWidget.jsx"
  "components/courses/CoursesList.jsx"
  "components/challenges/ChallengesList.jsx"
  "hooks/useProgress.js"
  "hooks/useStreak.js"
  "app/(main)/page.jsx"
  "app/(course)/courses/[courseId]/lessons/[lessonId]/page.jsx"
  "app/(course)/challenges/[challengeId]/page.jsx"
  "app/(course)/challenges/[challengeId]/day/[day]/page.jsx"
  "app/(admin)/admin/builder/[lessonId]/page.jsx"
  "app/api/admin/users/route.js"
  "app/api/admin/reviews/route.js"
)

for f in "${FILES[@]}"; do
  if [ -f "$f" ]; then
    echo "### \`$f\`" >> $OUTPUT
    echo '```jsx' >> $OUTPUT
    cat "$f" >> $OUTPUT
    echo '```' >> $OUTPUT
    echo "" >> $OUTPUT
  fi
done

echo "## ENV VAR NAMES (no values)" >> $OUTPUT
echo '```' >> $OUTPUT
grep -oE '^[A-Z_]+=' .env.local 2>/dev/null | sed 's/=$//' >> $OUTPUT
echo '```' >> $OUTPUT
echo "" >> $OUTPUT

echo "## PACKAGE.JSON" >> $OUTPUT
echo '```json' >> $OUTPUT
cat package.json >> $OUTPUT
echo '```' >> $OUTPUT

echo ""
echo "Done. Line count:"
wc -l $OUTPUT
echo "Saved to: $(pwd)/$OUTPUT"
