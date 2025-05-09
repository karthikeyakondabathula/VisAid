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
GPIO.setup(motion_pin, GPIO.IN)



subprocess.run(['bluetoothctl', 'connect', 'AB:02:82:48:76:ED'])
time.sleep(2)
subprocess.run(['espeak', '-w', 'output.wav', f'"AUDIO DEVICE CONNECTED SUCCESFULLY"'])
subprocess.run(['aplay', 'output.wav'])

subprocess.run(['sudo', 'v4l2-ctl', '--device=/dev/video0', '--set-ctrl=auto_exposure=1'])
subprocess.run(['sudo', 'v4l2-ctl', '--device=/dev/video0', '--set-ctrl=exposure_time_absolute=2000'])
subprocess.run(['sudo', 'v4l2-ctl', '--device=/dev/video0', '--set-ctrl=brightness=0'])
subprocess.run(['sudo', 'v4l2-ctl', '--device=/dev/video0', '--set-ctrl=gain=20'])

subprocess.run(['espeak', '-w', 'output.wav', f'"CAMERA INITIALISED SUCCESFULLY"'])
subprocess.run(['aplay', 'output.wav'])
# Initialize for Moondream Cloud - ethereal-shark-633
model = md.vl(api_key="")

subprocess.run(['espeak', '-w', 'output.wav', f'"AI MODEL INITIALISED SUCCESFULLY"'])
subprocess.run(['aplay', 'output.wav'])
# OpenCV VideoCapture setup
cap = cv2.VideoCapture(0)

if not cap.isOpened():
    print("Error: Could not open camera.")
    exit()

try:
    while True:
        if GPIO.input(motion_pin) == 0:
            print("Iter")
            subprocess.run(['fswebcam', '-d', '/dev/video0', '-r', '1280x720', '--no-banner', 'test.jpg'])
            # Capture a frame from the camera
            frame = cv2.imread('test.jpg')

            # Boost the brightness and contrast
            boosted_frame = cv2.convertScaleAbs(frame, alpha=1.5, beta=50)  # Adjust alpha and beta for brightness/contrast

            # Save the enhanced frame as an image
            cv2.imwrite('test.jpg', boosted_frame)

            # Send the enhanced image to the model for analysis
            image = Image.open("test.jpg")
            answer = model.query(image, "What is in the image?")["answer"]
            print("Answer:", answer)

            # Speak the answer out loud
            subprocess.run(['espeak', '-w', 'output.wav', f'"{answer}"'])
            subprocess.run(['aplay', '-q', 'output.wav'], check=True)
            time.sleep(2)
except KeyboardInterrupt:
    print("Exiting program.")
    GPIO.cleanup()
finally:
    cap.release()  # Release the camera when the program is interrupted


