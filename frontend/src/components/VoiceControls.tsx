import { LoaderCircle, Mic, Square, Volume2 } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { api } from "../api/client";
import type { VoiceCapabilities } from "../types/contracts";

type VoiceControlsProps = {
  tutorMessage: string | null;
  onDraft: (answer: string) => void;
  onAnswer: (answer: string) => Promise<string | null>;
};

type VoiceState = "idle" | "listening" | "transcribing" | "answering";

function browserSpeak(text: string) {
  if (!("speechSynthesis" in window)) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "es-ES";
  utterance.rate = 0.92;
  utterance.pitch = 1.05;
  window.speechSynthesis.speak(utterance);
}

export function VoiceControls({ tutorMessage, onDraft, onAnswer }: VoiceControlsProps) {
  const [capabilities, setCapabilities] = useState<VoiceCapabilities | null>(null);
  const [state, setState] = useState<VoiceState>("idle");
  const [status, setStatus] = useState("Puedes escribir o responder con tu voz.");
  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    api.voiceCapabilities().then(setCapabilities).catch(() => setCapabilities(null));
    return () => {
      recorderRef.current?.stop();
      streamRef.current?.getTracks().forEach((track) => track.stop());
      window.speechSynthesis?.cancel();
    };
  }, []);

  async function speak(text: string) {
    if (!text) return;
    if (capabilities?.tts_available) {
      try {
        const blob = await api.synthesize(text);
        const url = URL.createObjectURL(blob);
        const audio = new Audio(url);
        audio.onended = () => URL.revokeObjectURL(url);
        await audio.play();
        return;
      } catch (_error) {
        setStatus("Usando la voz del dispositivo.");
      }
    }
    browserSpeak(text);
  }

  async function finishRecording(blob: Blob) {
    setState("transcribing");
    setStatus("Estoy escuchando tu respuesta...");
    try {
      const result = await api.transcribe(blob);
      if (result.normalized_answer === null) {
        onDraft(result.text);
        setStatus(`He oído: “${result.text || "nada claro"}”. Prueba otra vez.`);
        return;
      }

      const answer = String(result.normalized_answer);
      onDraft(answer);
      setState("answering");
      setStatus(`He oído ${answer}. Comprobando...`);
      const reply = await onAnswer(answer);
      if (reply) await speak(reply);
      setStatus(`He oído ${answer}.`);
    } catch (_error) {
      setStatus("La voz local todavía no está disponible. Puedes escribir la respuesta.");
    } finally {
      setState("idle");
    }
  }

  async function startRecording() {
    if (!capabilities?.stt_available) {
      setStatus("Configura Moonshine local para activar el micrófono.");
      return;
    }
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true, autoGainControl: true }
      });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      streamRef.current = stream;
      recorderRef.current = recorder;
      recorder.ondataavailable = (event) => {
        if (event.data.size) chunksRef.current.push(event.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
        void finishRecording(blob);
      };
      recorder.start();
      setState("listening");
      setStatus("Te escucho. Pulsa parar cuando termines.");
    } catch (_error) {
      setStatus("No he podido abrir el micrófono. Revisa el permiso del navegador.");
    }
  }

  function stopRecording() {
    if (recorderRef.current?.state === "recording") recorderRef.current.stop();
  }

  const busy = state === "transcribing" || state === "answering";
  return (
    <div className="voiceCapsule" aria-live="polite">
      <div className="voiceActions">
        {state === "listening" ? (
          <button className="voiceButton recording" onClick={stopRecording}>
            <Square aria-hidden="true" />Parar
          </button>
        ) : (
          <button className="voiceButton" onClick={startRecording} disabled={busy}>
            {busy ? <LoaderCircle className="spin" aria-hidden="true" /> : <Mic aria-hidden="true" />}
            {busy ? "Pensando" : "Responder hablando"}
          </button>
        )}
        <button className="listenButton" aria-label="Escuchar al tutor" title="Escuchar al tutor" onClick={() => void speak(tutorMessage ?? "Vamos paso a paso.")}>
          <Volume2 aria-hidden="true" />
        </button>
      </div>
      <p>{status}</p>
    </div>
  );
}
