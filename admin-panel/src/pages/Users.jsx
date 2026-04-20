import axios from "axios";
import { useEffect, useState } from "react";
import UsersTable from "../components/DataTable";
import TaskTableActions from "../components/TaskTableActions";
import UserFormModal from "../components/UserFormModal";
import UserViewModal from "../components/UserViewModal";

const Users = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // PAGINATION STATES
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUsers: 0,
    limit: 10,
  });

  const [selectedUser, setSelectedUser] = useState(null);
  const [showFormModal, setShowFormModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [formData, setFormData] = useState({ name: "", email: "" });

  const API_BASE_URL = "http://localhost:5000";
  const token = localStorage.getItem("token");

  // FETCH USERS WITH PAGINATION
  const fetchUsers = async (page = 1) => {
    try {
      setLoading(true);
      const res = await axios.get(
        `${API_BASE_URL}/all-users?page=${page}&limit=${pagination.limit}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        },
      );

      if (res.data.users) {
        setUsers(res.data.users);
        setPagination(res.data.pagination);
      } else {
        setUsers(res.data || []);
      }
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(pagination.currentPage);
  }, [pagination.currentPage]);

  // DELETE USER
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this user?")) return;
    try {
      await axios.delete(`${API_BASE_URL}/adminDeleteUser/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchUsers(pagination.currentPage); 
    } catch (err) {
      alert("Delete failed");
    }
  };

  // CREATE USER
  const handleCreate = async () => {
    try {
      await axios.post(`${API_BASE_URL}/create-user`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowFormModal(false);
      fetchUsers(1); 
    } catch (err) {
      alert(err.response?.data?.message || "Create failed");
    }
  };

  // UPDATE USER
  const handleUpdate = async () => {
    const id = selectedUser?._id || selectedUser?.id;
    try {
      await axios.put(`${API_BASE_URL}/update-user/${id}`, formData, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setShowFormModal(false);
      fetchUsers(pagination.currentPage); 
    } catch (err) {
      alert("Update failed");
    }
  };

  return (
    <div className="bg-gray-50 min-h-screen">
      <UsersTable
        data={users}
        loading={loading}
        pagination={pagination}
        onPageChange={(newPage) =>
          setPagination({ ...pagination, currentPage: newPage })
        }
        onCreateClick={() => {
          setIsEdit(false);
          setFormData({ name: "", email: "" });
          setShowFormModal(true);
        }}
        renderActions={(item) => (
          <TaskTableActions
            onShow={() => {
              setSelectedUser(item);
              setShowViewModal(true);
            }}
            onEdit={() => {
              setSelectedUser(item);
              setFormData({ name: item.name, email: item.email });
              setIsEdit(true);
              setShowFormModal(true);
            }}
            onDelete={() => handleDelete(item._id || item.id)}
          />
        )}
      />

      <UserFormModal
        show={showFormModal}
        isEdit={isEdit}
        formData={formData}
        setFormData={setFormData}
        onClose={() => setShowFormModal(false)}
        onSubmit={isEdit ? handleUpdate : handleCreate}
      />

      <UserViewModal
        show={showViewModal}
        user={selectedUser}
        onClose={() => setShowViewModal(false)}
      />
    </div>
  );
};

export default Users;
