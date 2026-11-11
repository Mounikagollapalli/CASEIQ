const menuItems = [
  { id: "dashboard", label: "Overview", icon: "▦", group: "WORKSPACE" },
  { id: "cases", label: "Case management", icon: "▤", group: "WORKSPACE" },
  { id: "documents", label: "Document intelligence", icon: "⇧", group: "WORKSPACE" },
  { id: "risk", label: "AI risk analysis", icon: "⌁", group: "WORKSPACE" },
  { id: "review", label: "Human review", icon: "✓", group: "GOVERNANCE" },
  { id: "policy", label: "Policy knowledge", icon: "⌕", group: "GOVERNANCE" },
  { id: "analytics", label: "Analytics & reports", icon: "▥", group: "INSIGHTS" },
];

function Sidebar({ currentPage, onChangePage }) {
  let previousGroup = "";
  return (
    <aside className="sidebar">
      <div className="sidebar-caption">NAVIGATION</div>
      {menuItems.map((item) => {
        const showGroup = item.group !== previousGroup;
        previousGroup = item.group;
        return (
          <div key={item.id}>
            {showGroup && <p className="nav-group">{item.group}</p>}
            <button className={currentPage === item.id ? "nav-item active" : "nav-item"} onClick={() => onChangePage(item.id)}>
              <span className="nav-icon">{item.icon}</span><span>{item.label}</span>
              {currentPage === item.id && <span className="nav-indicator" />}
            </button>
          </div>
        );
      })}
      <div className="sidebar-note">
        <span className="note-icon">i</span>
        <div><strong>Human in the loop</strong><p>AI supports review. People make the final call.</p></div>
      </div>
    </aside>
  );
}
export default Sidebar;
