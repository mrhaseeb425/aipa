import { X } from "lucide-react";

const AssessmentFormModal = ({
  show,
  isEdit,
  formData,
  setFormData,
  categories,
  questions,
  onClose,
  onSubmit,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-3xl p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-8 top-8 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="mb-8">
          <h3 className="text-2xl font-bold text-slate-800">
            {isEdit ? "Assessment Details" : "Create New Assessment"}
          </h3>
          <p className="text-gray-400 text-sm mt-1">
            Reviewing details for the selected assessment entry.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* CLIENT NAME - Fixed Key to user_name */}
          <div className="bg-gray-50 p-1 rounded-2xl border border-gray-100">
            <label className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest ml-4 mt-2 block">
              Client Name
            </label>
            <input
              type="text"
              value={formData.user_name || ""}
              onChange={(e) =>
                setFormData({ ...formData, user_name: e.target.value })
              }
              className="w-full px-4 pb-3 bg-transparent outline-none text-slate-700 font-medium"
              placeholder="e.g. Ali"
            />
          </div>

          {/* EMAIL - Fixed Key to user_email */}
          <div className="bg-gray-50 p-1 rounded-2xl border border-gray-100">
            <label className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest ml-4 mt-2 block">
              Email
            </label>
            <input
              type="email"
              value={formData.user_email || ""}
              onChange={(e) =>
                setFormData({ ...formData, user_email: e.target.value })
              }
              className="w-full px-4 pb-3 bg-transparent outline-none text-slate-700 font-medium"
              placeholder="ali@aipe.com"
            />
          </div>

          {/* CATEGORY - Fixed Key to category_name */}
          <div className="bg-gray-50 p-1 rounded-2xl border border-gray-100">
            <label className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest ml-4 mt-2 block">
              Category
            </label>
            <select
              value={formData.category_name || ""}
              onChange={(e) =>
                setFormData({ ...formData, category_name: e.target.value })
              }
              className="w-full px-4 pb-3 bg-transparent outline-none text-slate-700 font-medium appearance-none cursor-pointer"
            >
              <option value="">
                {formData.category_name || "Select Category"}
              </option>
              {categories?.map((cat) => (
                <option key={cat.id} value={cat.name}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* QUESTION - Fixed Key to question_text */}
          <div className="md:col-span-2 bg-slate-50 p-1 rounded-2xl border border-slate-200">
            <label className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest ml-4 mt-2 block">
              Question
            </label>
            <textarea
              value={formData.question_text || ""}
              onChange={(e) =>
                setFormData({ ...formData, question_text: e.target.value })
              }
              className="w-full px-4 pb-3 bg-transparent outline-none text-slate-600 font-medium h-20 resize-none"
              placeholder="Question details..."
            />
          </div>

          {/* ANSWER */}
          <div className="md:col-span-2 bg-blue-50/50 p-1 rounded-2xl border border-blue-100">
            <label className="text-[10px] font-extrabold text-blue-500 uppercase tracking-widest ml-4 mt-2 block">
              Answer
            </label>
            <input
              type="text"
              value={formData.answer || ""}
              onChange={(e) =>
                setFormData({ ...formData, answer: e.target.value })
              }
              className="w-full px-4 pb-3 bg-transparent outline-none text-blue-700 font-bold text-lg"
              placeholder="No / Yes"
            />
          </div>

          {/* SCORE (Optional, but in your API) */}
          <div className="bg-gray-50 p-1 rounded-2xl border border-gray-100">
            <label className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest ml-4 mt-2 block">
              Score
            </label>
            <input
              type="text"
              value={formData.score !== undefined ? formData.score : ""}
              onChange={(e) =>
                setFormData({ ...formData, score: e.target.value })
              }
              className="w-full px-4 pb-3 bg-transparent outline-none text-slate-700 font-medium"
              placeholder="0"
            />
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onSubmit}
          className="w-full py-4 bg-blue-600 text-white rounded-[1.2rem] font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 mt-8 active:scale-[0.98]"
        >
          {isEdit ? "Update Details" : "Close Details"}
        </button>
      </div>
    </div>
  );
};

export default AssessmentFormModal;
