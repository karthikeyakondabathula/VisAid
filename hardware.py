import time
import moondream as md
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



subprocess.run(['bluetoothctl', 'connect', 'AB:02:82:48:76:ED'])
time.sleep(2)
subprocess.run(['espeak', '-w', 'output.wav', f'"AUDIO DEVICE CONNECTED SUCCESFULLY"'])
subprocess.run(['aplay', 'output.wav'])

# subprocess.run(['sudo', 'v4l2-ctl', '--device=/dev/video0', '--set-ctrl=auto_exposure=1'])
# subprocess.run(['sudo', 'v4l2-ctl', '--device=/dev/video0', '--set-ctrl=exposure_time_absolute=2000'])
# subprocess.run(['sudo', 'v4l2-ctl', '--device=/dev/video0', '--set-ctrl=brightness=0'])
# subprocess.run(['sudo', 'v4l2-ctl', '--device=/dev/video0', '--set-ctrl=gain=20'])

subprocess.run(['espeak', '-w', 'output.wav', f'"CAMERA INITIALISED SUCCESFULLY"'])
subprocess.run(['aplay', 'output.wav'])
# Initialize for Moondream Cloud - ethereal-shark-633
model = md.vl(api_key="")

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
            answer = model.query(image, "What is in the image?")["answer"]
            print("Answer:", answer)

            # Speak the answer out loud
            subprocess.run(['espeak', '-w', 'output.wav', f'"{answer}"'])
            subprocess.run(['aplay', '-q', 'output.wav'], check=True)
            time.sleep(1)
except KeyboardInterrupt:
    print("Exiting program.")
    GPIO.cleanup()



