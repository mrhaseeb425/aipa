const CategoryTable = ({
  data = [],
  pagination,
  onPageChange,
  renderActions,
  onCreateClick,
}) => {
  const {
    currentPage = 1,
    totalPages = 1,
    totalItems = 0,
    limit = 10,
  } = pagination || {};

  const startRange = totalItems === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endRange = Math.min(currentPage * limit, totalItems);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden font-sans">
      {/* HEADER */}
      <div className="p-7 flex justify-between items-center border-b border-gray-50">
        <div>
          <h2 className="text-xl font-bold text-slate-800">
            Categories Management
          </h2>
          <p className="text-gray-400 text-[13px] mt-0.5">
            Manage your application categories and hierarchy
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="px-4 py-2 bg-white border border-gray-100 rounded-xl text-[13px] text-gray-500 shadow-sm">
            Total Categories:{" "}
            <b className="text-slate-800 font-bold ml-1">{totalItems}</b>
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
            <tr className="bg-gray-50/50">
              <th className="text-left py-4 pl-8 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest w-24">
                ID
              </th>
              <th className="text-left py-4 px-4 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">
                Categories
              </th>
              <th className="py-4 px-4 text-center text-[11px] font-extrabold text-gray-400 uppercase tracking-widest">
                Status
              </th>
              <th className="text-right py-4 pr-8 text-[11px] font-extrabold text-gray-400 uppercase tracking-widest w-28">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-gray-50">
            {data.length > 0 ? (
              data.map((item, idx) => (
                <tr
                  key={item.id || item._id || idx}
                  className="hover:bg-gray-50/30 transition-colors group"
                >
                  {/* Global ID calculation */}
                  <td className="py-5 pl-8 text-sm text-gray-400 font-medium">
                    #{(currentPage - 1) * limit + (idx + 1)}
                  </td>

                  <td className="py-5 px-4">
                    <div className="flex items-center gap-4">
                      <div className="w-9 h-9 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs border border-blue-100 uppercase shadow-sm">
                        {item?.name?.charAt(0) || "C"}
                      </div>
                      <span className="font-semibold text-slate-700 text-[14px]">
                        {item?.name}
                      </span>
                    </div>
                  </td>

                  <td className="py-5 px-4 text-center text-gray-300">-</td>

                  <td className="py-5 pr-8 text-right">
                    {renderActions ? (
                      renderActions(item)
                    ) : (
                      <button className="text-gray-300 hover:text-gray-600 font-bold tracking-tighter text-lg">
                        •••
                      </button>
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
                  No categories found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* FOOTER - Updated as per Image */}
      <div className="p-5 px-8 bg-white border-t border-gray-100 flex items-center justify-between">
        <div className="text-sm text-gray-500 font-medium">
          Showing <span className="text-slate-900 font-bold">{startRange}</span>{" "}
          to <span className="text-slate-900 font-bold">{endRange}</span> of{" "}
          <span className="text-slate-900 font-bold">{totalItems}</span> users
        </div>

        <div className="flex items-center gap-2">
          {/* Double Left Arrow */}
          <button
            onClick={() => onPageChange(1)}
            disabled={currentPage === 1}
            className="p-1 text-gray-300 hover:text-blue-600 disabled:opacity-30"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            </svg>
          </button>

          {/* Single Left Arrow */}
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="p-1 text-gray-300 hover:text-blue-600 disabled:opacity-30 mr-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          {/* Page Numbers - Blue Circle Style */}
          <div className="flex items-center gap-1.5">
            {[...Array(totalPages)].map((_, i) => (
              <button
                key={i + 1}
                onClick={() => onPageChange(i + 1)}
                className={`w-8 h-8 flex items-center justify-center rounded-full text-xs font-bold transition-all ${
                  currentPage === i + 1
                    ? "bg-blue-600 text-white shadow-md shadow-blue-100"
                    : "text-gray-400 hover:bg-gray-100"
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>

          {/* Single Right Arrow */}
          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="p-1 text-gray-300 hover:text-blue-600 disabled:opacity-30 ml-2"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Double Right Arrow */}
          <button
            onClick={() => onPageChange(totalPages)}
            disabled={currentPage === totalPages}
            className="p-1 text-gray-300 hover:text-blue-600 disabled:opacity-30"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              viewBox="0 0 24 24"
            >
              <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryTable;
