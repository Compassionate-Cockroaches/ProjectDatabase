import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="bg-white shadow-sm">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link to="/" className="text-xl font-bold text-gray-900">
            LoL Esports Analytics
          </Link>
          <div className="flex gap-4">
            <Link
              to="/"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Home
            </Link>
            <Link
              to="/users"
              className="text-gray-600 hover:text-gray-900 transition-colors"
            >
              Users
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}