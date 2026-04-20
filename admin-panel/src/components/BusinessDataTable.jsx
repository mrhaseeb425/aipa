import { MoreVertical } from "lucide-react";

const BusinessDataTable = ({
  data = [],
  loading,
  renderActions,
  currentPage = 1, 
  itemsPerPage = 10, 
}) => {
  return (
    <div className="bg-white shadow-sm border-t border-gray-100 overflow-hidden">
      <table className="w-full border-collapse text-left">
        <thead>
          <tr className="border-b border-gray-100 bg-gray-50/30">
            <th className="py-4 pl-8 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest w-20">
              ID
            </th>
            <th className="py-4 px-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
              Business Profile
            </th>
            <th className="py-4 px-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest text-center">
              Contact Email
            </th>
            <th className="py-4 pr-8 text-right text-[10px] font-extrabold text-gray-400 uppercase tracking-widest w-24">
              Actions
            </th>
          </tr>
        </thead>

        <tbody className="divide-y divide-gray-50">
          {loading ? (
            <tr>
              <td colSpan="4" className="py-20 text-center">
                <div className="w-8 h-8 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" />
                <p className="text-[12px] text-gray-400 mt-2 font-medium">
                  Fetching records...
                </p>
              </td>
            </tr>
          ) : data.length > 0 ? (
            data.map((biz, idx) => {
              const rowId = (currentPage - 1) * itemsPerPage + (idx + 1);

              return (
                <tr
                  key={biz.id || biz._id}
                  className="hover:bg-gray-50/50 transition-colors group"
                >
                  {/* Serial Number */}
                  <td className="py-5 pl-8 text-[13px] text-gray-400 font-bold">
                    #{rowId}
                  </td>

                  <td className="py-5 px-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center text-[13px] font-black border border-blue-100 uppercase shadow-sm">
                        {biz.business_name?.charAt(0) || "B"}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-bold text-slate-800 text-[14px] leading-tight">
                          {biz.business_name || "N/A"}
                        </span>
                        <span className="text-[11px] text-gray-400 font-medium">
                          {biz.state || "No Location"}
                        </span>
                      </div>
                    </div>
                  </td>

                  {/* Email */}
                  <td className="py-5 px-4 text-center">
                    <span className="text-[12px] text-slate-600 font-semibold bg-gray-50 px-3 py-1.5 rounded-lg border border-gray-100">
                      {biz.email || "-"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="py-5 pr-8 text-right">
                    {renderActions ? (
                      renderActions(biz)
                    ) : (
                      <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-300 transition-colors">
                        <MoreVertical size={18} />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })
          ) : (
            <tr>
              <td colSpan="4" className="py-24 text-center">
                <div className="bg-gray-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-dashed border-gray-200">
                  <span className="text-gray-300 text-xl font-bold">!</span>
                </div>
                <p className="text-gray-400 text-[14px] font-medium">
                  No business records found.
                </p>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default BusinessDataTable;
