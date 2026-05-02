import { useState, useEffect } from "react";
import Modal from "../../components/Modal";
import { adminAPI } from "../../services/api";

const imgUrl = (path) => {
  if (!path) return "/images/food/placeholder.jpg";
  if (path.startsWith("http")) return path;
  return `http://localhost:8000/storage/${path}`;
};

export default function MenuEditor() {
  const [items, setItems]           = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const [search, setSearch]         = useState("");
  const [loading, setLoading]       = useState(true);
  const [itemModal, setItemModal]   = useState(false);
  const [catModal, setCatModal]     = useState(false);
  const [editItem, setEditItem]     = useState(null);
  const [saving, setSaving]         = useState(false);
  const [preview, setPreview]       = useState(null);
  const [form, setForm] = useState({
    category_id:"", name:"", description:"",
    price:"", is_available:true, prep_time:15, image:null,
  });
  const [catForm, setCatForm] = useState({ name:"", image:null });

  const load = () => {
    setLoading(true);
    Promise.all([
      adminAPI.getItems({ category_id: activeCategory!=="all"?activeCategory:undefined, search:search||undefined }),
      adminAPI.getCategories(),
    ]).then(([itemsRes, catsRes]) => {
      setItems(itemsRes.data.data || itemsRes.data);
      setCategories(catsRes.data);
    }).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [activeCategory, search]);

  const openAdd = () => {
    setForm({ category_id:categories[0]?.id||"", name:"", description:"", price:"", is_available:true, prep_time:15, image:null });
    setPreview(null); setEditItem(null); setItemModal(true);
  };

  const openEdit = (item) => {
    setForm({ category_id:item.category?.id||"", name:item.name, description:item.description||"",
      price:item.price, is_available:item.is_available, prep_time:item.prep_time, image:null });
    setPreview(item.image ? (item.image.startsWith("http") ? item.image : `http://localhost:8000/storage/${item.image}`) : null); setEditItem(item); setItemModal(true);
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setForm({...form, image:file});
    setPreview(URL.createObjectURL(file));
  };

  const handleSaveItem = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k,v]) => { if (v!==null && v!=="") fd.append(k,v); });
      fd.set("is_available", form.is_available?1:0);
      if (editItem) await adminAPI.updateItem(editItem.id, fd);
      else          await adminAPI.createItem(fd);
      setItemModal(false); load();
    } catch (err) {
      const errors = err.response?.data?.errors;
      alert(errors ? Object.values(errors).flat().join("\n") : "Failed to save item.");
    } finally { setSaving(false); }
  };

  const handleDeleteItem = async (id) => {
    if (!confirm("Delete this item?")) return;
    await adminAPI.deleteItem(id); load();
  };

  const handleSaveCategory = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("name", catForm.name);
      if (catForm.image) fd.append("image", catForm.image);
      await adminAPI.createCategory(fd);
      setCatModal(false); load();
    } catch { alert("Failed to create category."); }
    finally { setSaving(false); }
  };

  return (
    <div className="p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-4 md:mb-6">
        <div>
          <p className="text-xs text-gray-400 uppercase tracking-widest mb-0.5">Management</p>
          <h1 className="text-xl md:text-2xl font-bold text-gray-800">Menu Editor</h1>
          <p className="text-gray-500 text-xs md:text-sm mt-0.5 hidden sm:block">Manage your menu items and categories</p>
        </div>
        <div className="flex gap-2">
          <button onClick={() => setCatModal(true)} className="btn-secondary text-xs md:text-sm">
            <i className="ri-folder-add-line"></i>
            <span className="hidden sm:inline">Add Category</span>
          </button>
          <button onClick={openAdd} className="btn-primary text-xs md:text-sm">
            <i className="ri-add-line"></i>
            <span className="hidden sm:inline">Add Item</span>
          </button>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex flex-wrap gap-4 md:gap-6 mb-4 md:mb-6 px-1">
        {[
          { label:"Avg. Rating", value:"4.8", icon:"ri-star-fill", color:"text-yellow-500" },
          { label:"Top Category", value:categories[0]?.name||"—", icon:"ri-fire-line", color:"text-primary" },
          { label:"Active Items",
            value:`${items.length>0?Math.round(items.filter(i=>i.is_available).length/items.length*100):0}%`,
            icon:"ri-checkbox-circle-line", color:"text-green-500" },
          { label:"Total Items", value:items.length, icon:"ri-restaurant-line", color:"text-blue-500" },
        ].map((s) => (
          <div key={s.label} className="flex items-center gap-2">
            <i className={`${s.icon} ${s.color} text-lg md:text-xl`}></i>
            <div>
              <p className="font-bold text-gray-800 text-sm md:text-base">{s.value}</p>
              <p className="text-xs text-gray-400">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Category tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2 mb-4 scrollbar-hide">
        <button onClick={() => setActiveCategory("all")}
          className={`flex-shrink-0 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
            activeCategory==="all"?"bg-primary text-white":"bg-white text-gray-600 hover:bg-beige"}`}>
          All Items
        </button>
        {categories.map((cat) => (
          <button key={cat.id} onClick={() => setActiveCategory(cat.id)}
            className={`flex-shrink-0 px-3 md:px-4 py-1.5 md:py-2 rounded-xl text-xs md:text-sm font-semibold transition-all ${
              activeCategory===cat.id?"bg-primary text-white":"bg-white text-gray-600 hover:bg-beige"}`}>
            {cat.name}
          </button>
        ))}
      </div>

      {/* Search */}
      <div className="relative mb-4 md:mb-5">
        <i className="ri-search-line absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input type="text" placeholder="Search menu items..." value={search}
          onChange={(e) => setSearch(e.target.value)} className="input-field pl-9 text-sm" />
      </div>

      {/* Items grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="card overflow-hidden animate-pulse">
              <div className="h-32 md:h-40 bg-beige-dark" />
              <div className="p-3 md:p-4 space-y-2">
                <div className="h-3 bg-beige-dark rounded w-3/4" />
                <div className="h-3 bg-beige-dark rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      ) : items.length === 0 ? (
        <div className="text-center py-16 md:py-20">
          <i className="ri-restaurant-line text-4xl md:text-5xl text-gray-300"></i>
          <p className="text-gray-400 mt-3 text-sm">No items found</p>
          <button onClick={openAdd} className="btn-primary mt-4">
            <i className="ri-add-line"></i> Add First Item
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 md:gap-4">
          {items.map((item) => (
            <div key={item.id} className="card overflow-hidden group hover:shadow-md transition-shadow">
              <div className="relative h-32 md:h-40 overflow-hidden bg-beige">
                <img src={imgUrl(item.image)} alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                  onError={(e) => { e.target.src="/images/food/placeholder.jpg"; }} />
                {!item.is_available && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="text-white text-xs font-semibold bg-red-500 px-2 py-0.5 rounded-full">Out of Stock</span>
                  </div>
                )}
                <span className={`absolute top-2 right-2 badge text-xs ${item.is_available?"bg-green-100 text-green-800":"bg-red-100 text-red-800"}`}>
                  {item.is_available?"In Stock":"Out"}
                </span>
              </div>
              <div className="p-3 md:p-4">
                <p className="text-xs text-gray-400 mb-0.5">{item.category?.name}</p>
                <p className="font-semibold text-xs md:text-sm text-gray-800 truncate">{item.name}</p>
                <p className="text-primary font-bold mt-1 text-sm">{item.price} دج</p>
                <div className="flex gap-2 mt-2 md:mt-3">
                  <button onClick={() => openEdit(item)}
                    className="flex-1 py-1.5 rounded-lg bg-beige hover:bg-beige-dark text-xs font-semibold text-gray-600 flex items-center justify-center gap-1 transition-colors">
                    <i className="ri-edit-line"></i> Edit
                  </button>
                  <button onClick={() => handleDeleteItem(item.id)}
                    className="w-7 h-7 md:w-8 md:h-8 rounded-lg hover:bg-red-50 flex items-center justify-center transition-colors">
                    <i className="ri-delete-bin-line text-red-400 text-xs md:text-sm"></i>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add/Edit Item Modal */}
      <Modal open={itemModal} onClose={() => setItemModal(false)}
        title={editItem?"Edit Menu Item":"Create Menu Item"} size="lg">
        <div className="space-y-4">
          {/* Image */}
          <div className="relative h-32 md:h-36 rounded-xl overflow-hidden bg-beige flex items-center justify-center cursor-pointer"
            onClick={() => document.getElementById("item-img").click()}>
            {preview ? (
              <img src={preview} alt="preview" className="w-full h-full object-cover" />
            ) : (
              <div className="text-center">
                <i className="ri-image-add-line text-2xl md:text-3xl text-gray-300"></i>
                <p className="text-xs text-gray-400 mt-1">Click to add image</p>
              </div>
            )}
            <input id="item-img" type="file" accept="image/*" className="hidden" onChange={handleImageChange} />
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Category</label>
              <select value={form.category_id} onChange={(e) => setForm({...form,category_id:e.target.value})}
                className="input-field text-sm">
                {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Price (دج)</label>
              <input type="number" value={form.price} onChange={(e) => setForm({...form,price:e.target.value})}
                className="input-field text-sm" placeholder="e.g. 490" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Item Name</label>
            <input type="text" value={form.name} onChange={(e) => setForm({...form,name:e.target.value})}
              className="input-field text-sm" placeholder="e.g. Pizza Napoletana" />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({...form,description:e.target.value})}
              className="input-field resize-none text-sm" rows={2} placeholder="Short description..." />
          </div>

          <div className="grid grid-cols-2 gap-3 md:gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Prep Time (min)</label>
              <input type="number" value={form.prep_time} min={1}
                onChange={(e) => setForm({...form,prep_time:parseInt(e.target.value)})}
                className="input-field text-sm" />
            </div>
            <div className="flex flex-col justify-end">
              <label className="flex items-center gap-3 cursor-pointer pb-3">
                <div onClick={() => setForm({...form,is_available:!form.is_available})}
                  className={`w-11 h-6 rounded-full transition-colors relative flex-shrink-0 ${form.is_available?"bg-primary":"bg-gray-300"}`}>
                  <span className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${form.is_available?"translate-x-5":"translate-x-0.5"}`} />
                </div>
                <span className="text-sm font-medium text-gray-700">{form.is_available?"Available":"Out of stock"}</span>
              </label>
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button onClick={() => setItemModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSaveItem} disabled={saving} className="btn-primary flex-1">
              {saving ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-check-line"></i>}
              {saving ? "Saving..." : editItem ? "Save Changes" : "Create Item"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Category Modal */}
      <Modal open={catModal} onClose={() => setCatModal(false)} title="Add Category" size="sm">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Category Name</label>
            <input type="text" value={catForm.name} onChange={(e) => setCatForm({...catForm,name:e.target.value})}
              className="input-field text-sm" placeholder="e.g. Burgers" />
          </div>
          <div className="flex gap-3">
            <button onClick={() => setCatModal(false)} className="btn-secondary flex-1">Cancel</button>
            <button onClick={handleSaveCategory} disabled={saving} className="btn-primary flex-1">
              {saving ? <i className="ri-loader-4-line animate-spin"></i> : <i className="ri-check-line"></i>}
              {saving ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
