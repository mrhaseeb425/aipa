import { X } from "lucide-react";

const AssessmentViewModal = ({ show, log, onClose }) => {
  if (!show || !log) return null;

  // Styling helper for consistency
  const DetailItem = ({ label, value, blue, fullWidth }) => (
    <div
      className={`p-4 rounded-2xl border border-gray-100 ${
        blue ? "bg-blue-50/50 border-blue-100" : "bg-gray-50"
      } ${fullWidth ? "md:col-span-2" : ""}`}
    >
      <p
        className={`text-[10px] font-extrabold uppercase tracking-widest mb-1 ${
          blue ? "text-blue-500" : "text-gray-400"
        }`}
      >
        {label}
      </p>
      <p
        className={`text-sm font-bold ${blue ? "text-blue-700" : "text-slate-700"}`}
      >
        {value || "Not Provided"}
      </p>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[9999] p-4">
      <div className="bg-white rounded-[2.5rem] w-full max-w-2xl p-10 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-8 top-8 text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={24} />
        </button>

        <div className="mb-8">
          <h3 className="text-2xl font-bold text-slate-800">
            Assessment Details
          </h3>
          <p className="text-gray-400 text-sm mt-1 font-medium">
            Reviewing report for entry #{log.id}
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Direct mapping to Postman response keys */}
          <DetailItem label="Client Name" value={log.user_name} />
          <DetailItem label="Email" value={log.user_email} />

          <DetailItem label="Phone" value={log.phone} />
          <DetailItem label="Zip Code" value={log.zip_code} />

          <DetailItem label="Address" value={log.address} fullWidth />

          {/* Question Section - Mapped to question_text */}
          <div className="md:col-span-2 bg-slate-900 text-white p-5 rounded-2xl shadow-lg border border-slate-700">
            <p className="text-[10px] font-extrabold text-slate-400 uppercase tracking-widest mb-2">
              Question
            </p>
            <p className="text-sm font-medium leading-relaxed italic">
              "{log.question_text || "No Question Provided"}"
            </p>
          </div>

          <DetailItem label="Answer" value={log.answer} blue />
          <DetailItem label="Category" value={log.category_name} />

          <DetailItem label="Score" value={log.score?.toString()} />
          <DetailItem label="Notes" value={log.notes} fullWidth />
        </div>

        <button
          onClick={onClose}
          className="w-full py-4 bg-slate-900 text-white rounded-[1.2rem] font-bold hover:bg-slate-800 transition-all mt-8"
        >
          Close Preview
        </button>
      </div>
    </div>
  );
};

export default AssessmentViewModal;
