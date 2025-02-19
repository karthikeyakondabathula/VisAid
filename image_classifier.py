import ollama
import easyocr

# Initialize Ollama & EasyOCR once
class ImageClassifier:
    def __init__(self):
        self.reader = easyocr.Reader(["en"])
        self.ollama_model = "llava"
        self.categories = {
            'A': "Poster/Document",
            'B': "QR Code",
            'C': "QR Code in Poster/Document",
            'D': "General Surrounding View"
        }

    def classify_image(self, image_path):
        """Classifies an image into A, B, C, or D using LLaVA"""
        prompt = """
        Analyze this image and classify it into one of the following categories:

        A. Poster/Document (Contains printed text, flyers, notices, or articles)
        B. QR Code (Standalone QR code)
        C. QR Code in Poster/Document (A document/poster that also contains a QR code)
        D. General Surrounding View (Natural scenery, rooms, streets, etc.)

        Respond with only the category letter: A, B, C, or D.
        """

        response = ollama.generate(
            model=self.ollama_model,
            prompt=prompt,
            images=[open(image_path, "rb").read()],
        )

        category = response["response"].strip()
        return category, self.categories.get(category, "Unknown Category")
