import { X } from "lucide-react";

const BusinessFormModal = ({
  show,
  onClose,
  selectedBusiness,
  setSelectedBusiness,
  isEditMode,
  isCreateModalOpen,
  onSubmit,
}) => {
  if (!show) return null;

  const inputClass =
    "w-full px-4 py-3 bg-gray-50 border border-gray-100 rounded-xl mt-1.5 focus:bg-white focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none text-[14px]";
  const labelClass =
    "text-[10px] font-bold text-gray-400 uppercase tracking-wider ml-1";

  const isDisabled = !isEditMode && !isCreateModalOpen;

  return (
    <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-[2px] flex items-center justify-center z-[999] p-4 animate-in fade-in duration-300">
      <div className="bg-white rounded-[28px] w-full max-w-lg shadow-2xl overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
        {/* Modal Header */}
        <div className="flex justify-between items-center p-8 border-b border-gray-50">
          <div>
            <h3 className="text-xl font-bold text-slate-800">
              {isEditMode
                ? "Edit Business"
                : isCreateModalOpen
                  ? "Create New Business"
                  : "Business Details"}
            </h3>
            {!isEditMode && !isCreateModalOpen && (
              <p className="text-[12px] text-gray-400 mt-0.5">
                Profile overview for {selectedBusiness?.business_name}
              </p>
            )}
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full text-gray-400 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-8 space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="md:col-span-2">
              <label className={labelClass}>Business Name</label>
              <input
                className={inputClass}
                disabled={isDisabled}
                placeholder="Enter business name"
                value={selectedBusiness?.business_name || ""}
                onChange={(e) =>
                  setSelectedBusiness({
                    ...selectedBusiness,
                    business_name: e.target.value,
                  })
                }
                required
              />
            </div>

            {/* Email Address */}
            <div>
              <label className={labelClass}>Email Address</label>
              <input
                type="email"
                className={inputClass}
                disabled={isDisabled}
                placeholder="email@business.com"
                value={selectedBusiness?.email || ""}
                onChange={(e) =>
                  setSelectedBusiness({
                    ...selectedBusiness,
                    email: e.target.value,
                  })
                }
                required
              />
            </div>

            {/* Phone Number */}
            <div>
              <label className={labelClass}>Phone Number</label>
              <input
                className={inputClass}
                disabled={isDisabled}
                placeholder="+1 234 567 890"
                value={selectedBusiness?.phone_number || ""}
                onChange={(e) =>
                  setSelectedBusiness({
                    ...selectedBusiness,
                    phone_number: e.target.value,
                  })
                }
              />
            </div>

            {/* Address */}
            <div className="md:col-span-2">
              <label className={labelClass}>Full Address</label>
              <input
                className={inputClass}
                disabled={isDisabled}
                placeholder="Street address, Suite, etc."
                value={selectedBusiness?.address || ""}
                onChange={(e) =>
                  setSelectedBusiness({
                    ...selectedBusiness,
                    address: e.target.value,
                  })
                }
              />
            </div>

            {/* State */}
            <div>
              <label className={labelClass}>State</label>
              <input
                className={inputClass}
                disabled={isDisabled}
                placeholder="State / Province"
                value={selectedBusiness?.state || ""}
                onChange={(e) =>
                  setSelectedBusiness({
                    ...selectedBusiness,
                    state: e.target.value,
                  })
                }
              />
            </div>

            {/* Zip Code */}
            <div>
              <label className={labelClass}>Zip Code</label>
              <input
                className={inputClass}
                disabled={isDisabled}
                placeholder="Zip Code"
                value={selectedBusiness?.zip_code || ""}
                onChange={(e) =>
                  setSelectedBusiness({
                    ...selectedBusiness,
                    zip_code: e.target.value,
                  })
                }
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-4">
            {isEditMode || isCreateModalOpen ? (
              <button
                type="submit"
                className="w-full py-3.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200"
              >
                {isCreateModalOpen ? "Register Business" : "Update Profile"}
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="w-full py-3.5 bg-slate-800 text-white rounded-xl font-bold hover:bg-slate-900 transition-all"
              >
                Done Reviewing
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default BusinessFormModal;
