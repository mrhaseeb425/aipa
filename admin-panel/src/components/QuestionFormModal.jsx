import { X } from "lucide-react";

const QuestionFormModal = ({
  show,
  isEdit,
  formData,
  setFormData,
  categories,
  onClose,
  onSubmit,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute right-8 top-8 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="mb-8">
          <h3 className="text-2xl font-bold text-slate-800">
            {isEdit ? "Edit Question" : "Add New Question"}
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            {isEdit
              ? "Update the details of your question"
              : "Create a new assessment question"}
          </p>
        </div>

        <div className="space-y-6">
          <div>
            <label className="text-[11px] font-extrabold text-blue-600 uppercase tracking-[0.2em] ml-1 mb-2 block">
              Question Text
            </label>
            <textarea
              value={formData.question}
              onChange={(e) =>
                setFormData({ ...formData, question: e.target.value })
              }
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all h-32 resize-none text-slate-700 placeholder:text-gray-300"
              placeholder="Enter your question here..."
            />
          </div>

          <div>
            <label className="text-[11px] font-extrabold text-blue-600 uppercase tracking-[0.2em] ml-1 mb-2 block">
              Select Category
            </label>
            <select
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-slate-700 appearance-none cursor-pointer"
            >
              <option value="">Choose a category</option>
              {categories.map((cat) => (
                <option key={cat.id || cat._id} value={cat.id || cat._id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          <button
            onClick={onSubmit}
            className="w-full py-4 bg-blue-600 text-white rounded-2xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/25 mt-4 active:scale-[0.98]"
          >
            {isEdit ? "Update Question" : "Create Question"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionFormModal;
