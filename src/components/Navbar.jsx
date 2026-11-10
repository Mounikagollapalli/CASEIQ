function Navbar() {
  return (
    <header className="topbar">
      <a className="brand" href="/" aria-label="CaseIQ home">
        <span className="brand-mark">C</span>
        <span>case<span>iq</span><small>DECISION INTELLIGENCE</small></span>
      </a>
      <div className="topbar-right">
        <span className="topbar-label">QUALITY OPERATIONS</span>
        <span className="avatar">M</span>
      </div>
    </header>
  );
}
export default Navbar;
