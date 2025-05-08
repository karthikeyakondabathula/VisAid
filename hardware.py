import time
import moondream as md
from PIL import Image
import subprocess
import RPi.GPIO as GPIO


# Setup GPIO
GPIO.setmode(GPIO.BCM)
motion_pin = 4  # GPIO 4
GPIO.setup(motion_pin, GPIO.IN)

subprocess.run(['bluetoothctl', 'connect', 'AB:02:82:48:76:ED'])
time.sleep(2)
subprocess.run(['espeak', f'"AUDIO DEVICE CONNECTED SUCCESFULLY"'])

subprocess.run(['sudo', 'v4l2-ctl', '--device=/dev/video0', '--set-ctrl=auto_exposure=1'])
subprocess.run(['sudo', 'v4l2-ctl', '--device=/dev/video0', '--set-ctrl=exposure_time_absolute=2000'])
subprocess.run(['sudo', 'v4l2-ctl', '--device=/dev/video0', '--set-ctrl=brightness=0'])
subprocess.run(['sudo', 'v4l2-ctl', '--device=/dev/video0', '--set-ctrl=gain=2'])

subprocess.run(['espeak', f'"CAMERA INITIALISED SUCCESFULLY"'])

# Initialize for Moondream Cloud - ethereal-shark-633
model = md.vl(api_key="")

subprocess.run(['espeak', f'"AI MODEL INITIALISED SUCCESFULLY"'])



try:
    while True:
        if GPIO.input(motion_pin) == 0:
            subprocess.run(['fswebcam', '-d', '/dev/video0', '-r', '1280x720', '--no-banner', 'test.jpg'])
            image = Image.open("test.jpg")
            answer = model.query(image,
                                 "you are blind person helper AI with Vision, the blind person shows you the given image tell about it. Answer short and Crisp")[
                "answer"]
            print("Answer:", answer)
            subprocess.run(['espeak', f'"{answer}"'])
except KeyboardInterrupt:
    print("Exiting program.")
    GPIO.cleanup()
