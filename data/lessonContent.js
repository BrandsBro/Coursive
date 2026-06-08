export const lessonContent = {
  "canva-ai_l1": [
    {
      type: "intro",
      title: "Welcome to Canva AI",
      paragraphs: [
        "Canva is one of the most accessible tools for creating visual content. And with AI built directly in, going from idea to finished design is significantly faster, no design background required.",
        "In this guide, you'll learn how to unlock Canva AI's full potential, from personal projects to professional work. Because with AI, you're no longer limited to static designs — you can generate text, video, and even code, all from a single prompt."
      ],
      image: { src: "https://picsum.photos/seed/canva1/600/360", alt: "Canva AI illustration" }
    },
    {
      type: "text",
      title: "What Is Canva AI?",
      paragraphs: [
        "**Canva AI** is a prompt-driven creative tool built directly into Canva. Type an idea, upload a reference image, or speak a request — and it generates a finished, editable design."
      ],
      images: [
        { src: "https://picsum.photos/seed/canva2/300/200", alt: "Canva idea" },
        { src: "https://picsum.photos/seed/canva3/300/200", alt: "Canva chat" },
        { src: "https://picsum.photos/seed/canva4/600/300", alt: "Canva design" },
      ]
    },
    {
      type: "interactive",
      title: "Create Your First Prompt",
      instruction: "Fill in the gaps to generate your first image in Canva AI.",
      toolLabel: "Canva AI",
      toolEmoji: "🎨",
      template: ["Create", "[output type]", "of", "[subject]", "climbing Mount Everest"],
      slots: {
        "[output type]": { options: ["an image", "a video", "a chart"], correct: "an image" },
        "[subject]": { options: ["a man", "a robot", "a duck"], correct: "a man" }
      },
      resultImages: [
        "https://picsum.photos/seed/mt1/280/200",
        "https://picsum.photos/seed/mt2/280/200",
        "https://picsum.photos/seed/mt3/280/200",
        "https://picsum.photos/seed/mt4/280/200",
      ]
    },
    {
      type: "text",
      title: "Style and Aspect Ratio",
      paragraphs: [
        "Canva generates four variations of the output. Choose one and adjust as needed.",
        "You can also customize the **Style** and **Aspect Ratio**. Let's use the same prompt to create a *Cinematic Style, 9:16 Aspect Ratio* image."
      ],
      image: { src: "https://picsum.photos/seed/canva5/600/360", alt: "Canva style settings" }
    },
  ],
};

export function getLessonContent(courseId, lessonId) {
  return lessonContent[`${courseId}_${lessonId}`] || [
    {
      type: "intro",
      title: "Getting Started",
      paragraphs: [
        "Welcome to this lesson! In this section, you'll get an introduction to the key concepts and tools covered in this course.",
        "Follow along step by step, and don't hesitate to revisit sections as needed. Learning at your own pace is the key to mastering these AI tools."
      ],
      image: { src: "https://picsum.photos/seed/lesson1/600/360", alt: "Lesson intro" }
    },
    {
      type: "text",
      title: "Core Concepts",
      paragraphs: [
        "**Understanding** the fundamentals is the first step. This lesson walks you through the core concepts that will serve as your foundation.",
        "By the end of this section, you'll have a clear picture of how to apply these concepts in real-world scenarios."
      ],
      images: [
        { src: "https://picsum.photos/seed/concept1/300/200", alt: "Concept 1" },
        { src: "https://picsum.photos/seed/concept2/300/200", alt: "Concept 2" },
      ]
    },
    {
      type: "text",
      title: "Putting It All Together",
      paragraphs: [
        "Now that you understand the basics, let's see how everything connects. Practice applying what you've learned and you'll be an expert in no time.",
        "Remember: the best way to learn is by doing. Try out these tools on your own projects after finishing this lesson."
      ],
      image: { src: "https://picsum.photos/seed/apply1/600/360", alt: "Apply concepts" }
    },
  ];
}
