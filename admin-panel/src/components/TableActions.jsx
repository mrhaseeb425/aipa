import { Edit, Eye, Trash2 } from "lucide-react";

const TableActions = ({ onShow, onEdit, onDelete }) => {
  return (
    <div className="flex justify-end items-center gap-1">
      {/* Show Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onShow();
        }}
        className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors group"
        title="View Details"
      >
        <Eye size={18} className="group-hover:scale-110 transition-transform" />
      </button>

      {/* Edit Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onEdit();
        }}
        className="p-2 hover:bg-yellow-50 text-yellow-600 rounded-lg transition-colors group"
        title="Edit Question"
      >
        <Edit
          size={18}
          className="group-hover:scale-110 transition-transform"
        />
      </button>

      {/* Delete Button */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          onDelete();
        }}
        className="p-2 hover:bg-red-50 text-red-600 rounded-lg transition-colors group"
        title="Delete Question"
      >
        <Trash2
          size={18}
          className="group-hover:scale-110 transition-transform"
        />
      </button>
    </div>
  );
};

export default TableActions;
