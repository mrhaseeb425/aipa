const DashboardStatsCard = ({ title, count, icon, color }) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow duration-300">
      <div>
        <p className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          {title}
        </p>

        <h3 className="text-3xl font-bold mt-1 text-gray-800">
          {(count || 0).toLocaleString()}
        </h3>
      </div>

      <div className={`${color} p-3 rounded-xl text-white shadow-lg`}>
        {icon}
      </div>
    </div>
  );
};

export default DashboardStatsCard;
