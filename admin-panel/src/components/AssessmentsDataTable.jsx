import { ChevronLeft, ChevronRight, MoreVertical } from "lucide-react";

const AssessmentDataTable = ({
  data = [],
  renderActions,
  loading,
  onUserClick,
  pagination,
  onPageChange,
}) => {
  const { currentPage, totalPages, totalItems, limit } = pagination || {};

  return (
    <div className="p-8 bg-[#f8f9fa] min-h-screen font-sans">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="p-7 flex justify-between items-center border-b border-gray-50">
          <div>
            <h2 className="text-[22px] font-bold text-slate-800 tracking-tight">
              Assessment Logs
            </h2>
            <p className="text-gray-400 text-[13px] mt-1">
              Review and manage client assessment entries
            </p>
          </div>
          <div className="px-5 py-2.5 bg-gray-50 rounded-xl text-[13px] text-gray-500 font-medium border border-gray-100">
            Total Logs: <b className="text-slate-800 ml-1">{totalItems || 0}</b>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="text-left py-4 pl-8 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest w-20">
                  ID
                </th>
                <th className="text-left py-4 px-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                  Client / Email
                </th>
                <th className="text-left py-4 px-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                  Category
                </th>
                <th className="text-center py-4 px-4 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                  Assigned User
                </th>
                <th className="text-right py-4 pr-8 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest w-24">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-20 text-gray-400">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      <span>Loading assessment logs...</span>
                    </div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item, idx) => {
                  const displayId = pagination
                    ? (currentPage - 1) * limit + (idx + 1)
                    : idx + 1;

                  return (
                    <tr
                      key={item.id || idx}
                      className="hover:bg-gray-50/30 transition-colors group"
                    >
                      <td className="py-6 pl-8 text-[13px] text-gray-400 font-medium">
                        #{item.id || displayId}
                      </td>

                      <td className="py-6 px-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 text-[14px] leading-tight mb-1">
                            {/* FIX: Using user_name from your API */}
                            {item.user_name || "Guest"}
                          </span>
                          <span className="text-[12px] text-gray-400">
                            {/* FIX: Using user_email from your API */}
                            {item.user_email || "N/A"}
                          </span>
                        </div>
                      </td>

                      <td className="py-6 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center text-[11px] font-bold border border-blue-100 uppercase">
                            {item.category_name?.charAt(0) || "G"}
                          </div>
                          <span className="text-[13px] text-slate-600 font-semibold">
                            {item.category_name}
                          </span>
                        </div>
                      </td>

                      <td className="py-6 px-4">
                        <div
                          onClick={() => onUserClick?.(item)}
                          className="flex items-center justify-center gap-2 group/user cursor-pointer"
                        >
                          <div className="w-7 h-7 rounded-full bg-slate-100 text-slate-500 flex items-center justify-center text-[10px] font-bold border border-gray-200 uppercase">
                            {item.user_name?.charAt(0) || "U"}
                          </div>
                          <span className="text-[13px] text-blue-600 font-medium group-hover/user:underline">
                            {item.user_name}
                          </span>
                        </div>
                      </td>

                      <td className="py-6 pr-8 text-right">
                        <div className="flex justify-end">
                          {renderActions ? (
                            renderActions(item)
                          ) : (
                            <button className="p-2 text-gray-300 hover:text-gray-600 transition-colors">
                              <MoreVertical size={18} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-24 text-gray-400 text-sm"
                  >
                    No assessment entries found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {!loading && data.length > 0 && pagination && (
          <div className="p-5 px-8 flex justify-between items-center border-t border-gray-50 bg-gray-50/30">
            <span className="text-[13px] text-gray-500 font-medium">
              Showing <b>{(currentPage - 1) * limit + 1}</b> to{" "}
              <b>{Math.min(currentPage * limit, totalItems)}</b> of{" "}
              <b>{totalItems}</b> entries
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronLeft size={18} className="text-gray-600" />
              </button>

              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => onPageChange(i + 1)}
                    className={`w-9 h-9 rounded-lg text-[13px] font-bold transition-all ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white shadow-lg shadow-blue-200"
                        : "text-gray-400 hover:bg-gray-100 bg-white border border-transparent"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="p-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-30 disabled:cursor-not-allowed"
              >
                <ChevronRight size={18} className="text-gray-600" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AssessmentDataTable;
