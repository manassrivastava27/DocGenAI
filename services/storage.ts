import { Project, User, DocType, Section, SectionStatus } from '../types';
import { db, auth, isConfigValid } from './firebase';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where
} from 'firebase/firestore';
import * as firebaseAuth from 'firebase/auth';
import { v4 as uuidv4 } from 'uuid';

// Fix for "Module has no exported member" errors
const signInAnonymously = (firebaseAuth as any).signInAnonymously;

const STORAGE_KEY_USER_ID = 'docgen_user_id';

// Helper: Ensure we have at least anonymous auth for Firestore rules
const ensureAuth = async () => {
  if (!isConfigValid()) return;
  
  // If already authenticated, we are good.
  if (auth.currentUser) return;

  try {
    await signInAnonymously(auth);
  } catch (error: any) {
    console.error("Failed to sign in anonymously to Firebase:", error);
    
    // Check for specific configuration errors
    if (
      error.code === 'auth/configuration-not-found' || 
      error.code === 'auth/operation-not-allowed' ||
      error.code === 'auth/admin-restricted-operation'
    ) {
      throw new Error("Authentication is not enabled. Please go to Firebase Console > Authentication > Sign-in method and enable 'Anonymous'. Also check Google Cloud Console API Key restrictions (ensure Identity Toolkit API is allowed).");
    }
    
    // For other errors (network, etc.), rethrow so the UI can show them
    throw new Error(`Authentication failed: ${error.message}`);
  }
};

// Helper: Convert Firestore timestamp to number
const convertDates = (data: any): any => {
  if (!data) return data;
  return {
    ...data,
    createdAt: data.createdAt?.seconds ? data.createdAt.seconds * 1000 : Date.now(),
    updatedAt: data.updatedAt?.seconds ? data.updatedAt.seconds * 1000 : Date.now(),
  };
};

export const getUser = async (): Promise<User | null> => {
  const userId = localStorage.getItem(STORAGE_KEY_USER_ID);
  if (!userId) return null;

  // Fail fast if config is invalid
  if (!isConfigValid()) {
    console.warn("Firebase config missing. Logging out user.");
    return null;
  }

  try {
    await ensureAuth();
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists()) {
      const data = userDoc.data();
      // Don't expose password
      const { password, ...user } = data as any;
      return user as User;
    }
  } catch (error) {
    console.error("Error fetching user:", error);
    // If auth fails here, we might want to logout locally to force a re-login attempt
    if (userId) localStorage.removeItem(STORAGE_KEY_USER_ID);
  }
  return null;
};

export const loginUser = async (email: string, password: string): Promise<User> => {
  if (!isConfigValid()) {
    throw new Error("Firebase is not configured. Please update services/firebase.ts with your API keys.");
  }

  // Normalize email to lowercase to avoid case sensitivity issues
  const cleanEmail = email.trim().toLowerCase();
  const cleanPassword = password.trim();

  // 1. Ensure Auth (Will throw clear error if Anon Auth is disabled)
  await ensureAuth();

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("email", "==", cleanEmail));
    
    const querySnapshot = await getDocs(q);

    if (querySnapshot.empty) {
      throw new Error("No account found with this email. Please Sign Up first.");
    }

    const userData = querySnapshot.docs[0].data();
    
    // Password Check - Strict enforcement
    // We check specifically for the 'password' field in the document
    if (!userData.password || userData.password !== cleanPassword) {
      throw new Error("Invalid password.");
    }

    // Return user without password
    const { password: _, ...user } = userData as any;
    
    // Persist session locally
    localStorage.setItem(STORAGE_KEY_USER_ID, user.id);
    return user as User;
  } catch (error: any) {
    console.error("Login error:", error);
    if (error.code === 'permission-denied') {
      throw new Error("Database permission denied. Please check your Firestore Rules in the Firebase Console and ensure they allow authenticated users.");
    }
    if (error.code === 'unavailable') {
        throw new Error("Network Error: Could not connect to Firebase. Please check your internet connection.");
    }
    throw error;
  }
};

export const registerUser = async (email: string, name: string, password: string): Promise<User> => {
  if (!isConfigValid()) {
    throw new Error("Firebase is not configured.");
  }

  // Normalize email to lowercase
  const cleanEmail = email.trim().toLowerCase();
  const cleanName = name.trim();
  const cleanPassword = password.trim();

  if (!cleanPassword || cleanPassword.length < 6) {
    throw new Error("Password must be at least 6 characters long.");
  }

  // 1. Ensure Auth
  await ensureAuth();

  try {
    const usersRef = collection(db, 'users');
    const q = query(usersRef, where("email", "==", cleanEmail));
    
    // Check if already exists
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      throw new Error("Account already exists with this email. Please sign in.");
    }

    // Create new user
    const newUserId = uuidv4();
    
    // Explicit payload definition to ensure password is strictly included
    const userPayload = {
      id: newUserId,
      name: cleanName || cleanEmail.split('@')[0],
      email: cleanEmail,
      password: cleanPassword, // EXPLICITLY STORE PASSWORD
      createdAt: new Date(), // Add timestamp
      updatedAt: new Date()
    };

    await setDoc(doc(db, 'users', newUserId), userPayload);

    // Return safe user object (exclude password from return value only)
    const { password: _, ...user } = userPayload;

    // Persist session locally
    localStorage.setItem(STORAGE_KEY_USER_ID, user.id);
    return user;
  } catch (error: any) {
    console.error("Registration error:", error);
    if (error.code === 'permission-denied') {
      throw new Error("Database permission denied. Please check your Firestore Rules in the Firebase Console and ensure they allow authenticated users.");
    }
    if (error.code === 'unavailable') {
        throw new Error("Network Error: Could not connect to Firebase. Please check your internet connection.");
    }
    throw error;
  }
};

export const logoutUser = () => {
  localStorage.removeItem(STORAGE_KEY_USER_ID);
  // We could also signOut(auth) here, but keeping the anon session active is usually fine/better for UX
};

export const getProjects = async (): Promise<Project[]> => {
  const userId = localStorage.getItem(STORAGE_KEY_USER_ID);
  if (!userId) return [];
  if (!isConfigValid()) return [];

  try {
    await ensureAuth();
    const q = query(collection(db, 'projects'), where("userId", "==", userId));
    const querySnapshot = await getDocs(q);
    
    return querySnapshot.docs.map(doc => ({
      ...convertDates(doc.data()),
      id: doc.id // Ensure ID matches doc ID
    })) as Project[];
  } catch (error) {
    console.error("Error fetching projects:", error);
    return [];
  }
};

export const getProjectById = async (id: string): Promise<Project | undefined> => {
  if (!isConfigValid()) return undefined;
  
  try {
    await ensureAuth();
    const projectDoc = await getDoc(doc(db, 'projects', id));
    if (projectDoc.exists()) {
      return {
        ...convertDates(projectDoc.data()),
        id: projectDoc.id
      } as Project;
    }
  } catch (error) {
    console.error("Error fetching project:", error);
  }
  return undefined;
};

export const createProject = async (name: string, topic: string, type: DocType, outline: string[]): Promise<Project> => {
  const userId = localStorage.getItem(STORAGE_KEY_USER_ID);
  if (!userId) throw new Error("User not authenticated");
  if (!isConfigValid()) throw new Error("Firebase not configured");

  await ensureAuth();

  const sections: Section[] = outline.map(title => ({
    id: uuidv4(),
    title,
    content: '',
    status: SectionStatus.PENDING,
    feedback: null,
    comments: []
  }));

  const projectId = uuidv4();
  
  const newProject: Project & { userId: string } = {
    id: projectId,
    userId, 
    name,
    topic,
    type,
    createdAt: Date.now(),
    updatedAt: Date.now(),
    sections
  };

  await setDoc(doc(db, 'projects', projectId), newProject);
  return newProject;
};

export const updateProject = async (updatedProject: Project) => {
  if (!isConfigValid()) return;
  
  try {
    await ensureAuth();
    const projectRef = doc(db, 'projects', updatedProject.id);
    await updateDoc(projectRef, {
      ...updatedProject,
      updatedAt: Date.now()
    });
  } catch (error) {
    console.error("Error updating project:", error);
  }
};

export const deleteProject = async (id: string) => {
  if (!isConfigValid()) return;

  try {
    await ensureAuth();
    await deleteDoc(doc(db, 'projects', id));
  } catch (error) {
    console.error("Error deleting project:", error);
  }
};