import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchRegistrations, clearRegistrationError } from "../redux/slices/registrationSlice";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";

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

  if (!user) return <div className="text-center mt-10 text-gray-300">Loading...</div>;

  return (
    <div className="max-w-5xl mx-auto mt-10 p-6 bg-[#0f172a] rounded-xl shadow-lg text-gray-200">
      <h1 className="text-3xl font-bold mb-6 text-teal-400">
        {user.role === "admin" ? "Admin Dashboard" : "Profile"}
      </h1>

      <div className="mb-8">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
        <p><strong>Total Registrations:</strong> {user.role === "admin" ? registrations.length : ""}</p>
      </div>

      <h2 className="text-2xl font-semibold mb-4 text-teal-300">
        {user.role === "admin" ? "All Registrations" : "Your Registered Events"}
      </h2>

      {loading ? (
        <p>Loading registrations...</p>
      ) : registrations.length > 0 ? (
        <ul className="space-y-3">
          {registrations.map((r) => (
            <li
              key={r._id}
              className="bg-[#1e293b] p-4 rounded-lg border border-gray-700 flex flex-col md:flex-row justify-between items-start md:items-center"
            >
              {user.role === "admin" && (
                <div>
                  <p><strong>User:</strong> {r.userId?.name} ({r.userId?.email})</p>
                  <p className="text-gray-400 text-sm">
                    Roll: {r.userId?.rollno} | Branch: {r.userId?.branch} | Year: {r.userId?.year}
                  </p>
                </div>
              )}

              <div className="mt-2 md:mt-0">
                <p><strong>Event:</strong> {r.eventId?.title}</p>
                <p className="text-gray-400 text-sm">
                  {new Date(r.eventId?.startDate).toLocaleDateString()} -{" "}
                  {new Date(r.eventId?.endDate).toLocaleDateString()}
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>{user.role === "admin" ? "No registrations found." : "You haven’t registered for any events yet."}</p>
      )}
    </div>
  );
}
