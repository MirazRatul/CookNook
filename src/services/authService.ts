import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import auth, { FirebaseAuthTypes } from "@react-native-firebase/auth";

// Configure Google Sign-In with the Web Client ID from google-services.json (client_type: 3)
GoogleSignin.configure({
  webClientId: "383657712113-osmsunj6qn3iclsbsbgfvtjd8bkjb1g4.apps.googleusercontent.com",
  offlineAccess: true,
});

/**
 * Maps standard Firebase Auth error codes to user-friendly messages.
 */
const getFriendlyAuthError = (error: any): string => {
  const code = error?.code || '';
  const message = error?.message || '';

  if (code) {
    switch (code) {
      case 'auth/invalid-credential':
        return 'The email or password you entered is incorrect. Please check and try again.';
      case 'auth/wrong-password':
        return 'The password you entered is incorrect. Please check and try again.';
      case 'auth/user-not-found':
        return 'No account was found matching this email address.';
      case 'auth/email-already-in-use':
        return 'This email address is already in use by another account. Please sign in instead.';
      case 'auth/invalid-email':
        return 'Please enter a valid email address.';
      case 'auth/weak-password':
        return 'Your password must be stronger. Please enter at least 6 characters.';
      case 'auth/network-request-failed':
        return 'Network error. Please check your internet connection and try again.';
      case 'auth/too-many-requests':
        return 'Too many failed login attempts. Access has been temporarily blocked. Please try again later.';
      case 'auth/user-disabled':
        return 'This user account has been disabled. Please contact support.';
      default:
        // Strip off the default '[auth/code]' prefix if present
        return message.replace(/\[auth\/.*?\]\s*/, '');
    }
  }

  return message || 'An unexpected authentication error occurred.';
};

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
    throw new Error(getFriendlyAuthError(error));
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
    throw new Error(getFriendlyAuthError(error));
  }
};

/**
 * Log out the current user (both Firebase and Google sessions)
 */
export const logOutUser = async (): Promise<void> => {
  try {
    // Sign out from Firebase
    await auth().signOut();
    
    // Sign out from Google if signed in
    if (GoogleSignin.hasPreviousSignIn()) {
      await GoogleSignin.signOut();
    }
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

/**
 * Trigger the Native Google Sign-In flow and log the user into Firebase
 */
export const signInWithGoogle = async (): Promise<FirebaseAuthTypes.User> => {
  try {
    // Check if Google Play Services are available (Android only)
    await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true });

    // Start Google authentication
    await GoogleSignin.signIn();

    // Retrieve both tokens to satisfy the JNI HostFunction requirement
    const { idToken, accessToken } = await GoogleSignin.getTokens();
    if (!idToken || !accessToken) {
      throw new Error("Missing ID Token or Access Token from Google Sign-In.");
    }

    // Authenticate with Firebase using the Google credential (both arguments required)
    const googleCredential = auth.GoogleAuthProvider.credential(idToken, accessToken);
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
      throw new Error(getFriendlyAuthError(error));
    }
  }
};
