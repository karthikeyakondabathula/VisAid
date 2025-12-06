import React, {useState, useEffect} from 'react';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Modal,
  Alert,
  Platform,
  TextInput,
} from 'react-native';
import {SafeAreaProvider, SafeAreaView} from 'react-native-safe-area-context';
import {CameraView, useCameraPermissions} from 'expo-camera';
import {useAudioPlayer, useAudioRecorder} from 'expo-audio';
import * as Speech from 'expo-speech';
import {MaterialIcons} from '@expo/vector-icons';

const App = () => {
  const [isRecordingA, setIsRecordingA] = useState(false);
  const [isRecordingB, setIsRecordingB] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [response, setResponse] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showTextInput, setShowTextInput] = useState(false);
  const [showApiKeyModal, setShowApiKeyModal] = useState(false);
  const [inputText, setInputText] = useState('');
  const [newApiKey, setNewApiKey] = useState('');
  const [currentInputType, setCurrentInputType] = useState('');
  const [capturedImage, setCapturedImage] = useState(null);
  const [recognizedText, setRecognizedText] = useState('');
  const [cameraRef, setCameraRef] = useState(null);
  const [lastClickedImage, setLastClickedImage] = useState(null);
  const [chatHistory, setChatHistory] = useState([]);
  
  // Camera permissions
  const [permission, requestPermission] = useCameraPermissions();

    // Gemini API Configuration
  const [geminiApiKey, setGeminiApiKey] = useState('AIzaSyD1lcwujirnKy2r1cQ2JoIDhKrlP1zdAXc');
  const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent';
  const GEMINI_FILES_API_URL = 'https://generativelanguage.googleapis.com/upload/v1beta/files';

  useEffect(() => {
    if (permission && !permission.granted) {
      requestPermission();
    }
  }, []);

  const takePhoto = async () => {
    if (cameraRef) {
      try {
        const photo = await cameraRef.takePictureAsync({
          base64: true,
          quality: 0.7
        });
        setCapturedImage(photo);
        console.log('Photo captured');
      } catch (error) {
        console.error('Photo capture error:', error);
      }
    }
  };

  const uploadToGeminiFiles = async (imageData) => {
    try {
      console.log('📤 UPLOADING IMAGE TO GEMINI FILES API...');
      console.log('🔑 API Key:', geminiApiKey ? 'Present' : 'Missing');
      console.log('📦 Image data length:', imageData.base64?.length || 0);

      // Convert base64 to binary data
      const binaryString = atob(imageData.base64);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }
      
      console.log('🚀 UPLOADING TO GEMINI FILES API...');
      
      // Create the multipart body manually
      const boundary = `----formdata-react-native-${Date.now()}`;
      const fileName = `visionaid_${Date.now()}.jpg`;
      
      // Create metadata part
      const metadata = JSON.stringify({
        file: {
          display_name: fileName
        }
      });
      
      // Build multipart body
      let body = '';
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="metadata"\r\n`;
      body += `Content-Type: application/json\r\n\r\n`;
      body += `${metadata}\r\n`;
      body += `--${boundary}\r\n`;
      body += `Content-Disposition: form-data; name="file"; filename="${fileName}"\r\n`;
      body += `Content-Type: image/jpeg\r\n\r\n`;
      
      // Convert to Uint8Array and append image data
      const encoder = new TextEncoder();
      const bodyPrefix = encoder.encode(body);
      const bodySuffix = encoder.encode(`\r\n--${boundary}--\r\n`);
      
      const totalLength = bodyPrefix.length + bytes.length + bodySuffix.length;
      const finalBody = new Uint8Array(totalLength);
      finalBody.set(bodyPrefix, 0);
      finalBody.set(bytes, bodyPrefix.length);
      finalBody.set(bodySuffix, bodyPrefix.length + bytes.length);
      
      // Upload file to Gemini Files API
      const response = await fetch(`${GEMINI_FILES_API_URL}?key=${geminiApiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': `multipart/form-data; boundary=${boundary}`,
        },
        body: finalBody
      });
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ HTTP ERROR:', response.status, errorText);
        throw new Error(`Gemini Files API error: ${response.status} - ${errorText}`);
      }
      
      const result = await response.json();
      console.log('✅ GEMINI FILES UPLOAD SUCCESSFUL');
      console.log('🔗 FILE URI:', result.file?.uri);
      console.log('🆔 FILE NAME:', result.file?.name);
      
      return {
        ...imageData,
        googleUri: result.file?.uri,
        geminiFileId: result.file?.name,
        mimeType: result.file?.mimeType || 'image/jpeg',
        uploadMethod: 'gemini_files'
      };
      
    } catch (error) {
      console.error('❌ GEMINI FILES UPLOAD ERROR:', error);
      throw error;
    }
  };

  const startRecording = async () => {
    try {
      console.log('Recording started - simulated');
      // For demo purposes, we're simulating recording
      // In a real app, you'd implement actual audio recording
    } catch (error) {
      console.error('Recording start error:', error);
    }
  };

  const stopRecording = async () => {
    try {
      // For demo purposes, simulate speech recognition
      // In a real app, you'd use a speech-to-text service
      const mockText = "This is a simulated speech recognition result";
      setRecognizedText(mockText);
      
      console.log('Recording stopped - simulated');
      return mockText;
    } catch (error) {
      console.error('Recording stop error:', error);
      return '';
    }
  };

  const openTextInput = (type) => {
    setCurrentInputType(type);
    setInputText('');
    setShowTextInput(true);
  };

  const handleTextSubmit = async () => {
    if (inputText.trim()) {
      setShowTextInput(false);
      
      if (currentInputType === 'querywithimg') {
        await sendToAPI(capturedImage, inputText.trim(), 'querywithimg');
        setCapturedImage(null);
      } else if (currentInputType === 'queryonly') {
        await sendToAPI(null, inputText.trim(), 'queryonly');
      }
      
      setInputText('');
      setCurrentInputType('');
    }
  };

  const openApiKeyModal = () => {
    setNewApiKey(geminiApiKey);
    setShowApiKeyModal(true);
  };

  const handleApiKeySubmit = () => {
    if (newApiKey.trim()) {
      setGeminiApiKey(newApiKey.trim());
      console.log('🔑 API KEY UPDATED');
      setShowApiKeyModal(false);
      setNewApiKey('');
      
      // Show confirmation
      Alert.alert(
        'Success',
        'Gemini API key has been updated successfully!',
        [{ text: 'OK' }]
      );
    } else {
      Alert.alert(
        'Error',
        'Please enter a valid API key',
        [{ text: 'OK' }]
      );
    }
  };

  const addToChatHistory = (userInput, aiResponse) => {
    const newEntry = {
      user: userInput,
      ai: aiResponse,
      timestamp: new Date().toISOString()
    };
    
    setChatHistory(prev => {
      const updated = [...prev, newEntry];
      // Keep only last 5 turns
      return updated.slice(-5);
    });
  };

  const formatChatHistory = () => {
    if (chatHistory.length === 0) return "No previous conversation.";
    
    return chatHistory.map((entry, index) => 
      `Turn ${index + 1}:\nUser: ${entry.user}\nAI: ${entry.ai}`
    ).join('\n\n');
  };

  const sendToAPI = async (imageData, text, type) => {
    setIsProcessing(true);
    
    try {
      console.log(`🚀 SENDING TO GEMINI API - Type: ${type}`);
      console.log('💬 Text:', text);
      console.log('📸 Image:', imageData ? 'New image provided' : 'No new image');
      console.log('🖼️ Last Clicked Image:', lastClickedImage ? 'Available' : 'None');
      
      // Rate limiting check
      const now = Date.now();
      const timeSinceLastRequest = now - (global.lastApiRequest || 0);
      const minInterval = 2000; // 2 seconds between requests
      
      if (timeSinceLastRequest < minInterval) {
        const waitTime = minInterval - timeSinceLastRequest;
        console.log(`⏱️ RATE LIMITING: Waiting ${waitTime}ms before next request...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      }
      
      global.lastApiRequest = Date.now();
      
      // Base system prompt
      const systemPrompt = "You are an AI that helps blind people make their lives easier. Whatever you output will be sent to a TTS so the blind person can hear. Keep your outputs concise unless specifically asked by the user to elaborate.";
      
      // Format chat history
      const historyText = formatChatHistory();
      
      let parts = [];
      
      if (type === 'querywithimg' && imageData) {
        // Upload new image to Google GenAI first
        console.log('📤 UPLOADING NEW IMAGE TO GEMINI FILES API...');
        const uploadedImage = await uploadToGeminiFiles(imageData);
        
        // Update last clicked image
        setLastClickedImage(uploadedImage);
        console.log('📸 UPDATING LAST CLICKED IMAGE WITH GOOGLE URI');
        
        // Create prompt with new image
        const prompt = `${systemPrompt}

Chat History (past 5 turns):
${historyText}

User's current request with new image: "${text}"

Analyze the uploaded image and respond to the user's request.`;
        
        parts = [
          {
            file_data: {
              mime_type: uploadedImage.mimeType,
              file_uri: uploadedImage.googleUri
            }
          },
          {
            text: prompt
          }
        ];
        
      } else if (type === 'queryonly') {
        // Text-only request using last clicked image
        console.log('💬 TEXT ONLY REQUEST WITH LAST IMAGE...');
        
        if (lastClickedImage && lastClickedImage.googleUri) {
          const prompt = `${systemPrompt}

Chat History (past 5 turns):
${historyText}

User's current request: "${text}"

Use the previously uploaded image as context for responding to the user's request.`;
          
          parts = [
            {
              file_data: {
                mime_type: lastClickedImage.mimeType,
                file_uri: lastClickedImage.googleUri
              }
            },
            {
              text: prompt
            }
          ];
        } else {
          const prompt = `${systemPrompt}

Chat History (past 5 turns):
${historyText}

User's current request: "${text}"

Note: No image is currently available for reference.`;
          
          parts = [
            {
              text: prompt
            }
          ];
        }
      }
      
      console.log('📤 SENDING REQUEST TO GEMINI API...');
      console.log('📜 CHAT HISTORY ENTRIES:', chatHistory.length);
      
      console.log('\n🔍 ===== FINAL PROMPT BEING SENT TO GEMINI =====');
      console.log('📝 CONTENT PARTS:', parts.length);
      parts.forEach((part, index) => {
        if (part.text) {
          console.log(`📝 PART ${index + 1} (TEXT):`, part.text.substring(0, 500) + '...');
        } else if (part.file_data) {
          console.log(`📸 PART ${index + 1} (FILE):`, part.file_data.file_uri);
        }
      });
      console.log('===============================================\n');
      
      // Send request to Gemini API with retry logic
      const requestBody = {
        contents: [
          {
            parts: parts
          }
        ]
      };
      
      let response;
      let retryCount = 0;
      const maxRetries = 3;
      
      while (retryCount < maxRetries) {
        try {
          response = await fetch(`${GEMINI_API_URL}?key=${geminiApiKey}`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
          });
          
          if (response.status === 429) {
            // Rate limited - wait longer and retry
            const waitTime = Math.pow(2, retryCount) * 5000; // Exponential backoff: 5s, 10s, 20s
            console.log(`🚫 RATE LIMITED (429) - Attempt ${retryCount + 1}/${maxRetries}. Waiting ${waitTime/1000}s before retry...`);
            
            if (retryCount < maxRetries - 1) {
              await new Promise(resolve => setTimeout(resolve, waitTime));
              retryCount++;
              continue;
            }
          }
          
          break; // Success or non-retry error
          
        } catch (fetchError) {
          console.error(`❌ FETCH ERROR (Attempt ${retryCount + 1}):`, fetchError);
          if (retryCount < maxRetries - 1) {
            const waitTime = Math.pow(2, retryCount) * 2000; // 2s, 4s, 8s
            console.log(`🔄 RETRYING in ${waitTime/1000}s...`);
            await new Promise(resolve => setTimeout(resolve, waitTime));
            retryCount++;
          } else {
            throw fetchError;
          }
        }
      }
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ GEMINI API ERROR:', response.status, errorText);
        
        if (response.status === 429) {
          throw new Error('The API is currently busy. Please wait a moment and try again.');
        }
        
        throw new Error(`Gemini API error: ${response.status} - ${errorText}`);
      }
      
      const responseData = await response.json();
      console.log('✅ GEMINI RAW RESPONSE:', JSON.stringify(responseData, null, 2));
      
      const generatedText = responseData.candidates?.[0]?.content?.parts?.[0]?.text || 'No response generated';
      
      // Add to chat history
      addToChatHistory(text, generatedText);
      console.log('📚 ADDED TO CHAT HISTORY');
      
      console.log('✅ GEMINI RESPONSE:', generatedText);
      
      setResponse(generatedText);
      setShowModal(true);
      
      // Text to Speech
      Speech.speak(generatedText, {
        language: 'en-US',
        pitch: 1.0,
        rate: 0.9,
      });
      
    } catch (error) {
      console.error('API Error:', error);
      let errorResponse = 'Sorry, there was an error processing your request.';
      
      if (error.message.includes('busy') || error.message.includes('429')) {
        errorResponse = 'The AI service is currently busy. Please wait a moment before trying again.';
      }
      
      setResponse(errorResponse);
      setShowModal(true);
      Speech.speak(errorResponse);
    } finally {
      setIsProcessing(false);
    }
  };

  const handleButtonA = async () => {
    // Take photo and open text input
    await takePhoto();
    openTextInput('querywithimg');
  };

  const handleButtonB = async () => {
    // Open text input for speech-only query
    openTextInput('queryonly');
  };

  const closeModal = () => {
    setShowModal(false);
    setResponse('');
  };

  if (!permission) {
    return (
      <View style={styles.container}>
        <Text>Requesting camera permissions...</Text>
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.container}>
        <Text>Camera access is required for this app to work.</Text>
        <TouchableOpacity onPress={requestPermission} style={styles.permissionButton}>
          <Text style={styles.permissionButtonText}>Grant Permission</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        {/* Camera as full background */}
        <CameraView
          style={styles.backgroundCamera}
          facing="back"
          ref={ref => setCameraRef(ref)}
        />
        
        {/* Overlay content */}
        <View style={styles.overlayContent}>
          {/* Settings button in top right corner */}
          <TouchableOpacity 
            style={styles.settingsButton}
            onPress={openApiKeyModal}
          >
            <MaterialIcons name="settings" size={24} color="white" />
          </TouchableOpacity>

          <Text style={styles.title}>VisionAid</Text>
          
          <View style={styles.buttonContainer}>
            {/* Button A: Image + Speech */}
            <TouchableOpacity
              style={[styles.button, styles.buttonA]}
              onPress={handleButtonA}
              disabled={isProcessing}
            >
              <MaterialIcons
                name="photo-camera"
                size={40}
                color="white"
              />
              <Text style={styles.buttonText}>
                Image + Text Query
              </Text>
            </TouchableOpacity>

            {/* Button B: Speech Only */}
            <TouchableOpacity
              style={[
                styles.button,
                styles.buttonB,
                {backgroundColor: '#4CAF50'}
              ]}
              onPress={handleButtonB}
              disabled={isProcessing}
            >
              <MaterialIcons
                name="keyboard"
                size={40}
                color="white"
              />
              <Text style={styles.buttonText}>
                Text Query Only
              </Text>
            </TouchableOpacity>
          </View>

          {/* Processing Indicator */}
          {isProcessing && (
            <View style={styles.processingContainer}>
              <MaterialIcons name="refresh" size={30} color="#2196F3" />
              <Text style={styles.processingText}>Processing...</Text>
            </View>
          )}

          {/* Status Text */}
          {(isRecordingA || isRecordingB) && (
            <Text style={styles.statusText}>
              {isRecordingA ? 'Recording audio and ready for photo...' : 'Recording audio...'}
            </Text>
          )}
        </View>

      {/* API Key Modal */}
      <Modal
        visible={showApiKeyModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowApiKeyModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.textInputModalContent}>
            <Text style={styles.textInputTitle}>
              Enter Gemini API Key
            </Text>
            <Text style={styles.apiKeyDescription}>
              Enter your Google Gemini API key to use the AI features
            </Text>
            <TextInput
              style={styles.textInput}
              value={newApiKey}
              onChangeText={setNewApiKey}
              placeholder="Enter your Gemini API key..."
              secureTextEntry={false}
              autoFocus={true}
              multiline={false}
            />
            <View style={styles.textInputButtons}>
              <TouchableOpacity 
                style={[styles.textInputButton, styles.cancelButton]} 
                onPress={() => setShowApiKeyModal(false)}
              >
                <Text style={styles.textInputButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.textInputButton, styles.submitButton]} 
                onPress={handleApiKeySubmit}
              >
                <Text style={styles.textInputButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Text Input Modal */}
      <Modal
        visible={showTextInput}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowTextInput(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.textInputModalContent}>
            <Text style={styles.textInputTitle}>
              {currentInputType === 'querywithimg' ? 'Ask about the image:' : 'Enter your query:'}
            </Text>
            <TextInput
              style={styles.textInput}
              value={inputText}
              onChangeText={setInputText}
              placeholder="Type your question here..."
              multiline={true}
              numberOfLines={4}
              autoFocus={true}
              onSubmitEditing={handleTextSubmit}
            />
            <View style={styles.textInputButtons}>
              <TouchableOpacity 
                style={[styles.textInputButton, styles.cancelButton]} 
                onPress={() => setShowTextInput(false)}
              >
                <Text style={styles.textInputButtonText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.textInputButton, styles.submitButton]} 
                onPress={handleTextSubmit}
              >
                <Text style={styles.textInputButtonText}>Send</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Response Modal */}
      <Modal
        visible={showModal}
        transparent={true}
        animationType="fade"
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.responseText}>{response}</Text>
            <TouchableOpacity style={styles.closeButton} onPress={closeModal}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundCamera: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
  },
  overlayContent: {
    ...StyleSheet.absoluteFillObject,
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.3)', // Semi-transparent overlay for better text visibility
  },
  settingsButton: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    padding: 12,
    borderRadius: 25,
    zIndex: 1000,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    color: 'white', // Changed to white for visibility on camera background
    marginBottom: 50,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
  },
  button: {
    width: 150,
    height: 150,
    borderRadius: 75,
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 20,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  buttonA: {
    backgroundColor: '#2196F3',
  },
  buttonB: {
    backgroundColor: '#4CAF50',
  },
  buttonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 5,
  },
  processingContainer: {
    alignItems: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 10,
  },
  processingText: {
    fontSize: 16,
    color: '#333',
    marginTop: 10,
  },
  statusText: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginTop: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 5,
    textShadowColor: 'rgba(0, 0, 0, 0.75)',
    textShadowOffset: {width: -1, height: 1},
    textShadowRadius: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '80%',
    maxHeight: '60%',
  },
  responseText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 20,
  },
  closeButton: {
    backgroundColor: '#2196F3',
    padding: 10,
    borderRadius: 5,
    alignItems: 'center',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  permissionButton: {
    backgroundColor: '#2196F3',
    padding: 15,
    borderRadius: 10,
    marginTop: 20,
  },
  permissionButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  textInputModalContent: {
    backgroundColor: 'white',
    padding: 20,
    marginHorizontal: 20,
    borderRadius: 10,
    maxHeight: '80%',
  },
  textInputTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  apiKeyDescription: {
    fontSize: 14,
    color: '#666',
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 20,
  },
  textInput: {
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 100,
    textAlignVertical: 'top',
    marginBottom: 20,
  },
  textInputButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  textInputButton: {
    flex: 1,
    padding: 12,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  cancelButton: {
    backgroundColor: '#ff4444',
  },
  submitButton: {
    backgroundColor: '#4CAF50',
  },
  textInputButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default App;
