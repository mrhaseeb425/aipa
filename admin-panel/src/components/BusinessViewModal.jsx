import { X } from "lucide-react";

const BusinessViewModal = ({ show, onClose, business }) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-[32px] shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in duration-300">
        <div className="flex justify-between items-start p-8 pb-4">
          <div>
            <h2 className="text-[24px] font-black text-slate-900">
              Business Details
            </h2>
            <p className="text-gray-400 text-[13px] font-medium mt-1">
              Profile overview for{" "}
              <span className="text-blue-600 font-bold">
                {business?.business_name || "Business"}
              </span>
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            <X size={20} strokeWidth={3} />
          </button>
        </div>

        <div className="p-8 pt-2 space-y-5">
          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Business Name
            </label>
            <div className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-bold text-slate-700">
              {business?.business_name || "Not Available"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Email Address
              </label>
              <div className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-bold text-slate-700 truncate">
                {business?.email || "N/A"}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Phone Number
              </label>
              <div className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-bold text-slate-700">
                {business?.phone_number || "N/A"}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
              Full Address
            </label>
            <div className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-bold text-slate-700">
              {business?.address || "N/A"}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 pb-4">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                State
              </label>
              <div className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-bold text-slate-700">
                {business?.state || "N/A"}
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">
                Zip Code
              </label>
              <div className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-2xl text-[14px] font-bold text-slate-700">
                {business?.zip_code || "N/A"}
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-full py-5 bg-[#1e293b] text-white text-[15px] font-black rounded-2xl hover:bg-slate-800 transition-all shadow-lg"
          >
            Done Reviewing
          </button>
        </div>
      </div>
    </div>
  );
};

export default BusinessViewModal;
