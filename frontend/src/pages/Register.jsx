import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ name:"", email:"", phone:"", password:"", password_confirmation:"", role:"customer" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const { register }          = useAuth();
  const navigate              = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault(); setError("");
    if (form.password !== form.password_confirmation) { setError("Passwords do not match."); return; }
    setLoading(true);
    try {
      const user = await register(form);
      if (user.role === "delivery") navigate("/delivery/dashboard");
      else navigate("/customer/menu");
    } catch (err) {
      const errors = err.response?.data?.errors;
      if (errors) setError(Object.values(errors).flat().join(" "));
      else setError(err.response?.data?.message || "Registration failed.");
    } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-beige flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6 md:mb-8">
          <div className="w-14 h-14 md:w-16 md:h-16 bg-primary rounded-2xl flex items-center justify-center mx-auto mb-3 md:mb-4">
            <i className="ri-restaurant-2-line text-white text-2xl md:text-3xl"></i>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Create Account</h1>
          <p className="text-gray-500 text-sm mt-1">Join Brayin Food today</p>
        </div>

        <div className="card p-6 md:p-8">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3 mb-4 flex items-center gap-2">
              <i className="ri-error-warning-line flex-shrink-0"></i> {error}
            </div>
          )}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <div className="relative">
                <i className="ri-user-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input type="text" required value={form.name}
                  onChange={(e) => setForm({...form, name:e.target.value})}
                  className="input-field pl-9" placeholder="Your name" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
              <div className="relative">
                <i className="ri-mail-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input type="email" required value={form.email}
                  onChange={(e) => setForm({...form, email:e.target.value})}
                  className="input-field pl-9" placeholder="your@email.com" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <div className="relative">
                <i className="ri-phone-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
                <input type="tel" value={form.phone}
                  onChange={(e) => setForm({...form, phone:e.target.value})}
                  className="input-field pl-9" placeholder="0555 000 000" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                <input type="password" required value={form.password}
                  onChange={(e) => setForm({...form, password:e.target.value})}
                  className="input-field" placeholder="••••••••" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1.5">Confirm</label>
                <input type="password" required value={form.password_confirmation}
                  onChange={(e) => setForm({...form, password_confirmation:e.target.value})}
                  className="input-field" placeholder="••••••••" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Register as</label>
              <div className="grid grid-cols-2 gap-3">
                {["customer","delivery"].map((r) => (
                  <button key={r} type="button" onClick={() => setForm({...form, role:r})}
                    className={`py-2.5 rounded-xl text-sm font-semibold border transition-all capitalize ${
                      form.role===r ? "bg-primary text-white border-primary" : "bg-white text-gray-600 border-gray-200"
                    }`}>
                    <i className={`${r==="customer"?"ri-user-line":"ri-truck-line"} mr-1.5`}></i>{r}
                  </button>
                ))}
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-primary w-full mt-2">
              {loading ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-user-add-line"></i>}
              {loading ? "Creating..." : "Create Account"}
            </button>
          </form>
          <p className="text-center text-sm text-gray-500 mt-4 md:mt-5">
            Already have an account?{" "}
            <Link to="/login" className="text-primary font-semibold hover:underline">Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
