import { useEffect, useRef } from "react";
import { useSelector } from "react-redux";

export default function ProtectedRoute({ children, onAuthRequired }) {
  const { user } = useSelector((state) => state.auth);
  const calledRef = useRef(false);

  useEffect(() => {

    if (!user && !calledRef.current) {
      calledRef.current = true; // mark as called
      onAuthRequired?.();
    }

    if (user) {
      // reset if user logs in later
      calledRef.current = false;
    }
  }, [user, onAuthRequired]);

  if (!user) {
    return null;
  }

  return children;
}
