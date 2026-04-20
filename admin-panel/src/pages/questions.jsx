import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import DataTable from "../components/QuestionDataTable";
import QuestionFormModal from "../components/QuestionFormModal";
import QuestionViewModal from "../components/QuestionViewModal";
import TaskTableActions from "../components/TaskTableActions";

const Questions = () => {
  const [questions, setQuestions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // ✅ Pagination state add ki hai
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  const [selectedQuestion, setSelectedQuestion] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({
    id: "",
    question: "",
    category_id: "",
  });

  const API_URL = "http://localhost:5000";

  const fetchData = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const token = localStorage.getItem("token");

        const [quesRes, catRes] = await Promise.all([
          axios.get(
            `${API_URL}/getAllQuestions?page=${page}&limit=${pagination.limit}`,
            {
              headers: { Authorization: `Bearer ${token}` },
            },
          ),
          axios.get(`${API_URL}/categories`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        // ✅ Backend ke 'data' aur 'pagination' keys ko handle kiya
        if (quesRes.data?.success) {
          setQuestions(quesRes.data.data || []);
          setPagination({
            currentPage: quesRes.data.pagination.currentPage,
            totalPages: quesRes.data.pagination.totalPages,
            totalItems: quesRes.data.pagination.totalItems,
            limit: quesRes.data.pagination.limit,
          });
        }

        setCategories(catRes.data?.categories || catRes.data?.data || []);
      } catch (err) {
        console.error("Fetch Error:", err);
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit],
  );

  useEffect(() => {
    fetchData(pagination.currentPage);
  }, [fetchData, pagination.currentPage]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this question?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await axios.delete(`${API_URL}/deleteQuestion/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) fetchData(pagination.currentPage);
    } catch (err) {
      alert("Delete failed!");
    }
  };

  const handleSubmit = async () => {
    try {
      const token = localStorage.getItem("token");
      const payload = {
        question: formData.question,
        category_id: Number(formData.category_id),
      };

      if (isEdit) {
        await axios.put(`${API_URL}/update-question/${formData.id}`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      } else {
        await axios.post(`${API_URL}/createQuestion`, payload, {
          headers: { Authorization: `Bearer ${token}` },
        });
      }
      setShowFormModal(false);
      fetchData(isEdit ? pagination.currentPage : 1);
    } catch (err) {
      alert("Operation failed!");
    }
  };

  // Columns definition (Wahi rakhein jo aapne bheji thi)
  const columns = [
    {
      key: "id",
      label: "ID",
      render: (item, idx) => (
        <span className="text-gray-400 font-medium">
          #{(pagination.currentPage - 1) * pagination.limit + (idx + 1)}
        </span>
      ),
    },
    {
      key: "question",
      label: "QUESTION",
      render: (item) => (
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-[11px] border border-blue-100 uppercase">
            {item.question?.charAt(0)}
          </div>
          <span className="font-semibold text-slate-700 text-sm line-clamp-1">
            {item.question}
          </span>
        </div>
      ),
    },
    {
      key: "category",
      label: "CATEGORY",
      render: (item) => (
        <span className="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-[11px] font-bold uppercase tracking-wider">
          {item.category_name || "General"}
        </span>
      ),
    },
  ];

  return (
    <div className="p-8 bg-gray-50 min-h-screen">
      <DataTable
        title="Questions Management"
        subtitle="Manage your assessment questions and categories"
        columns={columns}
        data={questions}
        loading={loading}
        pagination={pagination} // ✅ Pagination pass kiya
        onPageChange={handlePageChange} // ✅ Page change function
        onCreateClick={() => {
          setIsEdit(false);
          setFormData({ id: "", question: "", category_id: "" });
          setShowFormModal(true);
        }}
        renderActions={(item) => (
          <TaskTableActions
            onShow={() => {
              setSelectedQuestion(item);
              setShowViewModal(true);
            }}
            onEdit={() => {
              setIsEdit(true);
              setFormData({
                id: item.id,
                question: item.question,
                category_id: item.category_id,
              });
              setShowFormModal(true);
            }}
            onDelete={() => handleDelete(item.id)}
          />
        )}
      />

      {/* Modals check karlein ke props sahi ja rahe hain */}
      <QuestionFormModal
        show={showFormModal}
        isEdit={isEdit}
        formData={formData}
        setFormData={setFormData}
        categories={categories}
        onClose={() => setShowFormModal(false)}
        onSubmit={handleSubmit}
      />
      <QuestionViewModal
        show={showViewModal}
        question={selectedQuestion}
        onClose={() => setShowViewModal(false)}
      />
    </div>
  );
};

export default Questions;
