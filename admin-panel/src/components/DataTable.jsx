const UsersTable = ({
  data = [],
  renderActions,
  onCreateClick,
  pagination = {},
  onPageChange,
}) => {
  const {
    currentPage = 1,
    totalPages = 1,
    totalUsers = 0,
    limit = 10,
  } = pagination;

  // Range calculate karne ke liye logic
  const startRange = totalUsers === 0 ? 0 : (currentPage - 1) * limit + 1;
  const endRange = Math.min(currentPage * limit, totalUsers);

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans text-slate-900">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        {/* HEADER SECTION */}
        <div className="p-6 pb-6 flex justify-between items-center border-b border-gray-50">
          <div>
            <h2 className="text-xl font-bold text-slate-800">
              Users Management
            </h2>
            <p className="text-gray-500 text-sm mt-0.5">
              Manage your application users and their credentials
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="px-4 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-sm text-gray-600">
              Total Users: <b className="text-slate-800">{totalUsers}</b>
            </div>
            <button
              onClick={onCreateClick}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-medium shadow-sm transition-all active:scale-95 flex items-center gap-2"
            >
              <span className="text-lg">+</span> Create New
            </button>
          </div>
        </div>

        {/* TABLE SECTION */}
        <div className="overflow-x-auto">
          <table className="w-full border-separate border-spacing-0">
            <thead className="bg-gray-50/50">
              <tr>
                <th className="text-left p-4 pl-8 text-[11px] font-bold text-gray-400 uppercase border-b">
                  ID
                </th>
                <th className="text-left p-4 text-[11px] font-bold text-gray-400 uppercase border-b">
                  User Name
                </th>
                <th className="text-left p-4 text-[11px] font-bold text-gray-400 uppercase border-b">
                  Email Address
                </th>
                <th className="text-left p-4 text-[11px] font-bold text-gray-400 uppercase border-b">
                  Registration Date
                </th>
                <th className="text-right p-4 pr-8 text-[11px] font-bold text-gray-400 uppercase border-b">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {data.length > 0 ? (
                data.map((item, idx) => (
                  <tr
                    key={item.id || item._id || idx}
                    className="hover:bg-gray-50/30 transition-colors"
                  >
                    <td className="p-4 pl-8 text-sm text-gray-400">
                      #{(currentPage - 1) * limit + (idx + 1)}
                    </td>
                    <td className="p-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[10px] border border-blue-100">
                          {item?.name?.charAt(0)?.toUpperCase() || "U"}
                        </div>
                        <span className="font-semibold text-slate-700 text-sm">
                          {item?.name || "No Name"}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-sm text-gray-600">
                      {item?.email || "-"}
                    </td>
                    <td className="p-4 text-sm text-gray-400">
                      {item?.createdAt
                        ? new Date(item.createdAt).toLocaleDateString("en-GB")
                        : "17/04/2026"}
                    </td>
                    <td className="p-4 pr-8 text-right">
                      {renderActions ? renderActions(item) : null}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td
                    colSpan="5"
                    className="text-center py-20 text-gray-400 text-sm italic"
                  >
                    No users found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* IMPROVED PAGINATION FOOTER */}
        <div className="p-5 px-8 bg-white border-t border-gray-100 flex items-center justify-between">
          {/* Left Side: Showing Status */}
          <div className="text-sm text-gray-500">
            Showing{" "}
            <span className="font-bold text-slate-700">{startRange}</span> to{" "}
            <span className="font-bold text-slate-700">{endRange}</span> of{" "}
            <span className="font-bold text-slate-700">{totalUsers}</span> users
          </div>

          {/* Right Side: Navigation Buttons */}
          <div className="flex items-center gap-2">
            {/* First Page */}
            <button
              onClick={() => onPageChange(1)}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-20 transition-all"
              title="First Page"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
            </button>

            {/* Previous Page */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-20 transition-all"
              title="Previous"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M15 19l-7-7 7-7" />
              </svg>
            </button>

            {/* Numeric Buttons */}
            <div className="flex items-center gap-1 mx-1">
              {[...Array(totalPages)].map((_, i) => {
                const pageNum = i + 1;
                // Sirf current page ke nazdeek wale numbers dikhane ke liye (Optional improvement)
                if (
                  totalPages > 5 &&
                  Math.abs(currentPage - pageNum) > 1 &&
                  pageNum !== 1 &&
                  pageNum !== totalPages
                ) {
                  if (pageNum === 2 || pageNum === totalPages - 1)
                    return (
                      <span key={pageNum} className="px-1 text-gray-300">
                        ...
                      </span>
                    );
                  return null;
                }
                return (
                  <button
                    key={pageNum}
                    onClick={() => onPageChange(pageNum)}
                    className={`w-9 h-9 flex items-center justify-center rounded-xl text-sm font-bold transition-all shadow-sm ${
                      currentPage === pageNum
                        ? "bg-blue-600 text-white border border-blue-600 scale-105"
                        : "bg-white text-gray-500 border border-gray-100 hover:border-blue-200 hover:text-blue-600"
                    }`}
                  >
                    {pageNum}
                  </button>
                );
              })}
            </div>

            {/* Next Page */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-20 transition-all"
              title="Next"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M9 5l7 7-7 7" />
              </svg>
            </button>

            {/* Last Page */}
            <button
              onClick={() => onPageChange(totalPages)}
              disabled={currentPage === totalPages}
              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg disabled:opacity-20 transition-all"
              title="Last Page"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                viewBox="0 0 24 24"
              >
                <path d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UsersTable;
