# 🚀 Connecting Firebase Auth & Google Sign-In in Expo (SDK 56)

This guide provides a step-by-step, beginner-friendly walkthrough to integrate **Firebase Authentication (Email/Password)** and **Google Sign-In** into your Expo project.

Because we are using native Google Sign-In (which offers the best user experience on mobile), we will be using the official `@react-native-google-signin/google-signin` package. Since this package contains custom native code, you will need to create a **Development Build** instead of using standard Expo Go.

---

## 📋 Table of Contents

1. [Phase 1: Firebase Console Configuration](#phase-1-firebase-console-configuration)
2. [Phase 2: Install Dependencies](#phase-2-install-dependencies)
3. [Phase 3: Configure `app.json`](#phase-3-configure-appjson)
4. [Phase 4: Initialize Firebase & Configure Persistence](#phase-4-initialize-firebase--configure-persistence)
5. [Phase 5: Implement Email/Password Sign-Up & Login](#phase-5-implement-emailpassword-sign-up--login)
6. [Phase 6: Implement Google Sign-In](#phase-6-implement-google-sign-in)
7. [Phase 7: Build and Run the App](#phase-7-build-and-run-the-app)
8. [⚠️ Troubleshooting & Common Pitfalls](#-troubleshooting--common-pitfalls)

---

## Phase 1: Firebase Console Configuration

Before writing code, you need to configure your backend in the [Firebase Console](https://console.firebase.google.com/).

### 1. Create a Firebase Project

1. Click **Add project** and follow the prompts.
2. Choose whether to enable Google Analytics (optional) and click **Create project**.

### 2. Enable Authentication Providers

1. In the left sidebar, click on **Build** > **Authentication**.
2. Click **Get Started**.
3. Under the **Sign-in method** tab:
   - **Email/Password**: Click it, toggle **Enable**, and click **Save**.
   - **Google**: Click it, toggle **Enable**, select a support email, and click **Save**.

### 3. Register your iOS & Android Apps

To enable Google Sign-In on mobile platforms, you must add both Android and iOS applications to your Firebase project.

#### A. Add Android App

1. On the Firebase Project Overview page, click the **Android** icon (or click **Add app** > **Android**).
2. **Android package name**: Enter your package name. You can find or configure this in your `app.json` under `expo.android.package` (e.g. `com.yourname.cooknook`).
3. **App nickname**: Optional (e.g. `CookNook Android`).
4. **Debug signing certificate SHA-1**: **(CRITICAL FOR GOOGLE SIGN-IN)**
   - In your local terminal, run the following command to get your debug SHA-1 key:
     ```bash
     keytool -list -v -keystore ~/.android/debug.keystore -alias androiddebugkey -storepass android -keypass android
     ```
   - Locate the line starting with `SHA1:` and copy the hexadecimal code (40 characters separated by colons).
   - Paste it into the Firebase field.
   - _Note: When deploying to production later, you will also need to add your Google Play Console / EAS signing SHA-1 fingerprint here._
5. Click **Register app**.
6. Download the `google-services.json` file and place it in the **root directory** of your Expo project.

#### B. Add iOS App

1. On your project homepage, click **Add app** and select **iOS**.
2. **Apple bundle ID**: Enter your bundle identifier. You can find or configure this in your `app.json` under `expo.ios.bundleIdentifier` (e.g. `com.yourname.cooknook`).
3. Click **Register app**.
4. Download the `GoogleService-Info.plist` file and place it in the **root directory** of your Expo project.

---

## Phase 2: Install Dependencies

Expo SDK 56 matches specific packages. Use `npx expo install` to ensure you download compatible versions.

Open your terminal and run:

```bash
npx expo install @react-native-google-signin/google-signin firebase @react-native-firebase/app @react-native-firebase/auth
```

> [!NOTE]
> Since React Native requires persistent state across app restarts, ensure you have `@react-native-async-storage/async-storage` installed. If it isn't in your `package.json` already, install it with:
> `npx expo install @react-native-async-storage/async-storage`

---

## Phase 3: Configure `app.json`

Because Google Sign-In requires native configurations and resources, we need to register the config files and plugins in your `app.json`.

1. Open `app.json` at the root of your project.
2. Configure `android.googleServicesFile`, `ios.googleServicesFile`, and register the `@react-native-google-signin/google-signin` plugin:

```json
{
  "expo": {
    "name": "CookNook",
    "slug": "CookNook",
    "version": "1.0.0",
    "ios": {
      "bundleIdentifier": "com.yourname.cooknook",
      "googleServicesFile": "./GoogleService-Info.plist",
      "supportsTablet": true
    },
    "android": {
      "package": "com.yourname.cooknook",
      "googleServicesFile": "./google-services.json",
      "adaptiveIcon": {
        "backgroundColor": "#E6F4FE",
        "foregroundImage": "./assets/android-icon-foreground.png"
      }
    },
    "plugins": [
      "expo-splash-screen",
      [
        "@react-native-google-signin/google-signin",
        {
          "iosUrlScheme": "com.googleusercontent.apps.YOUR_REVERSED_CLIENT_ID"
        }
      ]
    ]
  }
}
```

### 🔍 How to find `iosUrlScheme` (Reversed Client ID):

1. Open the downloaded `GoogleService-Info.plist` file in your root folder.
2. Search for the key `<key>REVERSED_CLIENT_ID</key>`.
3. Copy the `<string>` value directly below it (it will look like `com.googleusercontent.apps.1234567890-abcdef...`).
4. Replace `YOUR_REVERSED_CLIENT_ID` in `app.json` with this string. This configuration allows iOS to redirect the user back to your app after Google authentication completes.

---

## Phase 4: Initialize Firebase Auth (Native)

Unlike the Firebase Web SDK, **React Native Firebase does not require configuration keys in your Javascript code.** The SDK automatically detects and parses the credentials compiled directly from your native configuration files (`google-services.json` and `GoogleService-Info.plist`).

Also, React Native Firebase handles user session persistence natively out of the box. You **do not** need to configure `AsyncStorage` or manual persistence.

Create a new file named `firebase.ts` under your service directory (e.g., `src/services/firebase.ts`):

```typescript
import auth from "@react-native-firebase/auth";

// React Native Firebase automatically configures itself using the compiled-in
// google-services.json (Android) and GoogleService-Info.plist (iOS).
// No config object or apiKey is needed in the code!

export { auth };
```

---

## Phase 5: Implement Email/Password Sign-Up & Login

Now we'll create the helper logic to sign up new users, log them in, log out, and check if a user is currently signed in.

Create an auth service file: `src/services/authService.ts`

```typescript
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";

/**
 * Register a new user using email & password, send verification email, and sign out
 */
export const signUpWithEmail = async (
  email: string,
  password: string,
): Promise<void> => {
  try {
    const userCredential = await auth().createUserWithEmailAndPassword(
      email,
      password,
    );
    if (userCredential.user) {
      await userCredential.user.sendEmailVerification();
      await auth().signOut();
    }
  } catch (error: any) {
    console.error("Sign up error: ", error.message);
    throw new Error(error.message || "Failed to register account.");
  }
};

/**
 * Log in an existing user and block if their email is not verified
 */
export const logInWithEmail = async (
  email: string,
  password: string,
): Promise<FirebaseAuthTypes.User> => {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(
      email,
      password,
    );
    const user = userCredential.user;
    if (user && !user.emailVerified) {
      // Re-send verification link
      await user.sendEmailVerification();
      // Sign out immediately so session is clean
      await auth().signOut();
      throw new Error("verification-pending");
    }
    return user;
  } catch (error: any) {
    console.error("Login error: ", error.message);
    if (error.message === "verification-pending") {
      throw new Error("Verification pending. A verification link has been sent to your email. Please verify your email before signing in.");
    }
    throw new Error(error.message || "Failed to log in.");
  }
};

/**
 * Log out the current user
 */
export const logOutUser = async (): Promise<void> => {
  try {
    await auth().signOut();
  } catch (error: any) {
    console.error("Sign out error: ", error.message);
    throw new Error(error.message || "Failed to sign out.");
  }
};

/**
 * Listen to Authentication State changes
 * Add this in your App.tsx / Navigation Router to detect if a user is logged in.
 */
export const subscribeToAuthChanges = (
  callback: (user: FirebaseAuthTypes.User | null) => void,
) => {
  return auth().onAuthStateChanged((user) => {
    callback(user);
  });
};
```

---

## Phase 6: Implement Google Sign-In

For Google Sign-In, we obtain an `idToken` from the native Google Sign-In SDK, and then exchange it for a Firebase credential.

### 1. Get your Web Client ID

Even on iOS and Android, Firebase requires you to supply a **Web Client ID** to verify the user identity on the backend.

- Open `google-services.json` in your project.
- Search for `"client_type": 3`.
- Find the corresponding `"client_id"` (it usually ends in `.apps.googleusercontent.com`). Copy it.

### 2. Implement Google Sign-In Logic

Add this logic to `src/services/authService.ts` or create a new file:

```typescript
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";

// Configure Google Sign-In
// Ensure this runs once in your app lifecycle (e.g. in your root component or here)
GoogleSignin.configure({
  // Web Client ID is retrieved from your google-services.json (client_type: 3)
  webClientId: "YOUR_WEB_CLIENT_ID.apps.googleusercontent.com",
  offlineAccess: true, // If you need to access Google APIs on behalf of the user when offline
});

/**
 * Trigger the Native Google Sign-In flow and log the user into Firebase
 */
export const signInWithGoogle = async (): Promise<FirebaseAuthTypes.User> => {
  try {
    // Check if Google Play Services are available (Android only)
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Start Google authentication
    const response = await GoogleSignin.signIn();

    // Retrieve the idToken
    const idToken = response.data?.idToken;
    if (!idToken) {
      throw new Error("No ID Token returned from Google Sign-In.");
    }

    // Authenticate with Firebase using the Google credential
    const googleCredential = auth.GoogleAuthProvider.credential(idToken);
    const userCredential = await auth().signInWithCredential(googleCredential);
    return userCredential.user;
  } catch (error: any) {
    if (error.code === statusCodes.SIGN_IN_CANCELLED) {
      console.log("User cancelled the login flow");
      throw new Error("Sign-in cancelled by user.");
    } else if (error.code === statusCodes.IN_PROGRESS) {
      console.log("Sign-in operation is already in progress");
      throw new Error("Authentication is already in progress.");
    } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
      console.log("Play services not available or outdated");
      throw new Error("Google Play Services are not available on this device.");
    } else {
      console.error("Google Sign-In Error: ", error);
      throw new Error(
        error.message || "An unexpected error occurred during Google Sign-In.",
      );
    }
  }
};
```

---

## Phase 7: Build and Run the App

Because `@react-native-google-signin/google-signin` uses native code, **it will not run in standard Expo Go**. You must build a **development build** (custom client) or use a Simulator.

### Option A: Local Development Build (Fastest for local testing)

Ensure you have CocoaPods installed (for iOS) and Android Studio configurations ready.

1. **Prebuild the native folders**:

   ```bash
   npx expo prebuild
   ```

   _This command generates the `/android` and `/ios` native directories containing the configs from `app.json`._

2. **Run on iOS Simulator**:

   ```bash
   npx expo run:ios
   ```

3. **Run on Android Device/Emulator**:
   ```bash
   npx expo run:android
   ```

### Option B: Cloud Build using EAS (Recommended for testing on physical devices)

If you don't have a Mac to run iOS builds locally, you can use EAS CLI to build in the cloud.

1. Install EAS CLI globally if you haven't:
   ```bash
   npm install -g eas-cli
   ```
2. Log in to your Expo account:
   ```bash
   eas login
   ```
3. Initialize configuration:
   ```bash
   eas build:configure
   ```
4. Build a development build:
   ```bash
   eas build --profile development --platform all
   ```
5. Install the generated `.apk` (Android) or `.ipa` (iOS) onto your test device and run `npx expo start` to connect the bundler.

---

## ⚠️ Troubleshooting & Common Pitfalls

### 1. `DEVELOPER_ERROR` during Google Sign-In (Android)

This is the most common error. It occurs when Google/Firebase rejects your authentication request. Check the following:

- **Mismatching SHA-1 Fingerprint**: Make sure the SHA-1 fingerprint you copied in [Phase 1](#phase-1-firebase-console-configuration) matches the signing key of your running app.
  - In development, EAS or your local machine signs your app. Run `eas credentials` or look at your local keystore fingerprint to ensure it is added to Firebase Project Settings.
- **Incorrect Web Client ID**: Double-check that your `webClientId` is the Web Client ID (client type 3) from your `google-services.json` and NOT the Android Client ID.

### 2. iOS Crash on Redirect

If your app crashes immediately after signing in with Google:

- Ensure `iosUrlScheme` in `app.json` exactly matches the `REVERSED_CLIENT_ID` found inside `GoogleService-Info.plist`.
- Ensure you ran `npx expo prebuild` and rebuilt your binary files after changing `app.json`.

### 3. "getReactNativePersistence is not a function"

- This occurs when the bundler imports Firebase Auth incorrectly. Make sure your import matches:
  ```typescript
  import { initializeAuth, getReactNativePersistence } from "firebase/auth";
  ```
  And make sure you pass `AsyncStorage` from `@react-native-async-storage/async-storage` as the persistence parameter inside `initializeAuth`. Do not use `getAuth()` if you want persistence to work in React Native.
