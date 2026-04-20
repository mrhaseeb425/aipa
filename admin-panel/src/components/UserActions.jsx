// import { Edit, Eye, MoreHorizontal, Trash2 } from "lucide-react";
// import { useEffect, useRef, useState } from "react";

// const UserActions = ({ userId, user, onDelete, onEdit, onShow }) => {
//   const [isOpen, setIsOpen] = useState(false);
//   const dropdownRef = useRef(null);

//   useEffect(() => {
//     const handleClickOutside = (event) => {
//       if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
//         setIsOpen(false);
//       }
//     };
//     document.addEventListener("mousedown", handleClickOutside);
//     return () => document.removeEventListener("mousedown", handleClickOutside);
//   }, []);

//   return (
//     <div className="relative" ref={dropdownRef}>
//       <button
//         onClick={() => setIsOpen(!isOpen)}
//         className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
//       >
//         <MoreHorizontal size={20} />
//       </button>

//       {isOpen && (
//         <div className="absolute right-0 mt-2 w-36 bg-white border border-gray-100 shadow-xl rounded-xl z-50 py-2 animate-in fade-in zoom-in duration-200">
//           <button
//             className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
//             onClick={() => {
//               onShow(user);
//               setIsOpen(false);
//             }}
//           >
//             <Eye size={16} className="text-gray-400" /> Show
//           </button>

//           {/* Edit Button */}
//           <button
//             onClick={() => {
//               onEdit(user);
//               setIsOpen(false);
//             }}
//             className="flex items-center gap-3 w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-50 border-t border-gray-50 transition-colors"
//           >
//             <Edit size={16} className="text-gray-400" /> Edit
//           </button>

//           {/* Delete Button */}
//           <button
//             onClick={() => {
//               onDelete(userId);
//               setIsOpen(false);
//             }}
//             className="flex items-center gap-3 w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 border-t border-gray-50 transition-colors"
//           >
//             <Trash2 size={16} className="text-red-400" /> Delete
//           </button>
//         </div>
//       )}
//     </div>
//   );
// };

// export default UserActions;
