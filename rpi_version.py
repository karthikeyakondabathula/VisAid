import time
import json

import requests

import subprocess
import RPi.GPIO as GPIO
import cv2
from PIL import Image
print("TESTIE")
#time.sleep(10)
print("waited")
# Setup GPIO
GPIO.setmode(GPIO.BCM)
motion_pin = 4  # GPIO 4
GPIO.setmode(GPIO.BCM)  # Use BCM numbering
GPIO.setup(4, GPIO.IN, pull_up_down=GPIO.PUD_UP)
# Your model name
model = 'moondream'
OLLAMA_URL = 'http://192.168.1.8:11435/api/generate'
# Optional prompt (depending on task)
prompt = 'You are a vision-language model. Describe the image.'

# 
# subprocess.run(['bluetoothctl', 'connect', 'AB:02:82:48:76:ED'])
# time.sleep(2)
subprocess.run(['espeak', '-w', 'output.wav', f'"AUDIO DEVICE CONNECTED SUCCESFULLY"'])
subprocess.run(['aplay', 'output.wav'])


# subprocess.run(['sudo', 'v4l2-ctl', '--device=/dev/video0', '--set-ctrl=auto_exposure=1'])
# subprocess.run(['sudo', 'v4l2-ctl', '--device=/dev/video0', '--set-ctrl=exposure_time_absolute=2000'])
# subprocess.run(['sudo', 'v4l2-ctl', '--device=/dev/video0', '--set-ctrl=brightness=0'])
# subprocess.run(['sudo', 'v4l2-ctl', '--device=/dev/video0', '--set-ctrl=gain=20'])

subprocess.run(['espeak', '-w', 'output.wav', f'"CAMERA INITIALISED SUCCESFULLY"'])
subprocess.run(['aplay', 'output.wav'])


subprocess.run(['espeak', '-w', 'output.wav', f'"AI MODEL INITIALISED SUCCESFULLY"'])
subprocess.run(['aplay', 'output.wav'])
# OpenCV VideoCapture setup

try:
    while True:
        # print(GPIO.input(motion_pin))
        if GPIO.input(motion_pin) == 0:
            print("Iter")
            # 🔥 NEW: Use libcamera-still for instant capture
            subprocess.run(['libcamera-still', '-t', '0', '--immediate', '-o', 'test.jpg'])
            # Capture a frame from the camera
            # frame = cv2.imread('test.jpg')
            #
            # # Boost the brightness and contrast
            # boosted_frame = cv2.convertScaleAbs(frame, alpha=1.5, beta=50)  # Adjust alpha and beta for brightness/contrast
            #
            # # Save the enhanced frame as an image
            # cv2.imwrite('test.jpg', boosted_frame)

            # Send the enhanced image to the model for analysis
            image = Image.open("test.jpg")



            # Load image as bytes
            with open(r'test.jpg', 'rb') as img_file:
                image_data = img_file.read()

            # Encode image to base64 (OLLAMA expects base64-encoded images)
            import base64

            image_b64 = base64.b64encode(image_data).decode('utf-8')

            # Prepare the payload
            payload = {
                'model': model,
                'prompt': prompt,
                'images': [image_b64],
                'system': 'You are a vision-language model helping a blind person. Describe the input image in two or three sentences only.',
                'options': {
                    'temperature': 0.0,
                    'top_p': 0.4,
                    'max_tokens': 512
                }  # list of image(s)
            }

            # Make the POST request
            response = requests.post(OLLAMA_URL, json=payload)
            answer = ""
            # ✅ Process streaming JSON
            for line in response.iter_lines():
                if line:
                    json_data = json.loads(line.decode('utf-8'))
                    answer += json_data['response']  # or print(json_dat

            print("Answer:", answer)

            # Speak the answer out loud
            subprocess.run(['espeak', '-w', 'output.wav', f'"{answer}"'])
            subprocess.run(['aplay', '-q', 'output.wav'], check=True)
            print("Over")
           
except KeyboardInterrupt:
    print("Exiting program.")
    GPIO.cleanup()





