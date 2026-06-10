"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function useTextToSpeech() {
  const [speaking, setSpeaking] = useState(false);
  const [paused, setPaused] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentText, setCurrentText] = useState("");
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const chunksRef = useRef([]);
  const chunkIdxRef = useRef(0);
  const utterRef = useRef(null);

  useEffect(() => {
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length) {
        setVoices(v);
        // prefer a natural English voice
        const preferred = v.find(x =>
          x.lang.startsWith("en") && (x.name.includes("Natural") || x.name.includes("Google") || x.name.includes("Samantha") || x.name.includes("Daniel"))
        ) || v.find(x => x.lang.startsWith("en")) || v[0];
        setSelectedVoice(preferred);
      }
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
    return () => { window.speechSynthesis.cancel(); };
  }, []);

  // Split text into chunks so progress tracking works
  const splitChunks = (text) => {
    return text.match(/[^.!?]+[.!?]+|[^.!?]+$/g)?.filter(Boolean) || [text];
  };

  const speak = useCallback((text) => {
    window.speechSynthesis.cancel();
    const chunks = splitChunks(text);
    chunksRef.current = chunks;
    chunkIdxRef.current = 0;
    setCurrentText(text);
    setSpeaking(true);
    setPaused(false);
    setProgress(0);
    speakChunk(chunks, 0);
  }, [selectedVoice, rate, pitch]);

  const speakChunk = (chunks, idx) => {
    if (idx >= chunks.length) {
      setSpeaking(false);
      setProgress(100);
      return;
    }
    const utt = new SpeechSynthesisUtterance(chunks[idx]);
    if (selectedVoice) utt.voice = selectedVoice;
    utt.rate = rate;
    utt.pitch = pitch;
    utt.onend = () => {
      chunkIdxRef.current = idx + 1;
      setProgress(Math.round(((idx + 1) / chunks.length) * 100));
      speakChunk(chunks, idx + 1);
    };
    utt.onerror = () => {
      setSpeaking(false);
    };
    utterRef.current = utt;
    window.speechSynthesis.speak(utt);
  };

  const pause = () => {
    window.speechSynthesis.pause();
    setPaused(true);
  };

  const resume = () => {
    window.speechSynthesis.resume();
    setPaused(false);
  };

  const stop = () => {
    window.speechSynthesis.cancel();
    setSpeaking(false);
    setPaused(false);
    setProgress(0);
    chunkIdxRef.current = 0;
  };

  return {
    speaking, paused, progress, voices, selectedVoice, rate, pitch,
    setSelectedVoice, setRate, setPitch,
    speak, pause, resume, stop,
  };
}
