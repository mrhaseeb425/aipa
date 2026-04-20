import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import CategoryTable from "../components/CategoryDataTable";
import CategoryFormModal from "../components/CategoryFormModal";
import CategoryViewModal from "../components/CategoryViewModal";
import TaskTableActions from "../components/TaskTableActions";

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({ name: "" });

  const API_BASE_URL = "http://localhost:5000/categories/all";

  const fetchCategories = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        if (!token) {
          console.error("No token found");
          setLoading(false);
          return;
        }

        const res = await axios.get(
          `${API_BASE_URL}?page=${page}&limit=${pagination.limit}`,
          { headers: { Authorization: `Bearer ${token}` } },
        );

        console.log("API FULL RESPONSE:", res.data);

        if (res.data && res.data.success) {
          const categoryData = res.data.categories || res.data.data || [];
          setCategories(categoryData);

          const totalCount =
            res.data.pagination?.totalItems || categoryData.length || 0;
          const totalPages =
            res.data.pagination?.totalPages ||
            Math.ceil(totalCount / pagination.limit);

          setPagination((prev) => ({
            ...prev,
            currentPage: page,
            totalItems: totalCount,
            totalPages: totalPages || 1,
          }));
        }
      } catch (err) {
        console.error(
          "Fetch error details:",
          err.response?.data || err.message,
        );
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit],
  );

  useEffect(() => {
    fetchCategories(pagination.currentPage);
  }, [fetchCategories, pagination.currentPage]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem("token");
      await axios.delete(`http://localhost:5000/delete-category/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchCategories(pagination.currentPage);
    } catch (err) {
      alert("Delete failed");
    }
  };

  const handleCreateOrUpdate = () => {
    setShowFormModal(false);
    fetchCategories(1);
  };

  return (
    <div className="p-4 bg-gray-50 min-h-screen font-sans">
      <CategoryTable
        data={categories}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onCreateClick={() => {
          setSelectedCategory(null);
          setIsEdit(false);
          setFormData({ name: "" });
          setShowFormModal(true);
        }}
        renderActions={(item) => (
          <TaskTableActions
            onShow={() => {
              setSelectedCategory(item);
              setShowViewModal(true);
            }}
            onEdit={() => {
              setSelectedCategory(item);
              setFormData({ name: item.name });
              setIsEdit(true);
              setShowFormModal(true);
            }}
            onDelete={() => handleDelete(item._id || item.id)}
          />
        )}
      />

      <CategoryFormModal
        show={showFormModal}
        isEdit={isEdit}
        formData={formData}
        setFormData={setFormData}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleCreateOrUpdate}
      />

      <CategoryViewModal
        show={showViewModal}
        category={selectedCategory}
        onClose={() => setShowViewModal(false)}
      />
    </div>
  );
};

export default Categories;
