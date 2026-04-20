const CategoryFormModal = ({
  show,
  isEdit,
  formData = { name: "" },
  setFormData,
  onClose,
  onSubmit,
  categoriesList = [], 
}) => {
  if (!show) return null;

  const handleSubmit = () => {
    if (!formData?.name) {
      alert("Please select category name");
      return;
    }

    onSubmit();
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              {isEdit ? "Update Category" : "Create New Category"}
            </h2>
            <p className="text-gray-500 text-xs mt-1">
              Select category from list
            </p>
          </div>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 p-2 hover:bg-gray-100 rounded-full"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-blue-600 uppercase tracking-widest ml-1">
              Category Name
            </label>

            <select
              value={formData?.name || ""}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl 
              focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 
              transition-all text-sm text-slate-700"
            >
              <option value="">Select Category</option>

              {categoriesList.map((cat, index) => (
                <option key={index} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 pt-2 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-600 font-bold rounded-2xl"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="flex-1 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-2xl"
          >
            {isEdit ? "Update Category" : "Save Category"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryFormModal;
