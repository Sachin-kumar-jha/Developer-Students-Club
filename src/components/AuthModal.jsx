import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useDispatch, useSelector } from "react-redux";
import { loginUser, registerUser, googleLoginUser } from "../redux/slices/authSlice";
import { toast } from "react-toastify";
import axios from "axios";
import {
  X,
  User,
  Mail,
  Lock,
  Eye,
  EyeOff,
  GraduationCap,
  BookOpen,
  Hash,
  Sparkles,
  CheckCircle2,
  ArrowRight,
} from "lucide-react";
import LoaderSkeleton from "./Skeleton/LoaderSkeleton";

export default function AuthModal({ onClose, defaultIsLogin = true }) {
  const [isLogin, setIsLogin] = useState(defaultIsLogin);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [gsiLoaded, setGsiLoaded] = useState(false);

  // Step 2 for Google Sign Up (asking for rollno, branch, year, set password)
  const [googleSignUpStep, setGoogleSignUpStep] = useState(false);
  const [googleAccount, setGoogleAccount] = useState(null); // { name, email, credential }

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    rollno: "",
    branch: "",
    year: "",
    password: "",
    confirmPassword: "",
  });

  const dispatch = useDispatch();
  const { loading } = useSelector((state) => state.auth);
  const googleBtnRef = useRef(null);

  const GOOGLE_CLIENT_ID =
    import.meta.env.VITE_GOOGLE_CLIENT_ID ||
    "691174506062-ht2dp63353ti85cosg3asiv9piu2n882.apps.googleusercontent.com";

  // Parse Google JWT credential
  const parseJwt = (token) => {
    try {
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      return JSON.parse(jsonPayload);
    } catch (e) {
      return null;
    }
  };

  // Handle Google Callback
  const handleGoogleCallback = async (response) => {
    if (!response?.credential) {
      toast.error("Google authentication failed");
      return;
    }

    setGoogleLoading(true);
    const googleUser = parseJwt(response.credential);
    const email = googleUser?.email;
    const name = googleUser?.name || "";

    if (!email) {
      toast.error("Could not obtain email from Google");
      setGoogleLoading(false);
      return;
    }

    try {
      if (isLogin) {
        // --- GOOGLE LOGIN FLOW ---
        const result = await dispatch(
          googleLoginUser({ credential: response.credential, email, name })
        );

        if (googleLoginUser.fulfilled.match(result)) {
          toast.success(result.payload?.message || `Welcome back, ${result.payload?.user?.name}!`);
          onClose();
        } else {
          // Account doesn't exist yet -> Switch to Sign Up Step 2
          toast.info("No account found with this Google email. Please complete your registration!");
          setGoogleAccount({ name, email, credential: response.credential });
          setFormData((prev) => ({ ...prev, name, email }));
          setIsLogin(false);
          setGoogleSignUpStep(true);
        }
      } else {
        // --- GOOGLE SIGN UP FLOW ---
        // Check if user already exists
        const checkRes = await axios.post(
          `${import.meta.env.VITE_API_URL}/api/users/google-check`,
          { email }
        );

        if (checkRes.data?.exists) {
          toast.info("Account already exists with this email! Please log in.");
          setIsLogin(true);
          setGoogleSignUpStep(false);
        } else {
          // Proceed to Step 2 to ask for academic info and set password
          setGoogleAccount({ name, email, credential: response.credential });
          setFormData((prev) => ({ ...prev, name, email }));
          setGoogleSignUpStep(true);
          toast.success("Google verified! Please complete your academic details.");
        }
      }
    } catch (err) {
      console.error("Google Auth error:", err);
      toast.error(err.response?.data?.message || "Google authentication failed");
    } finally {
      setGoogleLoading(false);
    }
  };

  // Initialize Google Identity Services & Render Official Button
  const initGoogleGSI = () => {
    if (!window.google?.accounts?.id || !googleBtnRef.current) return false;
    try {
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleGoogleCallback,
        auto_select: false,
        cancel_on_tap_outside: true,
      });

      // Clear previous button content
      googleBtnRef.current.innerHTML = "";

      const parentWidth = googleBtnRef.current.parentElement?.offsetWidth || 340;
      const targetWidth = Math.min(380, Math.max(260, parentWidth - 10));

      window.google.accounts.id.renderButton(googleBtnRef.current, {
        type: "standard",
        theme: "outline",
        size: "large",
        text: isLogin ? "signin_with" : "signup_with",
        shape: "rectangular",
        logo_alignment: "left",
        width: targetWidth,
      });

      setGsiLoaded(true);

      // Attempt prompt as optional One-Tap on supported devices
      try {
        window.google.accounts.id.prompt(() => {});
      } catch (e) {}

      return true;
    } catch (err) {
      console.warn("Google GSI render error:", err);
      return false;
    }
  };

  useEffect(() => {
    if (googleSignUpStep) return;

    setGsiLoaded(false);

    if (initGoogleGSI()) return;

    // Retry polling until google script is ready
    const interval = setInterval(() => {
      if (initGoogleGSI()) {
        clearInterval(interval);
      }
    }, 150);

    const timeout = setTimeout(() => {
      clearInterval(interval);
    }, 6000);

    return () => {
      clearInterval(interval);
      clearTimeout(timeout);
    };
  }, [isLogin, googleSignUpStep]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Standard Form Submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isLogin) {
      try {
        const res = await dispatch(
          loginUser({ email: formData.email, password: formData.password })
        ).unwrap();
        toast.success(res?.message || "Logged in successfully");
        onClose();
      } catch (err) {
        // error already toasted by thunk
      }
    } else {
      // Sign Up Validation
      if (!formData.name || !formData.email || !formData.rollno || !formData.branch || !formData.year || !formData.password) {
        toast.error("Please fill in all required fields");
        return;
      }

      if (formData.confirmPassword && formData.password !== formData.confirmPassword) {
        toast.error("Passwords do not match");
        return;
      }

      try {
        const payload = {
          name: formData.name.trim(),
          email: formData.email.trim(),
          rollno: formData.rollno.trim(),
          branch: formData.branch.trim(),
          year: Number(formData.year),
          password: formData.password,
        };

        const res = await dispatch(registerUser(payload)).unwrap();
        toast.success(res?.message || "Registration successful! Welcome to DSC.");
        onClose();
      } catch (err) {
        toast.error(err?.message || "Registration failed");
      }
    }
  };

  return (
    <motion.div
      className="fixed inset-0 bg-black/75 backdrop-blur-md flex justify-center items-center z-50 p-4 overflow-y-auto"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-[#0F1A24] border border-teal-500/30 text-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-[0_0_50px_rgba(20,184,166,0.15)] relative overflow-hidden my-6"
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        transition={{ duration: 0.25 }}
      >
        {/* Top glowing bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-teal-500 via-cyan-400 to-emerald-400" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg bg-gray-800/60 hover:bg-gray-700 text-gray-400 hover:text-white transition cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="text-center mb-6 pt-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-mono mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            Developer Students Club
          </div>
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            {isLogin
              ? "Welcome Back"
              : googleSignUpStep
              ? "Complete Student Profile"
              : "Create an Account"}
          </h2>
          <p className="text-xs text-gray-400 font-mono mt-1">
            {isLogin
              ? "Sign in to apply for club roles and register for events"
              : googleSignUpStep
              ? "Enter your academic details & set a password to finish"
              : "Join our student developer chapter and access all club features"}
          </p>
        </div>

        {/* Tab switch (only if not in Google Step 2) */}
        {!googleSignUpStep && (
          <div className="flex bg-black/40 p-1 rounded-xl border border-gray-800 mb-6">
            <button
              type="button"
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-xs font-mono font-bold tracking-wider rounded-lg transition cursor-pointer ${
                isLogin
                  ? "bg-teal-400 text-black shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Sign In
            </button>
            <button
              type="button"
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-xs font-mono font-bold tracking-wider rounded-lg transition cursor-pointer ${
                !isLogin
                  ? "bg-teal-400 text-black shadow-[0_0_15px_rgba(20,184,166,0.3)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {/* GOOGLE OAUTH BUTTON */}
        {!googleSignUpStep && (
          <div className="space-y-3 mb-5">
            {/* Google Identity Services Official Rendered Button */}
            <div className="w-full flex flex-col items-center justify-center min-h-[44px]">
              <div
                ref={googleBtnRef}
                className={`w-full flex justify-center items-center ${
                  !gsiLoaded ? "opacity-0 absolute -z-10 pointer-events-none" : ""
                }`}
                id="google-signin-btn"
              />

              {!gsiLoaded && (
                <div className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl bg-white text-gray-800 font-semibold text-sm shadow-md animate-pulse">
                  <div className="w-4 h-4 border-2 border-teal-500 border-t-transparent rounded-full animate-spin" />
                  <span>Loading Google Sign-In...</span>
                </div>
              )}
            </div>

            {/* Divider */}
            <div className="flex items-center gap-3 my-4">
              <div className="h-[1px] flex-1 bg-gray-800" />
              <span className="text-[11px] font-mono text-gray-500 uppercase">
                {isLogin ? "Or with email" : "Or manual registration"}
              </span>
              <div className="h-[1px] flex-1 bg-gray-800" />
            </div>
          </div>
        )}

        {/* GOOGLE SIGN UP STEP 2: VERIFIED BANNER */}
        {googleSignUpStep && googleAccount && (
          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-3.5 mb-5 flex items-center justify-between text-left">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
              <div>
                <span className="text-[11px] font-mono font-bold uppercase text-emerald-400 block">
                  Google Verified
                </span>
                <span className="text-xs text-white font-medium block">
                  {googleAccount.name} ({googleAccount.email})
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => {
                setGoogleSignUpStep(false);
                setGoogleAccount(null);
              }}
              className="text-[10px] font-mono text-gray-400 hover:text-white underline cursor-pointer"
            >
              Change
            </button>
          </div>
        )}

        {/* AUTH FORM */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3.5 text-left">
          {/* SIGN UP FIELDS (Normal or Google Step 2) */}
          {!isLogin && (
            <>
              {/* Full Name (if not Google Step 2) */}
              {!googleSignUpStep && (
                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-400 uppercase flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-teal-400" /> Full Name
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="e.g. Rahul Sharma"
                    required
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-gray-800 text-white text-sm focus:border-teal-400 focus:outline-none transition"
                  />
                </div>
              )}

              {/* Roll No and Branch Grid */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-400 uppercase flex items-center gap-1.5">
                    <Hash className="w-3.5 h-3.5 text-teal-400" /> Roll Number
                  </label>
                  <input
                    type="text"
                    name="rollno"
                    value={formData.rollno}
                    onChange={handleChange}
                    placeholder="e.g. 23111"
                    required
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-gray-800 text-white text-sm focus:border-teal-400 focus:outline-none transition"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-mono text-gray-400 uppercase flex items-center gap-1.5">
                    <GraduationCap className="w-3.5 h-3.5 text-teal-400" /> Year
                  </label>
                  <select
                    name="year"
                    value={formData.year}
                    onChange={handleChange}
                    required
                    className="w-full p-2.5 rounded-xl bg-black/40 border border-gray-800 text-white text-sm focus:border-teal-400 focus:outline-none transition"
                  >
                    <option value="">Select Year</option>
                    <option value="1">1st Year</option>
                    <option value="2">2nd Year</option>
                    <option value="3">3rd Year</option>
                    <option value="4">4th Year</option>
                  </select>
                </div>
              </div>

              {/* Branch */}
              <div className="space-y-1">
                <label className="text-xs font-mono text-gray-400 uppercase flex items-center gap-1.5">
                  <BookOpen className="w-3.5 h-3.5 text-teal-400" /> Branch / Department
                </label>
                <input
                  type="text"
                  name="branch"
                  value={formData.branch}
                  onChange={handleChange}
                  placeholder="e.g. Information Technology / CS"
                  required
                  className="w-full p-2.5 rounded-xl bg-black/40 border border-gray-800 text-white text-sm focus:border-teal-400 focus:outline-none transition"
                />
              </div>
            </>
          )}

          {/* Email Address (Hidden in Google Step 2 because already verified) */}
          {(!googleSignUpStep || isLogin) && (
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-400 uppercase flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-teal-400" /> Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="student@college.edu"
                required
                className="w-full p-2.5 rounded-xl bg-black/40 border border-gray-800 text-white text-sm focus:border-teal-400 focus:outline-none transition"
              />
            </div>
          )}

          {/* Password */}
          <div className="space-y-1">
            <label className="text-xs font-mono text-gray-400 uppercase flex items-center justify-between">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-teal-400" />
                {googleSignUpStep ? "Set Account Password" : "Password"}
              </span>
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-[11px] text-gray-400 hover:text-teal-400 flex items-center gap-1 transition cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                {showPassword ? "Hide" : "Show"}
              </button>
            </label>
            <input
              type={showPassword ? "text" : "password"}
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              className="w-full p-2.5 rounded-xl bg-black/40 border border-gray-800 text-white text-sm focus:border-teal-400 focus:outline-none transition"
            />
          </div>

          {/* Confirm Password (for Sign Up) */}
          {!isLogin && (
            <div className="space-y-1">
              <label className="text-xs font-mono text-gray-400 uppercase flex items-center justify-between">
                <span className="flex items-center gap-1.5">
                  <Lock className="w-3.5 h-3.5 text-teal-400" /> Confirm Password
                </span>
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="text-[11px] text-gray-400 hover:text-teal-400 flex items-center gap-1 transition cursor-pointer"
                >
                  {showConfirmPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </label>
              <input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="••••••••"
                required={!isLogin}
                className="w-full p-2.5 rounded-xl bg-black/40 border border-gray-800 text-white text-sm focus:border-teal-400 focus:outline-none transition"
              />
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading || googleLoading}
            className="mt-2 w-full py-3 bg-gradient-to-r from-teal-400 to-cyan-400 hover:from-teal-300 hover:to-cyan-300 text-black font-bold font-mono uppercase tracking-wider rounded-xl transition shadow-[0_0_20px_rgba(20,184,166,0.3)] hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer text-sm"
          >
            {loading || googleLoading ? (
              <LoaderSkeleton size="w-5 h-5" color="black" />
            ) : isLogin ? (
              "Sign In"
            ) : googleSignUpStep ? (
              <>
                <span>Complete Registration</span>
                <ArrowRight className="w-4 h-4" />
              </>
            ) : (
              "Create Account"
            )}
          </button>
        </form>

        {/* Bottom Toggle Note */}
        <p className="mt-5 text-xs text-center text-gray-400 font-mono">
          {isLogin ? (
            <>
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(false);
                  setGoogleSignUpStep(false);
                }}
                className="text-teal-400 font-bold hover:underline cursor-pointer"
              >
                Sign up
              </button>
            </>
          ) : (
            <>
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => {
                  setIsLogin(true);
                  setGoogleSignUpStep(false);
                }}
                className="text-teal-400 font-bold hover:underline cursor-pointer"
              >
                Sign in
              </button>
            </>
          )}
        </p>
      </motion.div>
    </motion.div>
  );
}
