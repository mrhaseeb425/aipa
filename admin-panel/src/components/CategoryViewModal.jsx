const CategoryViewModal = ({ show, user, onClose }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* HEADER */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100">
          <h2 className="text-xl font-bold text-slate-800">User Details</h2>

          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        {/* BODY */}
        <div className="p-6 space-y-4">
          <div className="bg-gray-50 p-4 rounded-2xl">
            <label className="text-xs text-blue-600 font-bold">User ID</label>
            <p>{user?.id || user?._id || "N/A"}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl">
            <label className="text-xs text-blue-600 font-bold">Full Name</label>
            <p>{user?.name || "No Name"}</p>
          </div>

          <div className="bg-gray-50 p-4 rounded-2xl">
            <label className="text-xs text-blue-600 font-bold">Email</label>
            <p>{user?.email || "-"}</p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-6">
          <button
            onClick={onClose}
            className="w-full bg-gray-100 py-3 rounded-xl"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryViewModal;
