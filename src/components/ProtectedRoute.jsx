import { useSelector } from "react-redux";

export default function ProtectedRoute({ children, onAuthRequired }) {
  const { user } = useSelector((state) => state.auth);

  if (!user) {
    // Trigger AuthModal instead of redirect
    if (onAuthRequired) onAuthRequired();
    return null;
  }

  return children;
}
