// import axios from "axios";
// import { useCallback, useEffect, useState } from "react";
// import AssessmentDataTable from "../components/AssessmentsDataTable";
// import AssessmentViewModal from "../components/AssessmentsViewModal";
// import TaskTableActions from "../components/TaskTableActions";
// import UserViewModal from "../components/UserViewModal";

// const AssessmentDetails = () => {
//   const [logs, setLogs] = useState([]);
//   const [loading, setLoading] = useState(true);

//   const [pagination, setPagination] = useState({
//     currentPage: 1,
//     totalPages: 1,
//     totalItems: 0,
//     limit: 10,
//   });

//   const [selectedLog, setSelectedLog] = useState(null);
//   const [showViewModal, setShowViewModal] = useState(false);
//   const [selectedUser, setSelectedUser] = useState(null);
//   const [showUserModal, setShowUserModal] = useState(false);

//   const API_BASE = "http://localhost:5000";

//   const fetchLogs = useCallback(
//     async (page = 1) => {
//       try {
//         setLoading(true);
//         const res = await axios.get(
//           `${API_BASE}/getAllAssessments?page=${page}&limit=${pagination.limit}`,
//         );

//         if (res.data?.success) {
//           setLogs(res.data.data || []);
//           setPagination((prev) => ({
//             ...prev,
//             currentPage: res.data.pagination.currentPage,
//             totalPages: res.data.pagination.totalPages,
//             totalItems: res.data.pagination.totalItems,
//           }));
//         }
//       } catch (err) {
//         console.error("Fetch Error:", err);
//         setLogs([]);
//       } finally {
//         setLoading(false);
//       }
//     },
//     [pagination.limit],
//   );

//   useEffect(() => {
//     fetchLogs(pagination.currentPage);
//   }, [fetchLogs, pagination.currentPage]);

//   const handlePageChange = (newPage) => {
//     setPagination((prev) => ({ ...prev, currentPage: newPage }));
//   };

//   const handleShow = (log) => {
//     if (!log) return;
//     setSelectedLog(log);
//     setShowViewModal(true);
//   };

//   const handleUserClick = (user) => {
//     if (!user) return;
//     setSelectedUser(user);
//     setShowUserModal(true);
//   };

//   // DELETE
//   const handleDelete = async (log) => {
//     const id = log.id;
//     if (!id) return alert("Invalid ID");
//     if (!window.confirm("Delete this log?")) return;

//     try {
//       await axios.delete(`${API_BASE}/deleteAssessmentDetail/${id}`);
//       fetchLogs(pagination.currentPage);
//       alert("Deleted successfully");
//     } catch (err) {
//       alert("Delete failed");
//     }
//   };

//   const handleUpdate = async (log) => {
//     const id = log.id;
//     if (!id) return alert("Invalid ID");
//     alert("Edit mode for ID: " + id);
//   };

//   return (
//     <>
//       <AssessmentDataTable
//         data={logs}
//         loading={loading}
//         pagination={pagination}
//         onPageChange={handlePageChange}
//         onUserClick={handleUserClick}
//         renderActions={(log) => (
//           <TaskTableActions
//             onShow={() => handleShow(log)}
//             onDelete={() => handleDelete(log)}
//             onEdit={() => handleUpdate(log)}
//           />
//         )}
//       />

//       <AssessmentViewModal
//         show={showViewModal}
//         log={selectedLog}
//         onClose={() => setShowViewModal(false)}
//       />

//       <UserViewModal
//         show={showUserModal}
//         user={selectedUser}
//         onClose={() => setShowUserModal(false)}
//       />
//     </>
//   );
// };

// export default AssessmentDetails;

import axios from "axios";
import { useCallback, useEffect, useState } from "react";
import AssessmentDataTable from "../components/AssessmentsDataTable";
import AssessmentViewModal from "../components/AssessmentsViewModal";
import TaskTableActions from "../components/TaskTableActions";
import UserViewModal from "../components/UserViewModal";

const AssessmentDetails = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    limit: 10,
  });

  const [selectedLog, setSelectedLog] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [showUserModal, setShowUserModal] = useState(false);

  const API_BASE = "http://localhost:5000";

  const fetchLogs = useCallback(
    async (page = 1) => {
      try {
        setLoading(true);
        const res = await axios.get(
          `${API_BASE}/getAllAssessments?page=${page}&limit=${pagination.limit}`,
        );

        if (res.data?.success) {
          setLogs(res.data.data || []);
          setPagination((prev) => ({
            ...prev,
            currentPage: res.data.pagination.currentPage,
            totalPages: res.data.pagination.totalPages,
            totalItems: res.data.pagination.totalItems,
          }));
        }
      } catch (err) {
        console.error("Fetch Error:", err);
        setLogs([]);
      } finally {
        setLoading(false);
      }
    },
    [pagination.limit],
  );

  useEffect(() => {
    fetchLogs(pagination.currentPage);
  }, [fetchLogs, pagination.currentPage]);

  const handlePageChange = (newPage) => {
    setPagination((prev) => ({ ...prev, currentPage: newPage }));
  };

  const handleShow = (log) => {
    if (!log) return;
    setSelectedLog(log); 
    setShowViewModal(true);
  };

  const handleDelete = async (log) => {
    const id = log.id;
    if (
      !id ||
      !window.confirm("Are you sure you want to delete this assessment?")
    )
      return;

    try {
      await axios.delete(`${API_BASE}/deleteAssessmentDetail/${id}`);
      alert("Deleted successfully");
      fetchLogs(pagination.currentPage);
    } catch (err) {
      alert("Delete failed");
    }
  };

  return (
    <div className="p-6">
      <AssessmentDataTable
        data={logs}
        loading={loading}
        pagination={pagination}
        onPageChange={handlePageChange}
        onUserClick={(user) => {
          setSelectedUser(user);
          setShowUserModal(true);
        }}
        renderActions={(log) => (
          <TaskTableActions
            onShow={() => handleShow(log)}
            onDelete={() => handleDelete(log)}
            onEdit={() => alert("Edit mode for ID: " + log.id)}
          />
        )}
      />

      {/* Viewing Modal */}
      <AssessmentViewModal
        show={showViewModal}
        log={selectedLog}
        onClose={() => setShowViewModal(false)}
      />

      <UserViewModal
        show={showUserModal}
        user={selectedUser}
        onClose={() => setShowUserModal(false)}
      />
    </div>
  );
};

export default AssessmentDetails;
