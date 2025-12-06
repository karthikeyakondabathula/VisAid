from image_classifier import ImageClassifier

# Initialize once
classifier = ImageClassifier()

# Example: Classify an image
image_path = "sampleimages/posterpurple.jpg"  # Replace with actual image
category, description = classifier.classify_image(image_path)

print(f"🔹 Image Classification: {category} - {description}")

# Example: Classify an image
image_path = "sampleimages/posterpurple.jpg"  # Replace with actual image
category, description = classifier.classify_image(image_path)

print(f"🔹 Image-Classification: {category} - {description}")
