// Top bar of the app. It only shows the product name.
function Navbar() {
  return (
    <div className="bg-white border-b border-gray-200 px-6 py-4 flex justify-between items-center">
      <h1 className="text-xl font-bold text-indigo-700">CaseIQ</h1>
      <p className="text-sm text-gray-500">AI-Powered Decision & Quality Assurance</p>
    </div>
  );
}

export default Navbar;
