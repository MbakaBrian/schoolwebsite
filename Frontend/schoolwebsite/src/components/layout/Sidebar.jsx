import React from "react";
import { Link } from "react-router-dom";
import { Users, UserPlus, Bus, Wallet, BookOpen, LibraryBig ,  Receipt} from "lucide-react";

const menuItems = {
  headteacher: [
    { label: "Dashboard", path: "/dashboard/headteacher", icon: <Users className="w-5 h-5" /> },
    { label: "Add Student", path: "/students/create", icon: <UserPlus className="w-5 h-5" /> },
    { label: "Add Parent", path: "/parents/create", icon: <UserPlus className="w-5 h-5" /> },
    { label: "Add Teachers", path: "/teachers/create", icon: <UserPlus className="w-5 h-5" /> },
    { label: "Manage Teachers", path: "/teachers/management", icon: <UserPlus className="w-5 h-5" /> },
    { label: "Transport Routes", path: "/fees/transport/routes", icon: <Bus className="w-5 h-5" /> },
    { label: "Fee Structure", path: "/fees/GradeFeeStructure", icon: <Wallet className="w-5 h-5" /> },
    { label: "Streams", path: "/streams", icon: <Wallet className="w-5 h-5" /> },
{
    label: "Receipts",
    path: "/receipts",
    icon: <Receipt className="w-5 h-5" />
},
  ],
  teacher: [
    { label: "Dashboard", path: "/dashboard/teacher", icon: <BookOpen className="w-5 h-5" /> },
    { label: "My Students", path: "/teacher/students", icon: <Users className="w-5 h-5" /> },
    { label: "Performance", path: "/teacher/performance", icon: <Wallet className="w-5 h-5" /> },
  ],
  parent: [
    { label: "Dashboard", path: "/dashboard/parent", icon: <Users className="w-5 h-5" /> },
    { label: "My Children", path: "/parent/students", icon: <UserPlus className="w-5 h-5" /> },
    { label: "Fees", path: "/parent/fees", icon: <Wallet className="w-5 h-5" /> },
  ],
  accountant: [
    { label: "Dashboard", path: "/dashboard/accountant", icon: <Wallet className="w-5 h-5" /> },
    { label: "Payments", path: "/accountant/payments", icon: <Wallet className="w-5 h-5" /> },
    { label: "Reports", path: "/accountant/reports", icon: <BookOpen className="w-5 h-5" /> },
  ],
  librarian: [
    { label: "Dashboard", path: "/dashboard/librarian", icon: <LibraryBig className="w-5 h-5" /> },
    { label: "Books", path: "/librarian/books", icon: <BookOpen className="w-5 h-5" /> },
    { label: "Borrowed", path: "/librarian/borrowed", icon: <Users className="w-5 h-5" /> },
  ],
};

export default function Sidebar({ role = "headteacher" }) {
  return (
    <aside className="w-64 bg-gray-900 text-white h-screen p-4">
      <h2 className="text-lg font-bold mb-6">School System</h2>
      <nav>
        <ul className="space-y-3">
          {menuItems[role].map((item, index) => (
            <li key={index}>
              <Link
                to={item.path}
                className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-gray-700 transition"
              >
                {item.icon}
                <span>{item.label}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
