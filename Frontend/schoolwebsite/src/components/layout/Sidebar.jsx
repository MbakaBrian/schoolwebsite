import React from "react";
import { Link } from "react-router-dom";
import {
  Users,
  UserPlus,
  Bus,
  Wallet,
  BookOpen,
  LibraryBig,
  Receipt,
  Package,
  Building2,
  CalendarDays,
  Layers,
} from "lucide-react";

const menuItems = {
  headteacher: [
    {
      label: "Dashboard",
      path: "/dashboard/headteacher",
      icon: <Users className="w-5 h-5" />,
    },

    {
      label: "Add Student",
      path: "/students/create",
      icon: <UserPlus className="w-5 h-5" />,
    },

    {
      label: "Add Parent",
      path: "/parents/create",
      icon: <UserPlus className="w-5 h-5" />,
    },

    {
      label: "Add Teachers",
      path: "/teachers/create",
      icon: <UserPlus className="w-5 h-5" />,
    },

    {
      label: "Manage Teachers",
      path: "/teachers/management",
      icon: <UserPlus className="w-5 h-5" />,
    },

    {
      label: "Transport Routes",
      path: "/fees/transport/routes",
      icon: <Bus className="w-5 h-5" />,
    },

    {
      label: "Fee Structure",
      path: "/fees/GradeFeeStructure",
      icon: <Wallet className="w-5 h-5" />,
    },

    // Academic Management
    {
      label: "Academic Years",
      path: "/academics/years",
      icon: <CalendarDays className="w-5 h-5" />,
    },

    {
      label: "Stream Management",
      path: "/academics/streams",
      icon: <Layers className="w-5 h-5" />,
    },

    {
      label: "Departments",
      path: "/departments",
      icon: <Building2 className="w-5 h-5" />,
    },

    {
      label: "Expense Management",
      path: "/receipts",
      icon: <Receipt className="w-5 h-5" />,
    },

    {
      label: "Inventory",
      path: "/inventory",
      icon: <Package className="w-5 h-5" />,
    },
  ],

  teacher: [
    {
      label: "Dashboard",
      path: "/dashboard/teacher",
      icon: <BookOpen className="w-5 h-5" />,
    },

    {
      label: "My Students",
      path: "/teacher/students",
      icon: <Users className="w-5 h-5" />,
    },

    {
      label: "Performance",
      path: "/teacher/performance",
      icon: <Wallet className="w-5 h-5" />,
    },
  ],

  parent: [
    {
      label: "Dashboard",
      path: "/dashboard/parent",
      icon: <Users className="w-5 h-5" />,
    },

    {
      label: "My Children",
      path: "/parent/students",
      icon: <UserPlus className="w-5 h-5" />,
    },

    {
      label: "Fees",
      path: "/parent/fees",
      icon: <Wallet className="w-5 h-5" />,
    },
  ],

  accountant: [
    {
      label: "Dashboard",
      path: "/dashboard/accountant",
      icon: <Wallet className="w-5 h-5" />,
    },

    {
      label: "Payments",
      path: "/accountant/payments",
      icon: <Wallet className="w-5 h-5" />,
    },

    {
      label: "Reports",
      path: "/accountant/reports",
      icon: <BookOpen className="w-5 h-5" />,
    },
  ],

  librarian: [
    {
      label: "Dashboard",
      path: "/dashboard/librarian",
      icon: <LibraryBig className="w-5 h-5" />,
    },

    {
      label: "Books",
      path: "/librarian/books",
      icon: <BookOpen className="w-5 h-5" />,
    },

    {
      label: "Borrowed",
      path: "/librarian/borrowed",
      icon: <Users className="w-5 h-5" />,
    },
  ],
};

export default function Sidebar({ role = "headteacher" }) {
  const items = menuItems[role] || menuItems.headteacher;

  return (
    <aside className="flex h-screen w-64 flex-shrink-0 flex-col bg-gray-900 text-white">
      {/* ==================================================
          SIDEBAR HEADER
      ================================================== */}
      <div className="flex-shrink-0 border-b border-gray-800 p-4">
        <h2 className="text-lg font-bold">
          School System
        </h2>
      </div>

      {/* ==================================================
          SCROLLABLE NAVIGATION
      ================================================== */}
      <nav className="min-h-0 flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {items.map((item, index) => (
            <li key={`${item.path}-${index}`}>
              <Link
                to={item.path}
                className="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-200 transition hover:bg-gray-700 hover:text-white"
              >
                <span className="flex-shrink-0">
                  {item.icon}
                </span>

                <span className="truncate">
                  {item.label}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}
