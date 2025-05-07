
# Vision Aid

Vision Aid is an intelligent mobile application designed to assist visually impaired individuals by leveraging AI and computer vision technologies. The app captures an image, sends it to a backend powered by a Large Language Model (LLM), and provides relevant information via audio feedback. The project aims to make everyday tasks more accessible by offering real-time assistance through a smartphone.

## Features
- **Image Capture**: Capture images through the app with a single tap.
- **AI-Powered Feedback**: The app processes the image using a Python backend and provides detailed audio feedback.
- **Multimodal Interaction**: Combines vision (image recognition) and auditory output to assist visually impaired users.

## Tech Stack
- **Frontend**: React Native, Expo Router
- **Backend**: Python, LLM (LLaVA or similar models)
- **Communication**: Ngrok (for backend hosting)
- **Text-to-Speech (TTS)**: Built-in TTS functionality in the app

## Setup Instructions

### Prerequisites
1. **Node.js** and **npm**: Install [Node.js](https://nodejs.org/) (npm will be installed automatically).
2. **React Native**: Follow the [React Native Environment Setup](https://reactnative.dev/docs/environment-setup) guide for your system.
3. **Python**: Make sure Python 3.x is installed.
4. **Ngrok**: Download and set up [Ngrok](https://ngrok.com/) for backend hosting.

### Installation

1. **Clone the repository**:
   ```bash
   git clone https://github.com/karthikeyakondabathula/VisAid.git
   cd VisAid
   ```

2. **Install dependencies**:
   - Frontend:
     ```bash
     npm install
     ```
   - Backend (Python):
     ```bash
     pip install -r requirements.txt
     ```

3. **Run the backend**:
   - Start the Python backend with Ngrok:
     ```bash
     ngrok http 5000
     ```
   - This will provide a public URL that the frontend will use to communicate with the backend.

4. **Run the app**:
   - Start the React Native app in development mode:
     ```bash
     npm start
     ```

   - Scan the QR code with the Expo Go app to run on your mobile device.

## Sample Input & Output

### Sample Input (Image)
![Sample Input Image](images/1.png)

### Sample Output (LLM Response)
Audio response: "This image contains a plate of fruits including an apple, a banana, and grapes."

## Contributing
We welcome contributions! If you would like to contribute to the project, please fork the repository and submit a pull request.

### Steps:
1. Fork the repository.
2. Create a new branch (`git checkout -b feature-branch`).
3. Make your changes.
4. Commit your changes (`git commit -am 'Add feature'`).
5. Push to the branch (`git push origin feature-branch`).
6. Submit a pull request.

## License
This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
