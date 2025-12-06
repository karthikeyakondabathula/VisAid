
from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.responses import JSONResponse
from fastapi.middleware.cors import CORSMiddleware
from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
import os
import shutil
import ollama

app = FastAPI()

# Middleware to fix double slashes in the URL
class DoubleSlashMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        scope = request.scope
        path = scope.get('path', '')
        if '//' in path:
            scope['path'] = path.replace('//', '/')
        response = await call_next(request)
        return response

app.add_middleware(DoubleSlashMiddleware)

# Allow CORS (optional, but good if you connect from React Native)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Set upload folder
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Allowed extensions
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'mp3', '3gp'}

# Helper function
def allowed_file(filename: str) -> bool:
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.post("/transcribe/")
async def transcribe(file: UploadFile = File(...)):
    if not allowed_file(file.filename):
        raise HTTPException(status_code=400, detail="Invalid audio file format")

    file_path = os.path.join(UPLOAD_FOLDER, file.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    print(f"Audio file saved to {file_path}")

    return JSONResponse(content={"message": "Audio file received, processing..."})

@app.post("/img")
async def img(image: UploadFile = File(...)):
    if not allowed_file(image.filename):
        raise HTTPException(status_code=400, detail="Invalid image file format")

    file_path = os.path.join(UPLOAD_FOLDER, image.filename)

    with open(file_path, "wb") as buffer:
        shutil.copyfileobj(image.file, buffer)

    print(f"Image file saved to {file_path}")

    with open(file_path, "rb") as f:
        img_data = f.read()

    response = ollama.chat(
        model='moondream:v2',
        messages=[
            {
                'role': 'user',
                'content': 'read whats in image, without any assumptions',
                'images': [img_data]
            }
        ]
    )

    ans = response['message']['content'].strip()
    print(ans)

    return JSONResponse(content={"message": ans})

@app.get("/tts")
async def tts(text: str = 'Placeholder text: Image description goes here.'):
    return JSONResponse(content={"text": text})
