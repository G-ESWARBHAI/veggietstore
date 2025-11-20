# 🥬 Veggie Store - E-Commerce Platform

A complete e-commerce platform for selling fresh vegetables with Telugu language support.

## Features

- 🛒 Full shopping cart functionality
- 🔐 User authentication and authorization
- 📦 Order management system
- 👨‍💼 Admin dashboard for product management
- 🌐 Telugu language support for vegetable names
- 📱 Responsive mobile-first design
- 💳 Payment integration ready
- 🔔 Real-time notifications

## Tech Stack

### Frontend
- React with Vite
- Tailwind CSS
- Framer Motion (animations)
- Zustand (state management)
- React Router
- i18next (internationalization)

### Backend
- Node.js with Express
- MongoDB with Mongoose
- JWT authentication
- Cloudinary for image uploads
- Nodemailer for emails

## Project Structure

```
VEGGIE_STORE/
├── backend/          # Node.js/Express API
│   ├── src/
│   │   ├── controllers/
│   │   ├── models/
│   │   ├── routes/
│   │   └── services/
│   └── server.js
├── project/          # React frontend
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── store/
│   │   ├── utils/
│   │   └── i18n/
│   └── package.json
└── README.md
```

## Getting Started

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd VEGGIE_STORE
```

2. Install backend dependencies:
```bash
cd backend
npm install
```

3. Install frontend dependencies:
```bash
cd ../project
npm install
```

4. Set up environment variables:

Backend (.env):
```
PORT=5000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
EMAIL_USER=your_email
EMAIL_PASS=your_email_password
```

5. Run the backend:
```bash
cd backend
npm start
# or for development
npm run dev
```

6. Run the frontend:
```bash
cd project
npm run dev
```

## Telugu Translations

The platform includes comprehensive Telugu translations for vegetable names. Translations are automatically applied in the Shop page.

## License

ISC

## Author

Your Name

