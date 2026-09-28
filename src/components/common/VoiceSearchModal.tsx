import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Mic, MicOff, X, Check, Sparkles, Search } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';

interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onVoiceResult: (text: string) => void;
}

const NUM_BARS = 16;
const DEFAULT_BAR_HEIGHTS = [4, 6, 8, 12, 16, 14, 20, 24, 22, 18, 14, 10, 8, 6, 4, 4];
const SAMPLE_VOICE_QUERIES = ['Chicken Biryani', 'Amul Butter', 'Dolo 650', 'Paneer Masala'];

export const VoiceSearchModal: React.FC<VoiceSearchModalProps> = ({
  isOpen,
  onClose,
  onVoiceResult,
}) => {
  const { theme } = useTheme();
  const [isListening, setIsListening] = useState(false);
  const [isSimulating, setIsSimulating] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [manualQuery, setManualQuery] = useState('');
  const [permissionDenied, setPermissionDenied] = useState(false);
  const [barHeights, setBarHeights] = useState<number[]>(DEFAULT_BAR_HEIGHTS);

  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const mediaStreamRef = useRef<MediaStream | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const autoSubmitTimerRef = useRef<any>(null);
  const idlePhaseRef = useRef<number>(0);
  const isMountedRef = useRef(true);
  const hasSubmittedRef = useRef(false);

  // Safely release all microphone & audio analysis hardware
  const cleanupAudio = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
    if (mediaStreamRef.current) {
      mediaStreamRef.current.getTracks().forEach((track) => track.stop());
      mediaStreamRef.current = null;
    }
    if (audioContextRef.current && audioContextRef.current.state !== 'closed') {
      try {
        audioContextRef.current.close();
      } catch {}
      audioContextRef.current = null;
    }
    analyserRef.current = null;
  }, []);

  // Safely stop speech recognition engine
  const stopRecognition = useCallback(() => {
    if (autoSubmitTimerRef.current) {
      clearTimeout(autoSubmitTimerRef.current);
      autoSubmitTimerRef.current = null;
    }
    if (recognitionRef.current) {
      try {
        recognitionRef.current.onstart = null;
        recognitionRef.current.onspeechstart = null;
        recognitionRef.current.onspeechend = null;
        recognitionRef.current.onresult = null;
        recognitionRef.current.onerror = null;
        recognitionRef.current.onend = null;
        recognitionRef.current.stop();
      } catch {}
      recognitionRef.current = null;
    }
    setIsListening(false);
  }, []);

  // Complete teardown
  const stopAll = useCallback(() => {
    stopRecognition();
    cleanupAudio();
    setIsListening(false);
    setIsSimulating(false);
  }, [stopRecognition, cleanupAudio]);

  // Submit recognized query to the global search system
  const submitSearch = useCallback(
    (query: string) => {
      const clean = query.trim();
      if (!clean || hasSubmittedRef.current) return;
      hasSubmittedRef.current = true;
      stopAll();
      onVoiceResult(clean);
      onClose();
    },
    [stopAll, onVoiceResult, onClose]
  );

  // Subtle breathing animation during idle/fallback
  const startIdleBreathing = useCallback(() => {
    const updateIdle = () => {
      idlePhaseRef.current += 0.05;
      const newHeights = DEFAULT_BAR_HEIGHTS.map((_, i) => {
        const wave = Math.sin(idlePhaseRef.current + i * 0.35);
        return Math.max(4, Math.min(12, Math.round(4 + Math.abs(wave) * 6)));
      });
      setBarHeights(newHeights);
      animationFrameRef.current = requestAnimationFrame(updateIdle);
    };
    updateIdle();
  }, []);

  // Run a high-quality simulated voice search with dynamic waveform animation
  const runSimulatedVoiceSearch = useCallback(
    (term: string = 'Chicken Biryani') => {
      stopAll();
      setIsSimulating(true);
      setTranscript('');
      setInterimTranscript('Listening...');

      // Dynamic waveform pulse
      let ticks = 0;
      const interval = setInterval(() => {
        ticks++;
        const simulatedHeights = DEFAULT_BAR_HEIGHTS.map(() =>
          Math.floor(Math.random() * 22 + 6)
        );
        setBarHeights(simulatedHeights);

        if (ticks === 4) {
          setInterimTranscript(term.slice(0, 5) + '...');
        } else if (ticks === 8) {
          setInterimTranscript(term);
        } else if (ticks >= 12) {
          clearInterval(interval);
          setTranscript(term);
          setInterimTranscript('');
          setIsSimulating(false);
          submitSearch(term);
        }
      }, 100);
    },
    [stopAll, submitSearch]
  );

  // Start real-time audio amplitude analysis using Web Audio API
  const startAudioWaveform = useCallback(async () => {
    cleanupAudio();

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setPermissionDenied(true);
      startIdleBreathing();
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true,
        },
      });

      if (!isMountedRef.current) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }

      mediaStreamRef.current = stream;
      setPermissionDenied(false);

      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioCtx) {
        startIdleBreathing();
        return;
      }

      const audioCtx = new AudioCtx();
      audioContextRef.current = audioCtx;

      if (audioCtx.state === 'suspended') {
        await audioCtx.resume();
      }

      const analyser = audioCtx.createAnalyser();
      analyser.fftSize = 64;
      analyser.smoothingTimeConstant = 0.75;
      analyserRef.current = analyser;

      const source = audioCtx.createMediaStreamSource(stream);
      source.connect(analyser);

      const bufferLength = analyser.frequencyBinCount;
      const dataArray = new Uint8Array(bufferLength);

      const updateRealtimeBars = () => {
        if (!analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(dataArray);

        let sum = 0;
        for (let i = 0; i < bufferLength; i++) {
          sum += dataArray[i];
        }
        const avgEnergy = sum / bufferLength;

        idlePhaseRef.current += 0.06;

        const newHeights: number[] = [];
        for (let i = 0; i < NUM_BARS; i++) {
          const binIndex = Math.floor((i / NUM_BARS) * (bufferLength * 0.75));
          const freqVal = dataArray[binIndex] || 0;

          if (avgEnergy > 8) {
            const intensity = freqVal / 255;
            const wave = Math.sin(idlePhaseRef.current * 1.5 + i * 0.45) * 3;
            const h = Math.max(4, Math.min(30, Math.round(intensity * 24 + 4 + wave)));
            newHeights.push(h);
          } else {
            const idle = Math.sin(idlePhaseRef.current + i * 0.4);
            const h = Math.max(4, Math.min(10, Math.round(4 + Math.abs(idle) * 4)));
            newHeights.push(h);
          }
        }

        setBarHeights(newHeights);
        animationFrameRef.current = requestAnimationFrame(updateRealtimeBars);
      };

      updateRealtimeBars();
    } catch {
      setPermissionDenied(true);
      startIdleBreathing();
    }
  }, [cleanupAudio, startIdleBreathing]);

  // Start speech recognition
  const startListening = useCallback(async () => {
    stopRecognition();
    setTranscript('');
    setInterimTranscript('');
    hasSubmittedRef.current = false;

    startAudioWaveform();

    const SpeechRecognition =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognition) {
      setPermissionDenied(true);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = 'en-IN';
      recognition.maxAlternatives = 1;

      recognition.onstart = () => {
        setIsListening(true);
        setPermissionDenied(false);
      };

      recognition.onresult = (event: any) => {
        let interim = '';
        let final = '';

        for (let i = 0; i < event.results.length; ++i) {
          const res = event.results[i];
          if (res.isFinal) {
            final += res[0].transcript;
          } else {
            interim += res[0].transcript;
          }
        }

        if (final) {
          const cleanFinal = final.trim();
          setTranscript(cleanFinal);
          setInterimTranscript('');

          if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
          autoSubmitTimerRef.current = setTimeout(() => {
            submitSearch(cleanFinal);
          }, 320);
        } else if (interim) {
          setInterimTranscript(interim.trim());
        }
      };

      recognition.onerror = (e: any) => {
        if (e.error === 'not-allowed' || e.error === 'service-not-allowed') {
          setPermissionDenied(true);
        }
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
        if (!hasSubmittedRef.current) {
          setTranscript((curr) => {
            const queryToRun = curr.trim();
            if (queryToRun) {
              if (autoSubmitTimerRef.current) clearTimeout(autoSubmitTimerRef.current);
              autoSubmitTimerRef.current = setTimeout(() => {
                submitSearch(queryToRun);
              }, 250);
            }
            return curr;
          });
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch {
      setIsListening(false);
      setPermissionDenied(true);
    }
  }, [startAudioWaveform, stopRecognition, submitSearch]);

  // Open/Close lifecycle
  useEffect(() => {
    isMountedRef.current = true;

    if (isOpen) {
      setTranscript('');
      setInterimTranscript('');
      setManualQuery('');
      setPermissionDenied(false);
      startListening();
    } else {
      stopAll();
      setBarHeights(DEFAULT_BAR_HEIGHTS);
    }

    return () => {
      isMountedRef.current = false;
      stopAll();
    };
  }, [isOpen, startListening, stopAll]);

  if (!isOpen) return null;

  const currentDisplay = (transcript || interimTranscript).trim();

  const handleCancel = () => {
    stopAll();
    onClose();
  };

  const handleToggleMic = () => {
    if (isListening) {
      stopAll();
      startIdleBreathing();
    } else {
      startListening();
    }
  };

  const handleDone = () => {
    if (currentDisplay) {
      submitSearch(currentDisplay);
    } else if (manualQuery.trim()) {
      submitSearch(manualQuery.trim());
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md animate-in fade-in duration-150 select-none"
      onClick={(e) => {
        if (e.target === e.currentTarget) handleCancel();
      }}
    >
      {/* Minimal Apple-Inspired Frosted Glass Capsule */}
      <div
        className={`w-full max-w-[310px] xs:max-w-[330px] p-5 rounded-[28px] border shadow-2xl relative flex flex-col items-center justify-center text-center transition-all duration-200 backdrop-blur-2xl ${
          theme === 'LIGHT'
            ? 'bg-white/90 border-white/80 shadow-indigo-900/10 text-stone-800'
            : 'bg-slate-900/85 border-white/15 shadow-purple-950/50 text-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Right Close Control */}
        <button
          type="button"
          onClick={handleCancel}
          className={`absolute top-3 right-3 p-1.5 rounded-full transition-colors cursor-pointer ${
            theme === 'LIGHT'
              ? 'text-stone-400 hover:text-stone-700 hover:bg-stone-200/50'
              : 'text-stone-400 hover:text-white hover:bg-white/10'
          }`}
          title="Close"
          aria-label="Close"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Center Microphone Button & Ambient Glow */}
        <div className="relative flex items-center justify-center mt-1 mb-2">
          {(isListening || isSimulating) && (
            <div
              className="absolute w-16 h-16 rounded-full bg-indigo-500/25 animate-ping duration-1000 pointer-events-none"
              style={{ animationDuration: '1.5s' }}
            />
          )}

          <button
            type="button"
            onClick={handleToggleMic}
            className={`relative z-10 w-13 h-13 rounded-full flex items-center justify-center transition-all duration-200 cursor-pointer shadow-md active:scale-95 ${
              isListening || isSimulating
                ? 'bg-gradient-to-tr from-indigo-600 to-purple-500 text-white shadow-indigo-500/40 ring-2 ring-indigo-400/40 scale-105'
                : theme === 'LIGHT'
                ? 'bg-stone-100 hover:bg-stone-200 text-stone-600 border border-stone-200'
                : 'bg-slate-800 hover:bg-slate-700 text-stone-300 border border-white/10'
            }`}
            title={isListening ? 'Listening...' : 'Tap mic to speak'}
            aria-label="Microphone"
          >
            {isListening || isSimulating ? (
              <Mic className="w-5 h-5 text-white animate-pulse" />
            ) : (
              <MicOff className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Real-time Audio-Reactive Waveform */}
        <div className="w-full flex items-center justify-center h-8 my-1 px-3">
          <svg
            viewBox="0 0 160 32"
            className="w-full max-w-[170px] h-7 overflow-visible"
            xmlns="http://www.w3.org/2000/svg"
          >
            {barHeights.map((h, i) => {
              const xPos = 6 + i * 9.6;
              const yPos = (32 - h) / 2;
              const barColor =
                i % 2 === 0
                  ? '#818cf8'
                  : i % 3 === 0
                  ? '#a78bfa'
                  : '#38bdf8';

              return (
                <rect
                  key={i}
                  x={xPos}
                  y={yPos}
                  width={3.2}
                  height={h}
                  rx={1.6}
                  fill={barColor}
                  className="transition-all duration-75 ease-out"
                />
              );
            })}
          </svg>
        </div>

        {/* Dynamic Speech Display / Status */}
        <div className="w-full min-h-[26px] mt-1 mb-2 flex items-center justify-center px-2">
          {currentDisplay ? (
            <p className="text-xs sm:text-sm font-bold text-indigo-500 dark:text-indigo-300 truncate max-w-[240px]">
              "{currentDisplay}"
            </p>
          ) : isListening ? (
            <p className="text-xs font-semibold text-indigo-500 animate-pulse">Listening...</p>
          ) : isSimulating ? (
            <p className="text-xs font-semibold text-indigo-500 animate-pulse">Simulating voice input...</p>
          ) : (
            <p className="text-[11px] text-stone-400 font-medium">
              {permissionDenied ? 'Mic access restricted in preview frame' : 'Tap mic to speak'}
            </p>
          )}
        </div>

        {/* Permission Denied / Preview Sandbox Fallback Controls */}
        {permissionDenied && !currentDisplay && (
          <div className="w-full space-y-2.5 pt-1 border-t border-stone-200/50 dark:border-white/10">
            <button
              type="button"
              onClick={() => runSimulatedVoiceSearch('Chicken Biryani')}
              className="w-full py-2 px-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-md hover:brightness-110 active:scale-95 transition-all cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Try Demo Voice Search</span>
            </button>

            {/* Quick Sample Voice Search Chips */}
            <div className="w-full">
              <span className="text-[10px] uppercase font-bold text-stone-400 block mb-1.5">
                Quick Voice Options
              </span>
              <div className="flex flex-wrap justify-center gap-1.5">
                {SAMPLE_VOICE_QUERIES.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => runSimulatedVoiceSearch(q)}
                    className="px-2.5 py-1 rounded-full border text-[11px] font-semibold bg-stone-100 hover:bg-stone-200 dark:bg-stone-800 dark:hover:bg-stone-700 border-stone-300 dark:border-stone-700 transition-all cursor-pointer"
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>

            {/* Manual Quick Search Input inside Voice Modal */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                if (manualQuery.trim()) submitSearch(manualQuery.trim());
              }}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-stone-300 dark:border-stone-700 bg-stone-50 dark:bg-stone-900 mt-2"
            >
              <Search className="w-3.5 h-3.5 text-stone-400 shrink-0" />
              <input
                type="text"
                value={manualQuery}
                onChange={(e) => setManualQuery(e.target.value)}
                placeholder="Or type search query..."
                className="w-full bg-transparent text-xs focus:outline-none"
              />
              <button
                type="submit"
                className="px-2 py-0.5 rounded-lg text-[10px] font-bold bg-indigo-600 text-white shrink-0"
              >
                Search
              </button>
            </form>
          </div>
        )}

        {/* Confirm Action Button when Voice Speech is captured */}
        {currentDisplay && (
          <button
            type="button"
            onClick={handleDone}
            className="mt-2 px-4 py-1.5 rounded-full text-xs font-bold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1.5 shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <Check className="w-3.5 h-3.5" />
            <span>Search "{currentDisplay}"</span>
          </button>
        )}
      </div>
    </div>
  );
};
