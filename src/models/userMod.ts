import mongoose, { Schema, Document } from 'mongoose';
import bcrypt from 'bcryptjs';

export interface IUser extends Document {
  _id: any;
  fullname: string;
  username: string;
  email: string;
  password: string | null | undefined;
  description?: string;
  profilePicture?: string;
  cvLink?: string;
  interests?: string[];
  role: string;
  googleId?: string;
  comparePassword?: (candidatePassword: string) => Promise<boolean>;
}


const userSchema = new mongoose.Schema<IUser>({
  fullname: {
    type: String,
    required: true
  },
  username: {
    type: String,
    required: true,
    unique: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: false  
  },
  description: {
    type: String,
    required: false
  },
  profilePicture: {
    type: String,
    required: false
  },
  cvLink: {
    type: String,
    required: false
  },
  interests: {
    type: [String],
    required: false
  },
  role: {  
    type: String,
    required: true,
    default: 'user' 
  },
  googleId: { 
    type: String, 
    required: false 
  }
});

userSchema.pre<IUser>('save', async function (next) {
  if (this.isModified('password') && this.password && typeof this.password === 'string') {
    try {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt); 
      next();
    } catch (error) {
      next(error);
    }
  } else {
    next();
  }
});


userSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  if (this.password) {
    return bcrypt.compare(candidatePassword, this.password);
  } else {
    throw new Error("Password is not set for this user");
  }
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;
