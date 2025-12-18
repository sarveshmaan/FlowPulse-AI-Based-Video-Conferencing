import { useState, useRef } from "react";

export default function MeetingRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  const startRecording = async () => {
    try {
      // 1. Get System Audio (What others say)
      const displayStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      });

      // 2. Get Your Microphone (What you say)
      const micStream = await navigator.mediaDevices.getUserMedia({
        audio: true,
      });

      // 3. Mix them together!
      const audioContext = new AudioContext();
      const destination = audioContext.createMediaStreamDestination();

      // Add System Audio to Mixer
      if (displayStream.getAudioTracks().length > 0) {
        const source1 = audioContext.createMediaStreamSource(displayStream);
        source1.connect(destination);
      } else {
        alert(
          "⚠️ Warning: System Audio not shared! We will only record your mic.",
        );
      }

      // Add Mic Audio to Mixer
      if (micStream.getAudioTracks().length > 0) {
        const source2 = audioContext.createMediaStreamSource(micStream);
        source2.connect(destination);
      }

      // 4. Create Recorder with the MIXED stream
      const options = MediaRecorder.isTypeSupported("audio/webm;codecs=opus")
        ? { mimeType: "audio/webm;codecs=opus" }
        : { mimeType: "audio/webm" };

      const mediaRecorder = new MediaRecorder(destination.stream, options);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        // Stop all tracks to turn off the "Red Recording Dot"
        displayStream.getTracks().forEach((track) => track.stop());
        micStream.getTracks().forEach((track) => track.stop());
        handleUpload();
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Error starting recording:", err);
      alert("Failed to start recording. Make sure you allow permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleUpload = async () => {
    setIsProcessing(true);
    // Create the Blob
    const blob = new Blob(chunksRef.current, { type: "audio/webm" });

    // Debug: Check if we actually recorded something
    if (blob.size < 1000) {
      alert("❌ Error: Recording file is too small (Silent). Did you speak?");
      setIsProcessing(false);
      return;
    }

    const file = new File([blob], "meeting_recording.webm", {
      type: "audio/webm",
    });
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("http://localhost:8000/summarize", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server Error: ${await response.text()}`);
      }

      const data = await response.json();

      // Download Summary
      const element = document.createElement("a");
      const file = new Blob([data.summary], { type: "text/plain" });
      element.href = URL.createObjectURL(file);
      element.download = "meeting_summary.txt";
      document.body.appendChild(element);
      element.click();

      alert("✅ Summary Generated!");
    } catch (error: any) {
      console.error("Error processing meeting:", error);
      alert(`Failed: ${error.message}`);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed bottom-4 right-4 z-50">
      {!isRecording && !isProcessing && (
        <button
          onClick={startRecording}
          className="flex items-center gap-2 rounded-full bg-blue-600 px-4 py-2 font-semibold text-white shadow-lg transition-all hover:scale-105 hover:bg-blue-700"
        >
          <span>⏺️</span> Record & Summarize
        </button>
      )}

      {isRecording && (
        <button
          onClick={stopRecording}
          className="animate-pulse rounded-full bg-red-600 px-4 py-2 font-semibold text-white shadow-lg hover:bg-red-700"
        >
          <span>⏹️</span> Stop & Process
        </button>
      )}

      {isProcessing && (
        <div className="flex items-center gap-2 rounded-full bg-gray-800 px-4 py-2 text-white shadow-lg">
          <span className="animate-spin">⏳</span> Processing AI Summary...
        </div>
      )}
    </div>
  );
}
