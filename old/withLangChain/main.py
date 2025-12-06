import os
import base64
import cv2
import os
import base64
import mimetypes
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import LLMChain
from langchain.prompts import ChatPromptTemplate
import datetime
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.memory import ConversationBufferMemory
from langchain.chains import LLMChain
from langchain.prompts import ChatPromptTemplate
import pyttsx3
import warnings
warnings.filterwarnings("ignore", category=DeprecationWarning)


# =============== SETUP GEMINI MODEL =====================
# Model options: "gemini-1.5-flash", "gemini-1.5-pro", "gemini-2.0-flash"
llm = ChatGoogleGenerativeAI(
    model="gemini-2.0-flash",
    temperature=0.4,
    google_api_key=""
)

# =============== MEMORY FOR CONTEXT =====================
memory = ConversationBufferMemory(memory_key="chat_history", return_messages=True)

prompt = ChatPromptTemplate.from_template("""
You are VisionAid — an intelligent assistant that helps visually impaired people.
Understand surroundings using visual and contextual cues.

{chat_history}
User: {input}
AI:
""")

chain = LLMChain(llm=llm, prompt=prompt, memory=memory)


# ===== Helpers =====
def encode_image(path):
    with open(path, "rb") as f:
        return f.read()


def ask_gemini_with_image(question, image_path):
    if not os.path.exists(image_path):
        return f"⚠️ Image not found: {image_path}"

    mime_type, _ = mimetypes.guess_type(image_path)
    if not mime_type:
        mime_type = "image/jpeg"

    # Read full image bytes
    image_bytes = encode_image(image_path)

    # ✅ Send image + prompt in one shot for full reasoning
    response = llm.invoke([
        {
            "role": "user",
            "content": [
                {"type": "text", "text": f"Please carefully analyze this image and answer the question: {question}"},
                {"type": "media", "mime_type": mime_type, "data": image_bytes}
            ]
        }
    ])

    # Save **descriptive answer** in memory
    memory.chat_memory.add_user_message(f"Image: {image_path}, Q: {question}")
    memory.chat_memory.add_ai_message(response.content)

    return response.content




def capture_image_from_camera():
    cap = cv2.VideoCapture(0)
    if not cap.isOpened():
        print("⚠️ Could not open camera")
        return None
    print("📸 Capturing image, press 'SPACE' to snap, 'ESC' to cancel...")
    while True:
        ret, frame = cap.read()
        if not ret:
            print("⚠️ Failed to read from camera")
            break
        cv2.imshow("Press SPACE to capture", frame)
        key = cv2.waitKey(1)
        if key % 256 == 27:  # ESC
            print("Capture cancelled")
            cap.release()
            cv2.destroyAllWindows()
            return None
        elif key % 256 == 32:  # SPACE
            timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
            img_path = f"capture_{timestamp}.jpg"
            cv2.imwrite(img_path, frame)
            print(f"✅ Image saved: {img_path}")
            cap.release()
            cv2.destroyAllWindows()
            return img_path


# ===== CLI =====
print("\n🦻 VisionAid (Gemini + LangChain + Camera CLI) Ready!")
print("Type 'exit' to quit, 'clear' to reset memory.")
print("💡 To analyze an image: image:<path> <question>")
print("💡 To capture from camera: imgclick:<question>\n")

while True:
    # Initialize the TTS engine
    engine = pyttsx3.init()

    # Get current speaking rate (words per minute)
    rate = engine.getProperty('rate')
    engine.setProperty('rate', 170)
    engine.setProperty('voice',
                       r"HKEY_LOCAL_MACHINE\SOFTWARE\Microsoft\Speech\Voices\Tokens\TTS_MS_EN-US_ZIRA_11.0")  # change index to choose voice

    user_input = input("You: ").strip()
    if not user_input:
        continue

    if user_input.lower() == "exit":
        print("👋 Goodbye!")
        break
    elif user_input.lower() == "clear":
        memory.clear()
        print("🧹 Memory cleared!\n")
        continue

    # Handle camera capture
    if user_input.startswith("imgclick:"):
        question = user_input.replace("imgclick:", "", 1).strip()
        img_path = capture_image_from_camera()
        if img_path:
            result = ask_gemini_with_image(question, img_path)
        else:
            result = "⚠️ No image captured."

    # Handle image file
    elif user_input.startswith("image:"):
        try:
            image_path, question = user_input.split(" ", 1)
            image_path = image_path.replace("image:", "").strip()
            result = ask_gemini_with_image(question, image_path)
        except ValueError:
            print("⚠️ Use format: image:<path> <question>")
            continue

    # Normal text query
    else:
        result = chain.run(input=user_input)

    print("AI:", result, "\n")
    engine.say(result)
    engine.runAndWait()
    del engine
