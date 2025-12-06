
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
Audio response: "The image depicts a large group of people gathered outdoors on a grassy field. There are at least 15 individuals spread across the scene, some sitting and others standing or walking around. A few bicycles can be seen among them as well. The atmosphere appears to be relaxed and social, with everyone enjoying their time together in the park."

### Sample Input (Image)
![Sample Input Image](images/2.png)

### Sample Output (LLM Response)
Audio response: "In the image, a construction worker wearing an orange hard hat and safety vest stands next to a stop sign on a street. The worker holds up a 'Stop' sign above his head as if directing traffic or signaling for caution. Behind him, there are several orange cones placed around the area, likely indicating ongoing work or road closures nearby.

In addition to the construction worker, there is also another person visible in the background who appears to be observing the scene. A truck can be seen parked further back on the street, possibly involved in the construction project as well."

### Sample Input (Image)
![Sample Input Image](images/3.png)

### Sample Output (LLM Response)
Audio response: "The image captures a busy city street scene with numerous people walking and crossing the street. A woman wearing a white jacket can be seen carrying a blue backpack, while another person has a handbag. There are also several individuals holding umbrellas, possibly indicating recent rain or drizzle. The street is filled with cars parked along the side of the road, as well as other pedestrians walking in various directions.

The scene takes place on a sidewalk next to a crosswalk where people are crossing the street and going about their day."

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
