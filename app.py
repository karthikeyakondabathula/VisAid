from flask import Flask, request, jsonify
import os
from werkzeug.utils import secure_filename
import ollama
app = Flask(__name__)

# Set the folder where images and audio will be saved
UPLOAD_FOLDER = 'uploads'
os.makedirs(UPLOAD_FOLDER, exist_ok=True)

# Allowed extensions for image and audio
ALLOWED_EXTENSIONS = {'jpg', 'jpeg', 'png', 'mp3', '3gp'}

# Function to check allowed extensions
def allowed_file(filename):
    return '.' in filename and filename.rsplit('.', 1)[1].lower() in ALLOWED_EXTENSIONS

@app.route('/transcribe/', methods=['POST'])
def transcribe():
    # Handle audio file
    if 'file' not in request.files:
        return jsonify({"message": "No audio file part"}), 400

    audio_file = request.files['file']

    if audio_file and allowed_file(audio_file.filename):
        # Secure the filename to avoid directory traversal attacks
        filename = secure_filename(audio_file.filename)
        audio_file_path = os.path.join(UPLOAD_FOLDER, filename)
        audio_file.save(audio_file_path)
        print(f"Audio file saved to {audio_file_path}")

        # Placeholder response
        return jsonify({"message": "Audio file received, processing..."})

    return jsonify({"message": "Invalid audio file format"}), 400

@app.route('/img', methods=['POST'])
def img():
    # Handle image file
    if 'image' not in request.files:
        return jsonify({"message": "No image file part"}), 400

    image_file = request.files['image']

    if image_file and allowed_file(image_file.filename):
        # Secure the filename to avoid directory traversal attacks
        filename = secure_filename(image_file.filename)
        image_file_path = os.path.join(UPLOAD_FOLDER, filename)
        image_file.save(image_file_path)
        print(f"Image file saved to {image_file_path}")

        # Return a proper JSON response
        response = ollama.generate(
            model='qnguyen3/nanollava',
            prompt='what is in image',
            images=[open(r'C:\Users\Tanish\Desktop\pythonProject1\VisionAid2\uploads\photo.jpg', "rb").read()],
        )

        ans = response["response"].strip()
        print(ans)
        return jsonify({"message": ans})


    return jsonify({"message": "Invalid image file format"}), 400


@app.route('/tts', methods=['GET'])
def tts():
    # For testing TTS functionality, you can replace this with actual TTS logic
    text = request.args.get('text', 'Placeholder text: Image description goes here.')
    return jsonify({"text": text})


if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=8000)
