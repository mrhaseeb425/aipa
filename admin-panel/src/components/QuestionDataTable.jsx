const QuestionDataTable = ({
  data = [],
  renderActions,
  onCreateClick,
  loading,
  pagination, // ✅ Added
  onPageChange, // ✅ Added
}) => {
  const { currentPage, totalPages, totalItems, limit } = pagination || {};

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* HEADER */}
        <div className="p-7 flex justify-between items-center border-b border-gray-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Questions Management
            </h2>
            <p className="text-gray-400 text-[13px] mt-0.5">
              Manage your assessment questions and categories
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[13px] text-gray-500 shadow-sm">
              Total Questions:{" "}
              <b className="text-slate-800 font-bold ml-1">
                {totalItems || data.length}
              </b>
            </div>

            <button
              onClick={onCreateClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-xl font-semibold shadow-md shadow-blue-500/20 transition-all active:scale-95 flex items-center gap-2 text-sm"
            >
              <span className="text-xl leading-none">+</span> Create New
            </button>
          </div>
        </div>

        {/* TABLE */}
        <div className="overflow-x-auto">
          <table className="w-full border-collapse">
            <thead>
              <tr className="bg-gray-50/30">
                <th className="text-left py-4 pl-8 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest w-24">
                  ID
                </th>
                <th className="text-left py-4 px-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">
                  Question
                </th>
                <th className="text-left py-4 px-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest w-48">
                  Category
                </th>
                <th className="text-right py-4 pr-8 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest w-28">
                  Actions
                </th>
              </tr>
            </thead>

            <tbody className="divide-y divide-gray-50">
              {loading ? (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-20 text-gray-400 text-sm"
                  >
                    <div className="flex flex-col items-center gap-2">
                      <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                      Loading questions...
                    </div>
                  </td>
                </tr>
              ) : data.length > 0 ? (
                data.map((item, idx) => (
                  <tr
                    key={item.id || idx}
                    className="hover:bg-gray-50/50 transition-colors group"
                  >
                    <td className="py-5 pl-8 text-sm text-gray-400 font-medium">
                      #{(currentPage - 1) * limit + (idx + 1)}
                    </td>

                    <td className="py-5 px-4">
                      <div className="flex items-center gap-4">
                        <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-100 uppercase shadow-sm flex-shrink-0">
                          {item.question?.charAt(0) || "Q"}
                        </div>
                        <span className="font-semibold text-slate-700 text-[14px] line-clamp-1">
                          {item.question}
                        </span>
                      </div>
                    </td>

                    <td className="py-5 px-4">
                      <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[10px] font-bold uppercase tracking-wider border border-blue-100">
                        {item.category_name || "General"}
                      </span>
                    </td>

                    <td className="py-5 pr-8 text-right">
                      {renderActions ? (
                        renderActions(item)
                      ) : (
                        <span className="text-gray-300">•••</span>
                      )}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="4"
                    className="text-center py-24 text-gray-400 text-sm"
                  >
                    No questions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* ✅ NEW PAGINATION FOOTER */}
        {!loading && data.length > 0 && pagination && (
          <div className="p-5 px-8 flex justify-between items-center border-t border-gray-50 bg-gray-50/30">
            <span className="text-[13px] text-gray-500">
              Showing <b>{(currentPage - 1) * limit + 1}</b> to{" "}
              <b>{Math.min(currentPage * limit, totalItems)}</b> of{" "}
              <b>{totalItems}</b> questions
            </span>

            <div className="flex items-center gap-2">
              <button
                disabled={currentPage === 1}
                onClick={() => onPageChange(currentPage - 1)}
                className="p-2 px-4 text-[13px] font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                Previous
              </button>

              <div className="flex gap-1">
                {[...Array(totalPages)].map((_, i) => (
                  <button
                    key={i}
                    onClick={() => onPageChange(i + 1)}
                    className={`w-8 h-8 rounded-lg text-[13px] font-bold transition-all ${
                      currentPage === i + 1
                        ? "bg-blue-600 text-white shadow-md shadow-blue-200"
                        : "text-gray-400 hover:bg-gray-100"
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </div>

              <button
                disabled={currentPage === totalPages}
                onClick={() => onPageChange(currentPage + 1)}
                className="p-2 px-4 text-[13px] font-semibold rounded-lg border border-gray-200 bg-white hover:bg-gray-50 disabled:opacity-50 transition-all"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default QuestionDataTable;
