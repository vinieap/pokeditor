import { useState } from "react";

interface SidebarProps {
  sections?: {
    title: string;
    items: {
      label: string;
      onClick: () => void;
      active?: boolean;
    }[];
  }[];
}

export function Sidebar({ sections = [] }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-gray-100 border-r border-gray-200 transition-all ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      <div className="p-4">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full text-left text-gray-600 hover:text-gray-900"
        >
          {collapsed ? "→" : "←"} {!collapsed && "Collapse"}
        </button>
      </div>

      {!collapsed && sections.length > 0 && (
        <div className="px-4 pb-4">
          {sections.map((section, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-2">
                {section.title}
              </h3>
              <ul className="space-y-1">
                {section.items.map((item, itemIdx) => (
                  <li key={itemIdx}>
                    <button
                      onClick={item.onClick}
                      className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                        item.active
                          ? "bg-blue-500 text-white"
                          : "hover:bg-gray-200 text-gray-700"
                      }`}
                    >
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </aside>
  );
}