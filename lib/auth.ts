import { jwtDecode } from "jwt-decode";
import { connect } from '@/lib/mongodb'
import { User } from '@/models/User'

export type GoogleUser = {
  email: string;
  name: string;
  picture: string;
  sub: string; // Google's unique identifier
}

export async function verifyGoogleToken(token: string) {
  try {
    const decoded = jwtDecode<GoogleUser>(token);
    
    // Connect to MongoDB
    await connect();
    
    // Check if user exists
    let user = await User.findOne({ googleId: decoded.sub });

    if (!user) {
      // Create new user
      user = await User.create({
        googleId: decoded.sub,
        email: decoded.email,
        name: decoded.name,
        avatarUrl: decoded.picture
      });
    }

    return user;
  } catch (error) {
    console.error('Token verification failed:', error);
    throw error;
  }
} 