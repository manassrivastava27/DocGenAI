
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { loginUser, registerUser } from '../services/storage';
import { User } from '../types';
import { FileText, AlertCircle, Loader2, Linkedin, User as UserIcon, Mail, Lock, Eye, EyeOff } from 'lucide-react';

interface LoginProps {
  setUser: (user: User) => void;
}

// Google Logo Component
const GoogleLogo = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} xmlns="http://www.w3.org/2000/svg">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

// Custom Validation Tooltip (Light Theme)
const ValidationTooltip = ({ message }: { message: string }) => (
  <div className="absolute bottom-full left-0 mb-2.5 w-auto min-w-[140px] z-20 animate-in fade-in slide-in-from-bottom-2 duration-200 pointer-events-none">
    <div className="bg-white text-red-600 text-[11px] font-bold rounded-md py-2 px-3 shadow-xl shadow-red-500/10 flex items-center gap-2 relative border border-red-100">
      <AlertCircle className="w-3.5 h-3.5 text-red-500 fill-red-50" />
      {message}
      <div className="w-2 h-2 bg-white border-r border-b border-red-100 absolute -bottom-[5px] left-4 rotate-45"></div>
    </div>
  </div>
);

// Reusable Input Component with Validation
interface InputGroupProps {
  icon: any;
  type: string;
  placeholder: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  toggleIcon?: React.ReactNode;
}

const InputGroup = ({ icon: Icon, type, placeholder, value, onChange, error, toggleIcon }: InputGroupProps) => (
  <div className="relative w-full">
    {error && <ValidationTooltip message={error} />}
    <div className={`bg-slate-100 rounded-lg px-4 py-3 flex items-center transition-all duration-200 border border-transparent ${error ? 'ring-1 ring-red-500 bg-red-50/30' : 'focus-within:ring-2 focus-within:ring-blue-100 focus-within:bg-white focus-within:border-blue-200'}`}>
       <Icon className={`w-4 h-4 mr-3 flex-shrink-0 transition-colors ${error ? 'text-red-400' : 'text-slate-400'}`} />
       <input 
          type={type} 
          placeholder={placeholder} 
          className="bg-transparent border-none outline-none text-sm w-full placeholder:text-slate-400 text-slate-700"
          value={value}
          onChange={onChange}
       />
       {toggleIcon}
    </div>
  </div>
);

export const Login: React.FC<LoginProps> = ({ setUser }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  
  // Form States
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  const navigate = useNavigate();

  const validateForm = (type: 'signin' | 'signup') => {
    const errors: { [key: string]: string } = {};
    let isValid = true;

    if (!email.trim()) {
      errors.email = "Please fill out this field.";
      isValid = false;
    }
    
    const cleanPassword = password.trim();
    if (!cleanPassword) {
      errors.password = "Please fill out this field.";
      isValid = false;
    } else if (type === 'signup' && cleanPassword.length < 6) {
      errors.password = "Min. 6 characters required.";
      isValid = false;
    }

    if (type === 'signup' && !name.trim()) {
      errors.name = "Please fill out this field.";
      isValid = false;
    }

    setFieldErrors(errors);
    return isValid;
  };

  const clearError = (field: string) => {
    if (fieldErrors[field]) {
      setFieldErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const handleAuth = async (e: React.FormEvent, type: 'signin' | 'signup') => {
    e.preventDefault();
    
    if (!validateForm(type)) return;

    setLoading(true);
    setError(null);

    // Timeout helper
    const timeout = (ms: number) => new Promise((_, reject) => setTimeout(() => reject(new Error("Connection timed out. Please check your network.")), ms));

    try {
      let user: User;
      const cleanEmail = email.trim();
      const cleanPassword = password.trim();
      const cleanName = name.trim();

      if (type === 'signin') {
        user = await Promise.race([
          loginUser(cleanEmail, cleanPassword),
          timeout(8000)
        ]) as User;
      } else {
        user = await Promise.race([
          registerUser(cleanEmail, cleanName, cleanPassword),
          timeout(8000)
        ]) as User;
      }

      setUser(user);
      navigate('/');
    } catch (error: any) {
      console.error("Auth failed", error);
      setError(error.message || "Authentication failed. Please check your connection.");
    } finally {
      setLoading(false);
    }
  };

  const SocialButton = ({ icon: Icon }: { icon: any }) => (
    <button type="button" className="w-10 h-10 rounded-full border border-slate-200 flex items-center justify-center text-slate-600 hover:bg-slate-50 hover:border-blue-400 hover:text-blue-600 transition-colors">
      <Icon className="w-4 h-4" />
    </button>
  );

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col items-center justify-center p-4 font-sans">
      
      {/* Brand Header for Mobile */}
      <div className="md:hidden flex items-center gap-2 mb-6">
        <div className="bg-blue-600 p-2 rounded-lg">
          <FileText className="h-6 w-6 text-white" />
        </div>
        <span className="text-xl font-bold text-slate-800">DocGen AI</span>
      </div>

      {/* Main Container */}
      <div 
        className={`bg-white rounded-2xl shadow-2xl relative overflow-hidden w-full max-w-[850px] min-h-[550px] flex flex-col md:block ${isSignUp ? 'active' : ''}`}
        onClick={() => setFieldErrors({})}
      >
        
        {/* --- DESKTOP VIEW: SLIDING MECHANIC --- */}
        <div className="hidden md:block">
          
          {/* Sign Up Form Container (Right Side when Active) */}
          <div className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 ${isSignUp ? 'opacity-100 z-20 translate-x-full' : 'opacity-0 z-0'}`}>
            <form onSubmit={(e) => handleAuth(e, 'signup')} className="bg-white flex items-center justify-center flex-col px-12 h-full text-center" noValidate>
              <h1 className="font-bold text-3xl mb-4 text-slate-800">Create Account</h1>
              
              <div className="flex gap-3 mb-4">
                <SocialButton icon={GoogleLogo} />
                <SocialButton icon={Linkedin} />
              </div>
              
              <span className="text-xs text-slate-400 mb-4">or use your email for registration</span>
              
              <div className="w-full space-y-3 mb-6">
                <InputGroup 
                  icon={UserIcon}
                  type="text"
                  placeholder="Name"
                  value={name}
                  onChange={(e) => { setName(e.target.value); clearError('name'); }}
                  error={fieldErrors.name}
                />
                
                <InputGroup 
                  icon={Mail}
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                  error={fieldErrors.email}
                />
                
                <InputGroup 
                  icon={Lock}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                  error={fieldErrors.password}
                  toggleIcon={
                    <button 
                       type="button" 
                       onClick={() => setShowPassword(!showPassword)} 
                       className="text-slate-400 hover:text-slate-600 focus:outline-none ml-2"
                     >
                       {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                     </button>
                  }
                />
              </div>

              {error && isSignUp && (
                <div className="text-xs text-red-500 mb-4 bg-red-50 p-2 rounded w-full flex items-center justify-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> {error}
                </div>
              )}

              <button 
                className="bg-blue-600 text-white text-xs font-bold py-3 px-10 rounded-full uppercase tracking-wider hover:bg-blue-700 transition-transform active:scale-95 shadow-lg shadow-blue-200"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign Up'}
              </button>
            </form>
          </div>

          {/* Sign In Form Container (Left Side when Inactive) */}
          <div className={`absolute top-0 h-full transition-all duration-700 ease-in-out left-0 w-1/2 z-10 ${isSignUp ? 'translate-x-full opacity-0' : ''}`}>
            <form onSubmit={(e) => handleAuth(e, 'signin')} className="bg-white flex items-center justify-center flex-col px-12 h-full text-center" noValidate>
              <h1 className="font-bold text-3xl mb-4 text-slate-800">Sign in</h1>
              
              <div className="flex gap-3 mb-4">
                <SocialButton icon={GoogleLogo} />
                <SocialButton icon={Linkedin} />
              </div>
              
              <span className="text-xs text-slate-400 mb-4">or use your account</span>
              
              <div className="w-full space-y-3 mb-4">
                <InputGroup 
                  icon={Mail}
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                  error={fieldErrors.email}
                />

                <InputGroup 
                  icon={Lock}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                  error={fieldErrors.password}
                  toggleIcon={
                    <button 
                       type="button" 
                       onClick={() => setShowPassword(!showPassword)} 
                       className="text-slate-400 hover:text-slate-600 focus:outline-none ml-2"
                     >
                       {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                     </button>
                  }
                />
              </div>

              <a href="#" className="text-xs text-slate-500 hover:text-slate-800 mb-6 border-b border-transparent hover:border-slate-800 transition-colors">Forgot your password?</a>

              {error && !isSignUp && (
                <div className="text-xs text-red-500 mb-4 bg-red-50 p-2 rounded w-full flex items-center justify-center">
                  <AlertCircle className="w-3 h-3 mr-1" /> {error}
                </div>
              )}

              <button 
                className="bg-blue-600 text-white text-xs font-bold py-3 px-10 rounded-full uppercase tracking-wider hover:bg-blue-700 transition-transform active:scale-95 shadow-lg shadow-blue-200"
                disabled={loading}
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
              </button>
            </form>
          </div>

          {/* Overlay Container */}
          <div className={`absolute top-0 left-1/2 w-1/2 h-full overflow-hidden transition-transform duration-700 ease-in-out z-50 ${isSignUp ? '-translate-x-full' : ''}`}>
             <div className={`bg-gradient-to-r from-blue-600 to-indigo-600 text-white relative -left-full h-full w-[200%] transform transition-transform duration-700 ease-in-out ${isSignUp ? 'translate-x-1/2' : 'translate-x-0'}`}>
                
                {/* Left Overlay Panel (For "Welcome Back" -> Switching to Sign In) */}
                <div className={`absolute top-0 flex flex-col items-center justify-center h-full w-1/2 px-10 text-center transition-transform duration-700 ease-in-out ${isSignUp ? 'translate-x-0' : '-translate-x-[20%]'}`}>
                   <h1 className="font-bold text-3xl mb-4">Welcome Back!</h1>
                   <p className="mb-8 text-blue-100 text-sm leading-relaxed px-4">To keep connected with us please login with your personal info</p>
                   <button 
                     onClick={(e) => { e.stopPropagation(); setIsSignUp(false); setError(null); setShowPassword(false); setFieldErrors({}); }} 
                     className="bg-transparent border border-white text-white rounded-full px-10 py-3 font-semibold uppercase text-xs tracking-wider transition-all hover:bg-white hover:text-blue-600 active:scale-95"
                    >
                      Sign In
                    </button>
                </div>

                {/* Right Overlay Panel (For "Hello, Friend" -> Switching to Sign Up) */}
                <div className={`absolute top-0 right-0 flex flex-col items-center justify-center h-full w-1/2 px-10 text-center transition-transform duration-700 ease-in-out ${isSignUp ? 'translate-x-[20%]' : 'translate-x-0'}`}>
                   <h1 className="font-bold text-3xl mb-4">Hello, Friend!</h1>
                   <p className="mb-8 text-blue-100 text-sm leading-relaxed px-4">Enter your personal details and start your journey with us</p>
                   <button 
                     onClick={(e) => { e.stopPropagation(); setIsSignUp(true); setError(null); setShowPassword(false); setFieldErrors({}); }} 
                     className="bg-transparent border border-white text-white rounded-full px-10 py-3 font-semibold uppercase text-xs tracking-wider transition-all hover:bg-white hover:text-blue-600 active:scale-95"
                    >
                      Sign Up
                    </button>
                </div>
             </div>
          </div>
        </div>


        {/* --- MOBILE VIEW: SIMPLE TOGGLE --- */}
        <div className="md:hidden p-8 flex flex-col items-center">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {isSignUp ? 'Create Account' : 'Sign In'}
            </h2>
            <p className="text-sm text-slate-500 mb-6 text-center">
              {isSignUp ? 'Start your journey with us' : 'Welcome back to DocGen AI'}
            </p>

            <form onSubmit={(e) => handleAuth(e, isSignUp ? 'signup' : 'signin')} className="w-full space-y-4" noValidate>
                {isSignUp && (
                  <InputGroup 
                    icon={UserIcon}
                    type="text"
                    placeholder="Name"
                    value={name}
                    onChange={(e) => { setName(e.target.value); clearError('name'); }}
                    error={fieldErrors.name}
                  />
                )}
                
                <InputGroup 
                  icon={Mail}
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => { setEmail(e.target.value); clearError('email'); }}
                  error={fieldErrors.email}
                />
                
                <InputGroup 
                  icon={Lock}
                  type={showPassword ? "text" : "password"}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => { setPassword(e.target.value); clearError('password'); }}
                  error={fieldErrors.password}
                  toggleIcon={
                    <button 
                       type="button" 
                       onClick={() => setShowPassword(!showPassword)} 
                       className="text-slate-400 hover:text-slate-600 focus:outline-none ml-2"
                     >
                       {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                     </button>
                  }
                />

                {error && (
                  <div className="text-xs text-red-500 bg-red-50 p-3 rounded-lg flex items-start">
                    <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                    {error}
                  </div>
                )}

                <button className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 active:scale-95 transition-transform">
                  {loading ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : (isSignUp ? 'SIGN UP' : 'SIGN IN')}
                </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 w-full text-center">
               <p className="text-sm text-slate-500">
                 {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                 <button 
                    onClick={(e) => { e.stopPropagation(); setIsSignUp(!isSignUp); setError(null); setShowPassword(false); setFieldErrors({}); }}
                    className="ml-2 text-blue-600 font-bold hover:underline"
                 >
                   {isSignUp ? 'Sign In' : 'Sign Up'}
                 </button>
               </p>
            </div>
        </div>

      </div>
    </div>
  );
};
