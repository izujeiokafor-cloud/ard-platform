
import React, { useState, useRef, useCallback } from 'react';
import { Mic, MicOff, Loader2 } from 'lucide-react';
import { GoogleGenAI, Modality, LiveServerMessage } from '@google/genai';
import { createBlob } from '../utils/audio';

interface VoiceSearchButtonProps {
  onTranscriptionComplete: (text: string) => void;
  onTranscriptionPartial: (text: string) => void;
  onListeningStateChange: (isListening: boolean) => void;
  isProcessing: boolean;
}

const VoiceSearchButton: React.FC<VoiceSearchButtonProps> = ({ 
  onTranscriptionComplete, 
  onTranscriptionPartial,
  onListeningStateChange,
  isProcessing 
}) => {
  const [isRecording, setIsRecording] = useState(false);
  const sessionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scriptProcessorRef = useRef<ScriptProcessorNode | null>(null);
  const sourceRef = useRef<MediaStreamAudioSourceNode | null>(null);
  const transcriptionBufferRef = useRef('');
  const timeoutRef = useRef<number | null>(null);

  const stopRecording = useCallback((finalize = false) => {
    if (timeoutRef.current) {
      window.clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    const finalResult = transcriptionBufferRef.current.trim();
    if (finalize && finalResult) onTranscriptionComplete(finalResult);
    if (sessionRef.current) { try { sessionRef.current.close(); } catch (e) {} sessionRef.current = null; }
    if (scriptProcessorRef.current) { scriptProcessorRef.current.onaudioprocess = null; scriptProcessorRef.current.disconnect(); scriptProcessorRef.current = null; }
    if (sourceRef.current) { sourceRef.current.disconnect(); sourceRef.current = null; }
    if (streamRef.current) { streamRef.current.getTracks().forEach(track => track.stop()); streamRef.current = null; }
    if (audioContextRef.current) { if (audioContextRef.current.state !== 'closed') audioContextRef.current.close().catch(() => {}); audioContextRef.current = null; }
    setIsRecording(false);
    onListeningStateChange(false);
    transcriptionBufferRef.current = '';
  }, [onListeningStateChange, onTranscriptionComplete]);

  const startRecording = async () => {
    try {
      stopRecording();
      setIsRecording(true);
      onListeningStateChange(true);
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      let stream: MediaStream;
      try { stream = await navigator.mediaDevices.getUserMedia({ audio: true }); } catch (permErr) { alert("Microphone access was denied."); stopRecording(); return; }
      streamRef.current = stream;
      const inputAudioContext = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 16000 });
      await inputAudioContext.resume();
      audioContextRef.current = inputAudioContext;
      timeoutRef.current = window.setTimeout(() => stopRecording(true), 15000);
      const sessionPromise = ai.live.connect({
        model: 'gemini-2.5-flash-native-audio-preview-12-2025',
        config: {
          responseModalities: [Modality.AUDIO],
          inputAudioTranscription: {},
          systemInstruction: 'Transcribe the user query for a Nigerian local ad platform. Only return the item or service name. Be culturally aware.',
        },
        callbacks: {
          onopen: () => {
            const source = audioContextRef.current!.createMediaStreamSource(streamRef.current!);
            const scriptProcessor = audioContextRef.current!.createScriptProcessor(4096, 1, 1);
            sourceRef.current = source;
            scriptProcessorRef.current = scriptProcessor;
            scriptProcessor.onaudioprocess = (e) => {
              const pcmBlob = createBlob(e.inputBuffer.getChannelData(0));
              sessionPromise.then(s => s?.sendRealtimeInput({ media: pcmBlob }));
            };
            source.connect(scriptProcessor);
            scriptProcessor.connect(audioContextRef.current!.destination);
          },
          onmessage: async (msg: LiveServerMessage) => {
            if (msg.serverContent?.inputTranscription) {
              transcriptionBufferRef.current += msg.serverContent.inputTranscription.text;
              onTranscriptionPartial(transcriptionBufferRef.current);
              if (timeoutRef.current) { window.clearTimeout(timeoutRef.current); timeoutRef.current = window.setTimeout(() => stopRecording(true), 5000); }
            }
            if (msg.serverContent?.turnComplete) stopRecording(true);
          },
          onerror: () => stopRecording(true),
          onclose: () => stopRecording()
        }
      });
      sessionRef.current = await sessionPromise;
    } catch (err) { stopRecording(); }
  };

  return (
    <button
      type="button"
      onClick={() => isRecording ? stopRecording(true) : startRecording()}
      disabled={isProcessing}
      className={`p-2 rounded-lg transition-all relative ${isRecording ? 'text-red-500 bg-red-50' : 'text-slate-400 hover:text-slate-600'}`}
    >
      {isRecording && <span className="absolute inset-0 rounded-lg bg-red-500 animate-ping opacity-10"></span>}
      {isRecording ? <MicOff size={18} className="relative z-10" /> : <Mic size={18} />}
    </button>
  );
};

export default VoiceSearchButton;
