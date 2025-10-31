import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRegistrations, clearRegistrationError } from "../redux/slices/registrationSlice";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import { motion } from "framer-motion";
import { User, Mail, Shield, Calendar, Users, Code2, MapPin, GraduationCap } from "lucide-react";

export default function ProfilePage() {
  const dispatch = useDispatch();
  const { userId } = useParams();
  const { user } = useSelector((state) => state.auth);

  const { registrations, loading, error } = useSelector((state) => state.registrations);

  useEffect(() => {
    if (user) {
      const role = user.role;
      dispatch(fetchRegistrations({ userId, role }));
    }
  }, [dispatch, user, userId]);

  useEffect(() => {
    if (error) {
      toast.error(error);
      dispatch(clearRegistrationError());
    }
  }, [error, dispatch]);

  if (!user) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <motion.div
          className="text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 font-mono">Loading profile...</p>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black py-12 px-4 sm:px-6 lg:px-8">
      {/* Background Effects */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-20 left-10 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-cyan-500/20 rounded-full blur-3xl"></div>
      </div>

      <div className="max-w-6xl mx-auto relative z-10">
        {/* Header Section */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="mb-8"
        >
          <h1 className="text-4xl md:text-5xl font-black text-white mb-2">
            {user.role === "admin" ? (
              <>
                <span className="text-teal-400">ADMIN</span> DASHBOARD
              </>
            ) : (
              <>
                MY <span className="text-teal-400">PROFILE</span>
              </>
            )}
          </h1>
          <p className="text-gray-500 font-mono text-sm">
            {user.role === "admin" ? "> System Administrator" : "> Member Dashboard"}
          </p>
        </motion.div>

        {/* Profile Card */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="bg-gradient-to-br from-[#0F1A24]/90 to-black/90 backdrop-blur-md rounded-2xl p-8 mb-8 border-2 border-teal-500/30 shadow-2xl relative overflow-hidden"
        >
          {/* Corner Accents */}
          <div className="absolute top-0 left-0 w-20 h-20 border-t-2 border-l-2 border-teal-400/50"></div>
          <div className="absolute top-0 right-0 w-20 h-20 border-t-2 border-r-2 border-teal-400/50"></div>
          <div className="absolute bottom-0 left-0 w-20 h-20 border-b-2 border-l-2 border-teal-400/50"></div>
          <div className="absolute bottom-0 right-0 w-20 h-20 border-b-2 border-r-2 border-teal-400/50"></div>

          <div className="relative z-10">
            <h2 className="text-2xl font-bold text-teal-400 mb-6 flex items-center gap-2">
              <User className="w-6 h-6" />
              User Information
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center gap-4 p-4 bg-black/40 rounded-lg border border-teal-500/20"
              >
                <div className="w-12 h-12 bg-teal-500/20 rounded-lg flex items-center justify-center">
                  <User className="w-6 h-6 text-teal-400" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-mono">Name</p>
                  <p className="text-white font-semibold">{user.name}</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center gap-4 p-4 bg-black/40 rounded-lg border border-teal-500/20"
              >
                <div className="w-12 h-12 bg-cyan-500/20 rounded-lg flex items-center justify-center">
                  <Mail className="w-6 h-6 text-cyan-400" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-mono">Email</p>
                  <p className="text-white font-semibold break-all">{user.email}</p>
                </div>
              </motion.div>

              <motion.div
                whileHover={{ x: 5 }}
                className="flex items-center gap-4 p-4 bg-black/40 rounded-lg border border-teal-500/20"
              >
                <div className="w-12 h-12 bg-purple-500/20 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-purple-400" />
                </div>
                <div>
                  <p className="text-gray-500 text-sm font-mono">Role</p>
                  <p className="text-white font-semibold uppercase">{user.role}</p>
                </div>
              </motion.div>

              {user.role === "admin" && (
                <motion.div
                  whileHover={{ x: 5 }}
                  className="flex items-center gap-4 p-4 bg-black/40 rounded-lg border border-teal-500/20"
                >
                  <div className="w-12 h-12 bg-green-500/20 rounded-lg flex items-center justify-center">
                    <Users className="w-6 h-6 text-green-400" />
                  </div>
                  <div>
                    <p className="text-gray-500 text-sm font-mono">Total Registrations</p>
                    <p className="text-white font-semibold text-2xl">{registrations.length}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </motion.div>

        {/* Registrations Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
        >
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-white flex items-center gap-3">
              <Code2 className="w-8 h-8 text-teal-400" />
              {user.role === "admin" ? "ALL REGISTRATIONS" : "YOUR EVENTS"}
            </h2>
            {!loading && registrations.length > 0 && (
              <div className="px-4 py-2 bg-teal-500/20 border border-teal-500/30 rounded-lg">
                <span className="text-teal-400 font-bold font-mono">{registrations.length}</span>
                <span className="text-gray-400 ml-2 text-sm">Total</span>
              </div>
            )}
          </div>

          {loading ? (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="bg-[#0F1A24]/80 backdrop-blur-md rounded-xl p-12 border border-teal-500/20 text-center"
            >
              <div className="w-16 h-16 border-4 border-teal-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
              <p className="text-gray-400 font-mono">Loading registrations...</p>
            </motion.div>
          ) : registrations.length > 0 ? (
            <div className="space-y-4">
              {registrations.map((r, index) => (
                <motion.div
                  key={r._id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.02, x: 5 }}
                  className="bg-gradient-to-r from-[#0F1A24]/80 to-black/80 backdrop-blur-md rounded-xl p-6 border border-teal-500/30 hover:border-teal-400/50 transition-all shadow-lg relative overflow-hidden group"
                >
                  {/* Hover Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-teal-500/5 to-cyan-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                  <div className="relative z-10 flex flex-col lg:flex-row gap-6">
                    {/* User Info - Admin Only */}
                    {user.role === "admin" && (
                      <div className="flex-1">
                        <div className="flex items-start gap-3 mb-3">
                          <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                            <User className="w-5 h-5 text-teal-400" />
                          </div>
                          <div>
                            <p className="text-white font-bold text-lg">{r.userId?.name}</p>
                            <p className="text-gray-400 text-sm flex items-center gap-1">
                              <Mail className="w-3 h-3" />
                              {r.userId?.email}
                            </p>
                          </div>
                        </div>
                        <div className="flex flex-wrap gap-2 mt-2">
                          <span className="px-3 py-1 bg-cyan-500/20 border border-cyan-500/30 rounded-full text-cyan-400 text-xs font-mono flex items-center gap-1">
                            <GraduationCap className="w-3 h-3" />
                            Roll: {r.userId?.rollno}
                          </span>
                          <span className="px-3 py-1 bg-purple-500/20 border border-purple-500/30 rounded-full text-purple-400 text-xs font-mono">
                            {r.userId?.branch}
                          </span>
                          <span className="px-3 py-1 bg-blue-500/20 border border-blue-500/30 rounded-full text-blue-400 text-xs font-mono">
                            Year {r.userId?.year}
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Event Info */}
                    <div className="flex-1">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 bg-teal-500/20 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Calendar className="w-5 h-5 text-teal-400" />
                        </div>
                        <div>
                          <p className="text-teal-400 font-bold text-lg mb-2">{r.eventId?.title}</p>
                          <div className="flex items-center gap-2 text-gray-400 text-sm">
                            <Calendar className="w-4 h-4" />
                            <span>
                              {new Date(r.eventId?.startDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                            <span className="text-teal-400">→</span>
                            <span>
                              {new Date(r.eventId?.endDate).toLocaleDateString('en-US', {
                                month: 'short',
                                day: 'numeric',
                                year: 'numeric'
                              })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Bottom Border Animation */}
                  <motion.div
                    className="absolute bottom-0 left-0 h-1 bg-gradient-to-r from-teal-400 to-cyan-400"
                    initial={{ width: 0 }}
                    whileHover={{ width: "100%" }}
                    transition={{ duration: 0.3 }}
                  />
                </motion.div>
              ))}
            </div>
          ) : (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="bg-[#0F1A24]/80 backdrop-blur-md rounded-xl p-12 border border-teal-500/20 text-center"
            >
              <div className="w-20 h-20 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Calendar className="w-10 h-10 text-teal-400" />
              </div>
              <p className="text-gray-400 text-lg font-mono">
                {user.role === "admin" 
                  ? "No registrations found in the system." 
                  : "You haven't registered for any events yet."}
              </p>
              <p className="text-gray-600 text-sm mt-2">
                {user.role !== "admin" && "Check out our upcoming events!"}
              </p>
            </motion.div>
          )}
        </motion.div>
      </div>
    </div>
  );
}