# VisionAid Expo App 📱

A super simple React Native app built with Expo for easy testing with Expo Go!

## ✅ What this app does:

- **Blue Button (Image + Speech)**: Takes photo + records audio → sends to your backend API
- **Green/Red Button (Speech Only)**: Records audio → sends text to your backend API  
- **Text-to-Speech**: Reads responses out loud
- **Works on both Android and iOS**

## 🚀 Quick Start (Super Easy!)

### 1. Install Expo Go on your phone
- **Android**: Download from Google Play Store
- **iPhone**: Download from App Store

### 2. Start the app
```bash
npm start
```

### 3. Scan QR code with your phone
- **Android**: Open Expo Go app and scan QR code
- **iPhone**: Open camera app and scan QR code

That's it! The app will load on your phone instantly! 🎉

## 📱 How to use:

### Button A (Blue - Image + Speech):
1. **First tap**: Icon changes to stop, camera takes photo, starts recording
2. **Second tap**: Stops recording, sends both image and text to API

### Button B (Green/Red - Speech Only):  
1. **First tap**: Button turns red, starts recording
2. **Second tap**: Button turns green, stops recording, sends text to API

## 🔧 Setup your backend:

In `App.js`, change this line:
```javascript
const API_URL = 'https://your-backend-api.com/api';
```

### Your API should expect:
```json
{
  "type": "querywithimg" | "queryonly", 
  "text": "speech text",
  "image": "base64 string (only for querywithimg)"
}
```

### Your API should respond:
```json
{
  "response": "Text to speak back to user"
}
```

## 🎯 Benefits of Expo:

- ✅ **No Android Studio needed**
- ✅ **No Xcode needed** 
- ✅ **Test on real phone instantly**
- ✅ **Hot reload** - changes appear immediately
- ✅ **Works on both Android and iOS**

## 📝 Note:

- Currently uses **simulated speech recognition** (shows demo text)
- For real speech-to-text, you'll need to integrate a service like Google Speech API
- Camera and microphone permissions are handled automatically

## 🔧 Development commands:

```bash
npm start          # Start Expo development server
npm run android    # Run on Android emulator  
npm run ios        # Run on iOS simulator (Mac only)
npm run web        # Run in web browser
```

Perfect for testing and development without complex setup! 🚀