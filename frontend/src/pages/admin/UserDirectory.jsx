import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import { adminAPI } from "../../services/api";

const ROLE_COLORS = {
  admin:"bg-red-100 text-red-800",
  customer:"bg-blue-100 text-blue-800",
  delivery:"bg-green-100 text-green-800",
};

export default function UserDirectory() {
  const [users, setUsers]       = useState([]);
  const [meta, setMeta]         = useState({});
  const [search, setSearch]     = useState("");
  const [role, setRole]         = useState("");
  const [page, setPage]         = useState(1);
  const [loading, setLoading]   = useState(true);
  const [addModal, setAddModal] = useState(false);
  const [editUser, setEditUser] = useState(null);
  const [form, setForm]         = useState({ name:"", email:"", phone:"", password:"", role:"customer" });
  const [saving, setSaving]     = useState(false);

  const load = () => {
    setLoading(true);
    adminAPI.getUsers({ search:search||undefined, role:role||undefined, page })
      .then(({ data }) => { setUsers(data.data||[]); setMeta(data); })
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [search, role, page]);

  const openAdd = () => {
    setForm({ name:"", email:"", phone:"", password:"", role:"customer" });
    setEditUser(null); setAddModal(true);
  };

  const openEdit = (user) => {
    setForm({ name:user.name, email:user.email, phone:user.phone||"", password:"", role:user.role });
    setEditUser(user); setAddModal(true);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editUser) {
        const payload = { ...form };
        if (!payload.password) delete payload.password;
        await adminAPI.updateUser(editUser.id, payload);
      } else {
        await adminAPI.createUser(form);
      }
      setAddModal(false); load();
    } catch (err) {
      const errors = err.response?.data?.errors;
      alert(errors ? Object.values(errors).flat().join("\n") : "Failed to save user.");
    } finally { setSaving(false); }
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this user?")) return;
    await adminAPI.deleteUser(id); load();
  };

  const handleToggle = async (user) => {
    await adminAPI.updateUser(user.id, { is_active: !user.is_active }); load();
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">User Directory</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5 hidden sm:block">Manage all system users and roles</p>
        </div>
        <button onClick={openAdd} className="btn-primary text-xs md:text-sm">
          <i className="ri-user-add-line"></i>
          <span className="hidden sm:inline">Add New User</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-2 md:gap-3 mb-4 md:mb-5">
        <div className="relative flex-1">
          <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
          <input type="text" placeholder="Search by name, phone or email..."
            value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            className="input-field pl-9 text-sm w-full" />
        </div>
        <select value={role} onChange={(e) => { setRole(e.target.value); setPage(1); }}
          className="input-field text-sm sm:w-36">
          <option value="">All Roles</option>
          <option value="customer">Customer</option>
          <option value="delivery">Delivery</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {loading ? (
          [...Array(4)].map((_, i) => <div key={i} className="card h-24 animate-pulse" />)
        ) : users.length === 0 ? (
          <div className="text-center py-12 text-gray-400">
            <i className="ri-team-line text-4xl block mb-2"></i>No users found
          </div>
        ) : users.map((user) => (
          <div key={user.id} className="card p-4">
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm flex-shrink-0">
                  {user.name?.charAt(0).toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>
              <span className={`badge ${ROLE_COLORS[user.role]} text-xs`}>{user.role}</span>
            </div>
            <div className="flex items-center justify-between mt-2">
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <i className="ri-phone-line"></i>{user.phone || "—"}
              </p>
              <div className="flex gap-1">
                <button onClick={() => openEdit(user)}
                  className="w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center">
                  <i className="ri-edit-line text-blue-500 text-sm"></i>
                </button>
                <button onClick={() => handleToggle(user)}
                  className="w-8 h-8 rounded-lg hover:bg-yellow-50 flex items-center justify-center">
                  <i className={`${user.is_active?"ri-toggle-fill text-green-500":"ri-toggle-line text-gray-400"} text-sm`}></i>
                </button>
                <button onClick={() => handleDelete(user.id)}
                  className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center">
                  <i className="ri-delete-bin-line text-red-400 text-sm"></i>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-beige border-b border-gray-100">
              <tr>
                {["User","Contact","Role & Status","Actions"].map((h) => (
                  <th key={h} className="text-left text-xs font-semibold text-gray-500 uppercase tracking-wide px-4 py-3">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {loading ? (
                [...Array(5)].map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    {[...Array(4)].map((_, j) => (
                      <td key={j} className="px-4 py-3"><div className="h-4 bg-beige rounded" /></td>
                    ))}
                  </tr>
                ))
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-12 text-gray-400">
                    <i className="ri-team-line text-4xl block mb-2"></i>No users found
                  </td>
                </tr>
              ) : users.map((user) => (
                <tr key={user.id} className="hover:bg-beige/50 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center font-bold text-primary text-sm">
                        {user.name?.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-gray-800">{user.name}</p>
                        <p className="text-xs text-gray-400">{user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <i className="ri-phone-line text-gray-400"></i>{user.phone||"—"}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Joined {new Date(user.created_at).toLocaleDateString()}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <span className={`badge ${ROLE_COLORS[user.role]}`}>{user.role}</span><br/>
                      <span className={`badge ${user.is_active?"bg-green-100 text-green-700":"bg-gray-100 text-gray-500"}`}>
                        {user.is_active?"Active":"Inactive"}
                      </span>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button onClick={() => openEdit(user)} className="w-8 h-8 rounded-lg hover:bg-blue-50 flex items-center justify-center">
                        <i className="ri-edit-line text-blue-500 text-sm"></i>
                      </button>
                      <button onClick={() => handleToggle(user)} className="w-8 h-8 rounded-lg hover:bg-yellow-50 flex items-center justify-center">
                        <i className={`${user.is_active?"ri-toggle-fill text-green-500":"ri-toggle-line text-gray-400"} text-sm`}></i>
                      </button>
                      <button onClick={() => handleDelete(user.id)} className="w-8 h-8 rounded-lg hover:bg-red-50 flex items-center justify-center">
                        <i className="ri-delete-bin-line text-red-400 text-sm"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {meta.last_page > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-gray-100">
            <p className="text-xs text-gray-500">Showing {meta.from}–{meta.to} of {meta.total}</p>
            <div className="flex gap-1">
              {[...Array(meta.last_page)].map((_, i) => (
                <button key={i} onClick={() => setPage(i+1)}
                  className={`w-8 h-8 rounded-lg text-sm font-semibold transition-all ${page===i+1?"bg-primary text-white":"hover:bg-beige text-gray-600"}`}>
                  {i+1}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      <Modal open={addModal} onClose={() => setAddModal(false)} title={editUser ? "Edit User" : "Add New User"}>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
              <input type="text" value={form.name} onChange={(e) => setForm({...form,name:e.target.value})}
                className="input-field text-sm" placeholder="Full name" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone</label>
              <input type="tel" value={form.phone} onChange={(e) => setForm({...form,phone:e.target.value})}
                className="input-field text-sm" placeholder="0555 000 000" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input type="email" value={form.email} onChange={(e) => setForm({...form,email:e.target.value})}
              className="input-field text-sm" placeholder="email@example.com" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Password {editUser && <span className="text-gray-400 font-normal">(leave blank to keep)</span>}
            </label>
            <input type="password" value={form.password} onChange={(e) => setForm({...form,password:e.target.value})}
              className="input-field text-sm" placeholder="••••••••" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Role</label>
            <div className="grid grid-cols-3 gap-2">
              {["customer","delivery","admin"].map((r) => (
                <button key={r} type="button" onClick={() => setForm({...form,role:r})}
                  className={`py-2 rounded-xl text-xs font-semibold border transition-all capitalize ${
                    form.role===r?"bg-primary text-white border-primary":"bg-white border-gray-200 text-gray-600 hover:border-primary"
                  }`}>{r}</button>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button onClick={() => setAddModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSave} disabled={saving} className="btn-primary flex-1">
              {saving ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-check-line"></i>}
              {saving ? "Saving..." : editUser ? "Save Changes" : "Create User"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
