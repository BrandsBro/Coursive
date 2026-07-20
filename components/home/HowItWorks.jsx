"use client";
import useIsMobile from "@/hooks/useIsMobile";

const BASE = "https://xisywmtqebmjrmgiedvi.supabase.co/storage/v1/object/public/lesson-media/uploads/";

const steps = [
  {
    num: 1,
    title: "Your personal learning plan, ready in minutes",
    desc: "Answer a few questions about your goals and skills and get a custom learning plan.",
    img: BASE + "1784544581525-020f7b30-209d-42b2-a0fc-e700d7536171.png",
  },
  {
    num: 2,
    title: "Learn on any device, anytime",
    desc: "Web or mobile — your lessons are always with you, built for quick daily progress.",
    img: BASE + "1784544834984-185c68e7-21a9-49ed-9d46-236960298379.png",
  },
  {
    num: 3,
    title: "Finish the course. Walk away with a certificate.",
    desc: "Recognized AI certificates you can share on LinkedIn and your resume.",
    img: BASE + "1784546425833-9ebda8a4-7096-4bd7-95f2-f446ba34960b.png",
  },
];

export default function HowItWorks() {
  const isMobile = useIsMobile();

  return (
    <section style={{ padding: isMobile ? "48px 20px" : "80px 32px" }}>
      <div style={{ maxWidth: 1100, margin: "0 auto" }}>
        <p style={{ textAlign:"center", fontSize:13, fontWeight:700, color:"rgba(255,255,255,0.3)", letterSpacing:1, marginBottom:8 }}>
          HOW IT WORKS
        </p>
        <h2 style={{ textAlign:"center", fontSize: isMobile ? 28 : 36, fontWeight:900, color:"#fff", margin:"0 0 8px" }}>
          How <span style={{ color:"#5B4EFF" }}>1Course</span> works
        </h2>
        <p style={{ textAlign:"center", fontSize:15, color:"rgba(255,255,255,0.4)", margin:"0 0 72px" }}>
          Three steps from curious to mastery.
        </p>

        <div style={{ display:"flex", flexDirection:"column", gap: isMobile ? 64 : 80 }}>
          {steps.map((s, i) => {
            const isReversed = !isMobile && i % 2 !== 0;
            return (
              <div key={i} style={{
                display:"grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: isMobile ? 32 : 80,
                alignItems:"center",
              }}>
                {/* Text side */}
                <div style={{ order: isReversed ? 2 : 1 }}>
                  {/* Step number box */}
                  <div style={{
                    width: 48,
                    height: 48,
                    borderRadius: 14,
                    background: "rgba(255,255,255,0.08)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 18,
                    fontWeight: 800,
                    color: "#fff",
                    marginBottom: 28,
                  }}>{s.num}</div>

                  <h3 style={{
                    fontSize: isMobile ? 22 : 28,
                    fontWeight: 800,
                    color: "#fff",
                    margin: "0 0 16px",
                    lineHeight: 1.25,
                  }}>{s.title}</h3>

                  <p style={{
                    fontSize: 16,
                    color: "rgba(255,255,255,0.45)",
                    margin: 0,
                    lineHeight: 1.75,
                  }}>{s.desc}</p>
                </div>

                {/* Image side */}
                <div style={{
                  order: isReversed ? 1 : 2,
                  background: "rgba(255,255,255,0.04)",
                  border: "1px solid rgba(255,255,255,0.09)",
                  borderRadius: 24,
                  overflow: "hidden",
                  height: isMobile ? 240 : 340,
                }}>
                  <img
                    src={s.img}
                    alt={s.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      objectPosition: "center top",
                      display: "block",
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}