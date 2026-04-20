const UserFormModal = ({
  show,
  isEdit,
  formData = { name: "", email: "" }, 
  setFormData,
  onClose,
  onSubmit,
}) => {
  if (!show) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = () => {
    if (!formData?.name || !formData?.email) {
      alert("Please fill all fields");
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
              {isEdit ? "Update User" : "Create New User"}
            </h2>
            <p className="text-gray-500 text-xs mt-1">
              {isEdit
                ? "Modify user information"
                : "Add a new member to the system"}
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
          <div>
            <label className="text-xs font-bold text-blue-600 uppercase">
              Full Name
            </label>
            <input
              type="text"
              name="name"
              value={formData?.name || ""} 
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 bg-gray-50 border rounded-xl text-sm"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="text-xs font-bold text-blue-600 uppercase">
              Email Address
            </label>
            <input
              type="email"
              name="email"
              value={formData?.email || ""} 
              onChange={handleChange}
              className="w-full mt-1 px-4 py-3 bg-gray-50 border rounded-xl text-sm"
              placeholder="example@mail.com"
            />
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6 pt-2 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-3 bg-gray-100 rounded-xl text-sm"
          >
            Cancel
          </button>

          <button
            onClick={handleSubmit}
            className="flex-1 py-3 bg-blue-600 text-white rounded-xl text-sm"
          >
            {isEdit ? "Update User" : "Save User"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserFormModal;
