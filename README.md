# Cybersecurity Assessment Portal

A production-ready enterprise cybersecurity assessment management system built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

### Customer Features
- **Authentication**: Secure registration and login with JWT
- **Dashboard**: View assessment status and statistics
- **Assessment Requests**: Submit cybersecurity assessment requests
- **Report Viewing**: Download completed assessment reports as PDF
- **Vulnerability Reports**: View detailed vulnerability findings

### Admin Features
- **Dashboard**: Overview of all assessments, customers, and vulnerabilities
- **Customer Management**: Manage customer accounts
- **Assessment Management**: Review, assign, and manage assessment requests
- **Vulnerability Management**: Track and manage vulnerability findings
- **Report Generation**: Create and approve assessment reports
- **Analytics**: View statistics and trends
- **PDF Export**: Generate professional PDF reports

## Tech Stack

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB** - Database
- **Mongoose** - ODM for MongoDB
- **JWT** - Authentication
- **bcryptjs** - Password hashing
- **express-validator** - Input validation
- **PDFKit** - PDF generation

### Frontend
- **React.js** - UI library (Vite)
- **Tailwind CSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client
- **Recharts** - Data visualization
- **react-hot-toast** - Notifications
- **Lucide React** - Icons

## Project Structure

```
assesment-portal/
├── client/                          # React Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/            # Reusable components
│   │   │   ├── layout/            # Layout components
│   │   │   ├── forms/             # Form components
│   │   │   └── charts/            # Chart components
│   │   ├── context/               # React Context
│   │   ├── hooks/                 # Custom hooks
│   │   ├── layouts/               # Page layouts
│   │   ├── pages/
│   │   │   ├── auth/              # Authentication pages
│   │   │   ├── customer/          # Customer pages
│   │   │   └── admin/             # Admin pages
│   │   ├── services/              # API services
│   │   ├── utils/                 # Utility functions
│   │   └── assets/                # Images, icons
│   ├── index.html
│   ├── vite.config.js
│   ├── tailwind.config.js
│   └── package.json
│
├── server/                         # Node.js Backend
│   ├── config/
│   │   ├── db.js                  # MongoDB connection
│   │   ├── jwt.js                 # JWT configuration
│   │   └── constants.js           # Application constants
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── assessmentController.js
│   │   ├── vulnerabilityController.js
│   │   └── reportController.js
│   ├── middleware/
│   │   ├── auth.js                # Authentication
│   │   ├── admin.js               # Authorization
│   │   ├── validation.js          # Request validation
│   │   └── errorHandler.js        # Error handling
│   ├── models/
│   │   ├── User.js
│   │   ├── Assessment.js
│   │   ├── Vulnerability.js
│   │   └── Report.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── assessments.js
│   │   ├── vulnerabilities.js
│   │   └── reports.js
│   ├── services/
│   │   └── pdfService.js          # PDF generation
│   ├── validators/
│   │   ├── authValidator.js
│   │   ├── assessmentValidator.js
│   │   └── reportValidator.js
│   ├── utils/
│   ├── seed/
│   ├── .env
│   ├── server.js
│   └── package.json
│
└── README.md
```

## Installation

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (v4.4 or higher)
- npm or yarn

### Backend Setup

1. Navigate to the server directory:
```bash
cd server
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://localhost:27017/cybersecurity-portal
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:5173
```

4. Start the server:
```bash
npm run dev
```

The server will run on `http://localhost:5000`

### Frontend Setup

1. Navigate to the client directory:
```bash
cd client
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```env
VITE_API_URL=http://localhost:5000/api
```

4. Start the development server:
```bash
npm run dev
```

The frontend will run on `http://localhost:5173`

## Usage

### Default Users

After starting the application, you can register new users or use the following:

**Customer Account:**
- Email: customer@example.com
- Password: Customer123!

**Admin Account:**
- Email: admin@example.com
- Password: Admin123!

### API Endpoints

#### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `PUT /api/auth/change-password` - Change password
- `POST /api/auth/logout` - Logout user

#### Assessments
- `POST /api/assessments` - Create assessment (Customer)
- `GET /api/assessments` - Get all assessments
- `GET /api/assessments/stats` - Get statistics (Admin)
- `GET /api/assessments/:id` - Get single assessment
- `PUT /api/assessments/:id` - Update assessment
- `PATCH /api/assessments/:id/status` - Update status (Admin)
- `DELETE /api/assessments/:id` - Delete assessment (Admin)

#### Vulnerabilities
- `POST /api/vulnerabilities` - Create vulnerability (Admin)
- `GET /api/vulnerabilities` - Get all vulnerabilities
- `GET /api/vulnerabilities/stats` - Get statistics (Admin)
- `GET /api/vulnerabilities/assessment/:assessmentId` - Get by assessment
- `GET /api/vulnerabilities/:id` - Get single vulnerability
- `PUT /api/vulnerabilities/:id` - Update vulnerability (Admin)
- `PATCH /api/vulnerabilities/:id/status` - Update status (Admin)
- `DELETE /api/vulnerabilities/:id` - Delete vulnerability (Admin)

#### Reports
- `POST /api/reports` - Create report (Admin)
- `GET /api/reports` - Get all reports
- `GET /api/reports/assessment/:assessmentId` - Get by assessment
- `GET /api/reports/:id` - Get single report
- `GET /api/reports/:id/pdf` - Download PDF
- `PUT /api/reports/:id` - Update report (Admin)
- `PATCH /api/reports/:id/approve` - Approve report (Admin)
- `DELETE /api/reports/:id` - Delete report (Admin)

## Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcryptjs for secure password storage
- **Role-Based Access Control**: Customer and Admin roles
- **Input Validation**: Request validation with express-validator
- **CORS Configuration**: Configured for secure cross-origin requests
- **Environment Variables**: Sensitive data stored in environment files

## Development

### Running Tests
```bash
# Backend
cd server
npm test

# Frontend
cd client
npm test
```

### Building for Production
```bash
# Backend
cd server
npm run build

# Frontend
cd client
npm run build
```

## Database Schema

### User
- name, email, password (hashed)
- role (customer/admin)
- phone, company
- isActive, lastLogin

### Assessment
- customerId (reference)
- companyName, contactPerson, email, phone
- assessmentType, scope, description
- preferredDate, status
- assignedTo, startDate, completionDate

### Vulnerability
- assessmentId (reference)
- title, description, cvssScore, severity
- status, assignedEngineer
- affectedAssets, remediation, references
- cveId, discoveredDate, fixedDate

### Report
- assessmentId (reference)
- executiveSummary, findings, riskScore
- recommendations, vulnerabilityList
- overallScore, methodology, scope
- isApproved, approvedBy, approvedDate

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For support, email support@cyberportal.com or open an issue in the repository.
