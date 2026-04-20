import axios from "axios";
import { Eye, MoreVertical, Pencil, Plus, Trash2 } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import BusinessDataTable from "../components/BusinessDataTable.jsx";
import BusinessFormModal from "../components/BusinessFormModel.jsx";
import BusinessViewModal from "../components/BusinessViewModal.jsx";

const BusinessList = () => {
  const [businesses, setBusinesses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedBusiness, setSelectedBusiness] = useState(null);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showFormModal, setShowFormModal] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);

  const API_BASE = "http://localhost:5000";

  const fetchBusinesses = useCallback(async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/getAllBusinesses`);
      setBusinesses(res.data?.data || []);
    } catch (err) {
      console.error("Fetch Error:", err);
      setBusinesses([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBusinesses();
  }, [fetchBusinesses]);

  const handleOpenCreate = () => {
    setSelectedBusiness({
      business_name: "",
      email: "",
      phone_number: "",
      address: "",
      state: "",
      zip_code: "",
    });
    setIsEditMode(false);
    setShowFormModal(true);
    setOpenDropdown(null);
  };

  const handleOpenEdit = (biz) => {
    setSelectedBusiness({ ...biz });
    setIsEditMode(true);
    setShowFormModal(true);
    setOpenDropdown(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      await axios.delete(`${API_BASE}/deleteBusiness/${id}`);
      fetchBusinesses();
      setOpenDropdown(null);
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="p-8 bg-[#f8f9fa] min-h-screen">
      <div className="max-w-7xl mx-auto">
        <div className="bg-white rounded-t-2xl p-8 flex justify-between items-center shadow-sm border border-gray-100">
          <h2 className="text-[26px] font-black text-slate-900">
            Business Management
          </h2>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 px-6 py-3.5 bg-blue-600 text-white rounded-xl font-bold"
          >
            <Plus size={20} /> Create Business
          </button>
        </div>

        <div className="bg-white rounded-b-2xl border-x border-b border-gray-100 shadow-sm overflow-hidden">
          <BusinessDataTable
            data={businesses}
            loading={loading}
            renderActions={(biz) => (
              <div className="relative flex justify-end px-4">
                <button
                  onClick={() =>
                    setOpenDropdown(openDropdown === biz.id ? null : biz.id)
                  }
                  className="p-2 text-gray-400"
                >
                  <MoreVertical size={20} />
                </button>
                {openDropdown === biz.id && (
                  <div className="absolute right-0 top-10 bg-white shadow-2xl border border-gray-100 rounded-2xl w-52 z-20 py-3">
                    <button
                      onClick={() => {
                        setSelectedBusiness(biz);
                        setShowViewModal(true);
                        setOpenDropdown(null);
                      }}
                      className="flex items-center gap-3 px-5 py-3 w-full text-[13px] font-bold hover:bg-gray-50"
                    >
                      <Eye size={16} className="text-blue-500" /> Details
                    </button>
                    <button
                      onClick={() => handleOpenEdit(biz)}
                      className="flex items-center gap-3 px-5 py-3 w-full text-[13px] font-bold hover:bg-gray-50"
                    >
                      <Pencil size={16} className="text-amber-500" /> Edit
                    </button>
                    <button
                      onClick={() => handleDelete(biz.id)}
                      className="flex items-center gap-3 px-5 py-3 w-full text-[13px] font-bold text-red-500 hover:bg-red-50"
                    >
                      <Trash2 size={16} /> Delete
                    </button>
                  </div>
                )}
              </div>
            )}
          />
        </div>

        <BusinessFormModal
          show={showFormModal}
          onClose={() => setShowFormModal(false)}
          formData={selectedBusiness}
          setFormData={setSelectedBusiness}
          isEditMode={isEditMode}
          onSubmit={fetchBusinesses}
        />
        <BusinessViewModal
          show={showViewModal}
          onClose={() => setShowViewModal(false)}
          business={selectedBusiness}
        />
      </div>
    </div>
  );
};

export default BusinessList;
