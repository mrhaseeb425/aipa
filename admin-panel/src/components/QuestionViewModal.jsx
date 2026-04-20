import { X } from "lucide-react";

const QuestionViewModal = ({ show, question, onClose }) => {
  if (!show || !question) return null;

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-md p-10 shadow-2xl relative">
        
        <button 
          onClick={onClose} 
          className="absolute right-8 top-8 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        {/* Header */}
        <div className="mb-8">
          <h3 className="text-2xl font-bold text-slate-800">Question Details</h3>
          <p className="text-gray-400 text-sm mt-1">Full information about this assessment item</p>
        </div>

        <div className="space-y-6">
          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <label className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block mb-1">
              Question ID
            </label>
            <p className="text-slate-700 font-mono font-bold">#{question.id}</p>
          </div>

          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <label className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block mb-1">
              The Question
            </label>
            <p className="text-slate-700 leading-relaxed font-medium">
              {question.text || question.question}
            </p>
          </div>

          <div className="bg-gray-50 p-5 rounded-2xl border border-gray-100">
            <label className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest block mb-1">
              Assigned Category
            </label>
            <div className="mt-2">
              <span className="px-4 py-1.5 bg-blue-100 text-blue-700 rounded-full text-[11px] font-bold uppercase tracking-wider">
                {question.category_name || "General"}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-4 bg-slate-800 text-white rounded-2xl font-bold hover:bg-slate-900 transition-all mt-4"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

export default QuestionViewModal;