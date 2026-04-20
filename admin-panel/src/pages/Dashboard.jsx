import axios from "axios";
import {
  Briefcase,
  FileText,
  HelpCircle,
  LayoutGrid,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";
import DashboardGraph from "../components/DashboardGraph";
import DashboardStatsCard from "../components/DashboardStatsCard";

const Dashboard = () => {
  const [stats, setStats] = useState({
    users: 0,
    categories: 0,
    questions: 0,
    assessments: 0,
    businesses: 0,
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(
          "http://localhost:5000/dashboard-stats",
        );

        const data = response.data || {};

        setStats({
          users: Number(data.users || 0),
          categories: Number(data.categories || 0),
          questions: Number(data.questions || 0),
          assessments: Number(data.assessments || 0),
          businesses: Number(data.businesses || data.business || 0),
        });
      } catch (error) {
        console.error("Dashboard Error:", error?.message);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const chartData = [
    { name: "Users", total: stats.users || 0 },
    { name: "Categories", total: stats.categories || 0 },
    { name: "Questions", total: stats.questions || 0 },
    { name: "Assessments", total: stats.assessments || 0 },
    { name: "Businesses", total: stats.businesses || 0 },
  ];

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-500">Loading Dashboard...</div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-800">Dashboard Overview</h1>
        {/* <p className="text-gray-500">AIPE Admin Panel</p> */}
      </div>

      {/* STATS CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-10">
        <DashboardStatsCard
          title="Users"
          count={stats.users}
          icon={<Users size={24} />}
          color="bg-blue-600"
        />
        <DashboardStatsCard
          title="Categories"
          count={stats.categories}
          icon={<LayoutGrid size={24} />}
          color="bg-green-600"
        />
        <DashboardStatsCard
          title="Questions"
          count={stats.questions}
          icon={<HelpCircle size={24} />}
          color="bg-purple-600"
        />
        <DashboardStatsCard
          title="Assessments"
          count={stats.assessments}
          icon={<FileText size={24} />}
          color="bg-orange-600"
        />
        <DashboardStatsCard
          title="Businesses"
          count={stats.businesses}
          icon={<Briefcase size={24} />}
          color="bg-red-600"
        />
      </div>

      {/* GRAPH */}
      <DashboardGraph data={chartData} />
    </div>
  );
};

export default Dashboard;
