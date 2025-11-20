import { Leaf, Mail, Phone, MapPin, Facebook, Twitter, Instagram } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="hidden md:block bg-gradient-to-br from-gray-900 to-gray-800 text-white pt-16 pb-8">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-8">
          <div>
            <div className="flex items-center space-x-2 mb-4">
              <div className="bg-gradient-to-br from-green-400 to-emerald-600 p-2 rounded-full">
                <Leaf className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold">VeggieShop</span>
            </div>
            <p className="text-gray-400 mb-4">
              Your trusted source for fresh, organic vegetables delivered right to your doorstep.
            </p>
            <div className="flex space-x-3">
              <a href="#" className="bg-gray-700 hover:bg-green-600 p-2 rounded-full transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="bg-gray-700 hover:bg-green-600 p-2 rounded-full transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="bg-gray-700 hover:bg-green-600 p-2 rounded-full transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-gray-400 hover:text-green-400 transition-colors">
                  Home
                </Link>
              </li>
              <li>
                <Link to="/shop" className="text-gray-400 hover:text-green-400 transition-colors">
                  Shop
                </Link>
              </li>
              <li>
                <Link to="/about" className="text-gray-400 hover:text-green-400 transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link to="/contact" className="text-gray-400 hover:text-green-400 transition-colors">
                  Contact
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Categories</h3>
            <ul className="space-y-2">
              <li>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  Leafy Greens
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  Root Vegetables
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  Organic Produce
                </a>
              </li>
              <li>
                <a href="#" className="text-gray-400 hover:text-green-400 transition-colors">
                  Fresh Fruits
                </a>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contact Us</h3>
            <ul className="space-y-3">
              <li className="flex items-center space-x-2 text-gray-400">
                <MapPin className="w-5 h-5 text-green-400" />
                <span>JUBILEE HILLS,HYDERABAD</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Phone className="w-5 h-5 text-green-400" />
                <span>+91 8186831080</span>
              </li>
              <li className="flex items-center space-x-2 text-gray-400">
                <Mail className="w-5 h-5 text-green-400" />
                <span>bangarbabu11@gmail.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 pt-8 text-center text-gray-400">
          <p>&copy; 2024 VeggieShop. All rights reserved. Made with 💚 for healthy living.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
