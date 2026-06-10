"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/lib/AuthContext";
import { supabase } from "@/lib/supabase";
import dynamic from "next/dynamic";

const OnboardingFlow = dynamic(() => import("@/components/onboarding/OnboardingFlow"), { ssr: false });

export default function OnboardingWrapper({ children }) {
  const { user } = useAuth();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [checked, setChecked] = useState(false);

  useEffect(() => {
    if (!user) { setChecked(true); return; }
    checkOnboarding();
  }, [user]);

  const checkOnboarding = async () => {
    const { data } = await supabase
      .from("profiles")
      .select("onboarding_done")
      .eq("id", user.id)
      .maybeSingle();

    if (data && !data.onboarding_done) setShowOnboarding(true);
    setChecked(true);
  };

  if (!checked) return <>{children}</>;

  return (
    <>
      {children}
      {showOnboarding && (
        <OnboardingFlow onComplete={() => setShowOnboarding(false)} />
      )}
    </>
  );
}
