// Left menu. App.jsx tells us which page is active (currentPage)
// and gives us a function (onChangePage) to switch pages.
function Sidebar(props) {
  const menuItems = [
    { id: "dashboard", label: "Dashboard" },
    { id: "cases", label: "Case Management" },
    { id: "documents", label: "Document Intelligence" },
    { id: "risk", label: "AI Risk Analysis" },
    { id: "policy", label: "Policy Knowledge Base" },
    { id: "review", label: "Human Review" },
    { id: "analytics", label: "Analytics & Reports" },
  ];

  // Build one button for each menu item using a normal for loop
  const buttons = [];
  for (let i = 0; i < menuItems.length; i++) {
    const item = menuItems[i];
    let buttonStyle = "w-full text-left px-4 py-3 rounded-lg mb-1 text-sm ";
    if (props.currentPage === item.id) {
      buttonStyle = buttonStyle + "bg-indigo-600 text-white";
    } else {
      buttonStyle = buttonStyle + "text-gray-700 hover:bg-gray-100";
    }
    buttons.push(
      <button
        key={item.id}
        className={buttonStyle}
        onClick={function () {
          props.onChangePage(item.id);
        }}
      >
        {item.label}
      </button>
    );
  }

  return <div className="w-64 bg-white border-r border-gray-200 p-4">{buttons}</div>;
}

export default Sidebar;
