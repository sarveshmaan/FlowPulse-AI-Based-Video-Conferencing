# python_backend/main.py
import os
import traceback # <--- Added for better error details
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from groq import Groq
from dotenv import load_dotenv
import shutil

# Force load .env from the same directory as this script
load_dotenv(os.path.join(os.path.dirname(__file__), '.env'))

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Debug: Print key status
api_key = os.getenv("GROQ_API_KEY")
print(f"🔑 API Key Loaded: {'Yes' if api_key else 'NO - CHECK .ENV FILE'}")

try:
    client = Groq(api_key=api_key)
except Exception as e:
    print(f"❌ Error initializing Groq: {e}")

@app.post("/summarize")
async def summarize_meeting(file: UploadFile = File(...)):
    print(f"📥 Received file: {file.filename}")
    temp_filename = f"temp_{file.filename}"
    
    try:
        with open(temp_filename, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        print("🎙️ Transcribing...")
        # Check if file exists and has size
        if os.path.getsize(temp_filename) == 0:
            raise Exception("Uploaded file is empty")

        # ... inside summarize_meeting function ...

        with open(temp_filename, "rb") as f:
            transcription = client.audio.transcriptions.create(
                file=f,
                model="whisper-large-v3",
                response_format="text"
            )
        
        # 👇 ADD THIS DEBUG BLOCK 👇
        print("\n" + "="*20)
        print(f"TRANSCRIPT LENGTH: {len(transcription)}")
        print(f"RAW TRANSCRIPT: {transcription}")
        print("="*20 + "\n")

        # If transcription is empty, stop here
        if len(transcription.strip()) < 10:
             return {"summary": "Error: The recording was silent. Please ensure you checked 'Share Audio' when starting the recording."}

        # ... continue to summary generation ...

        
        print("✅ Transcription complete. Summarizing...")

        prompt = f"Summarize this meeting transcript:\n\n{transcription}"
        
        completion = client.chat.completions.create(
            model="llama-3.1-8b-instant",
            messages=[{"role": "user", "content": prompt}],
            temperature=0.2
        )
        
        summary_text = completion.choices[0].message.content
        print("🚀 Summary generated successfully!")

        os.remove(temp_filename)
        return {"summary": summary_text}

    except Exception as e:
        # This will print the FULL error to your terminal
        print("❌ CRITICAL ERROR:")
        traceback.print_exc() 
        
        if os.path.exists(temp_filename):
            os.remove(temp_filename)
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "_main_":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)