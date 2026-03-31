# 💰 CODECASH

A modern mobile application for seamless financial transactions between M-Pesa and Deriv trading accounts.

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![License](https://img.shields.io/badge/license-MIT-green)
![Platform](https://img.shields.io/badge/platform-iOS%20%7C%20Android-lightgrey)

## 📋 Overview

**CODECASH** is a fintech mobile application designed to bridge the gap between mobile money services (M-Pesa) and online trading platforms (Deriv/MT5). The app provides users with a secure, fast, and intuitive interface to manage deposits and withdrawals, track transaction history, and monitor their trading account balances.

### Key Features

- 🔐 **Secure Authentication** - Email/password login with biometric authentication support
- 💸 **Quick Deposits** - Instant deposits from M-Pesa to Deriv/MT5 accounts
- 💳 **Easy Withdrawals** - Seamless withdrawals from trading accounts to M-Pesa
- 📊 **Transaction Tracking** - Comprehensive transaction history with detailed analytics
- 📈 **Account Analytics** - Daily and monthly profit/loss tracking with visual charts
- 🌓 **Dark Theme UI** - Modern, sleek interface optimized for extended use
- 🔔 **Real-time Updates** - Instant notifications for all transactions
- 👤 **Profile Management** - Manage MT5 accounts, phone numbers, and security settings

## 🎯 Problem Statement

Traders using Deriv and MT5 platforms often face challenges when trying to fund their accounts or withdraw profits using mobile money services. The process typically involves:
- Multiple intermediary platforms
- Lengthy transaction times
- Complex verification processes
- High transaction fees

**CODECASH** solves these problems by providing a direct, simplified channel for M-Pesa ↔ Deriv/MT5 transactions.

## 🚀 Use Cases

### For Individual Traders
- Fund trading accounts instantly using M-Pesa
- Withdraw profits directly to M-Pesa wallet
- Monitor all financial activities in one place
- Track trading profitability over time

### For Forex Beginners
- Easy onboarding with minimal steps
- Clear transaction limits and fees
- Educational resources and support
- Secure account management

### For Active Traders
- Quick balance transfers between accounts
- Real-time transaction confirmations
- Detailed analytics for financial planning
- Multi-account support (Deriv and MT5)

## 🏗️ Technology Stack

### Frontend
- **React Native** - Cross-platform mobile development
- **TypeScript** - Type-safe code
- **Redux/Context API** - State management
- **React Navigation** - Seamless navigation
- **Axios** - API communication

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MongoDB/PostgreSQL** - Database
- **JWT** - Authentication
- **Socket.io** - Real-time updates

### External Integrations
- **M-Pesa API** - Mobile money transactions
- **Deriv API** - Trading account integration
- **MT5 API** - MetaTrader 5 integration
- **Firebase** - Push notifications & analytics

### DevOps & Tools
- **Git** - Version control
- **Docker** - Containerization
- **CI/CD Pipeline** - Automated deployment
- **Jest/Detox** - Testing

## 📱 Screenshots

### Authentication
- Clean sign-in interface with biometric support
- Secure password management

### Dashboard
- Real-time balance display
- Quick access to deposit/withdraw functions
- Recent transaction overview

### Transactions
- Comprehensive transaction history
- Filter by type, date, and amount
- Detailed transaction receipts

### Profile & Analytics
- Visual profit/loss charts
- Daily and monthly breakdowns
- Account settings and security

## 🔧 Installation

### Prerequisites
```bash
node >= 16.0.0
npm >= 8.0.0
React Native CLI
Android Studio / Xcode
```

### Setup

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/codecash.git
cd codecash
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

Edit `.env` with your API keys:
```env
MPESA_API_KEY=your_mpesa_key
MPESA_API_SECRET=your_mpesa_secret
DERIV_API_TOKEN=your_deriv_token
MT5_API_KEY=your_mt5_key
JWT_SECRET=your_jwt_secret
```

4. **Run the application**

For iOS:
```bash
npx react-native run-ios
```

For Android:
```bash
npx react-native run-android
```

## 📖 API Documentation

### Authentication Endpoints

```
POST /api/auth/register     - Register new user
POST /api/auth/login        - User login
POST /api/auth/logout       - User logout
POST /api/auth/refresh      - Refresh JWT token
```

### Transaction Endpoints

```
POST /api/transactions/deposit    - Create deposit request
POST /api/transactions/withdraw   - Create withdrawal request
GET  /api/transactions/history    - Fetch transaction history
GET  /api/transactions/:id        - Get transaction details
```

### Account Endpoints

```
GET  /api/account/balance         - Get account balance
GET  /api/account/profile         - Get user profile
PUT  /api/account/profile         - Update profile
PUT  /api/account/password        - Change password
```

### Analytics Endpoints

```
GET  /api/analytics/daily         - Get daily statistics
GET  /api/analytics/monthly       - Get monthly statistics
GET  /api/analytics/profit-loss   - Get P&L breakdown
```

## 🔒 Security Features

- **End-to-End Encryption** - All sensitive data encrypted in transit
- **Biometric Authentication** - Fingerprint/Face ID support
- **Two-Factor Authentication** - Optional 2FA for enhanced security
- **Session Management** - Automatic session timeout
- **Secure Storage** - Encrypted local data storage
- **API Key Rotation** - Regular security key updates
- **Transaction Verification** - Multi-step verification for withdrawals

## 🧪 Testing

Run unit tests:
```bash
npm test
```

Run integration tests:
```bash
npm run test:integration
```

Run end-to-end tests:
```bash
npm run test:e2e
```

## 📊 Project Roadmap

### Phase 1 (Current) ✅
- [x] User authentication
- [x] M-Pesa deposits
- [x] M-Pesa withdrawals
- [x] Transaction history
- [x] Basic analytics

### Phase 2 (In Progress) 🔄
- [ ] Multi-currency support
- [ ] Advanced analytics dashboard
- [ ] Push notifications
- [ ] In-app customer support
- [ ] Transaction limits customization

### Phase 3 (Planned) 📅
- [ ] Automated trading signals
- [ ] Social trading features
- [ ] Referral program
- [ ] Savings/investment plans
- [ ] Web platform

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct and development process.

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Project Lead** - [DERRICK NDAIRE WAMBUA](https://github.com/yourusername)
- **Lead Developer** - [DERRICK NDAIRE WAMBUA](https://github.com/developer)
- **UI/UX Designer** - [DERRICK NDAIRE WAMBUA](https://github.com/designer)

## 📞 Support

For support, email support@codecash.app or join our [Discord community](https://discord.gg/codecash).

## 🙏 Acknowledgments

- M-Pesa API documentation
- Deriv API team
- React Native community
- All contributors and supporters

## 📈 Stats

![GitHub stars](https://img.shields.io/github/stars/yourusername/codecash?style=social)
![GitHub forks](https://img.shields.io/github/forks/yourusername/codecash?style=social)
![GitHub issues](https://img.shields.io/github/issues/yourusername/codecash)
![GitHub pull requests](https://img.shields.io/github/issues-pr/yourusername/codecash)

---

**Made with ❤️ by the CODECASH Team**

*Empowering traders, one transaction at a time.*
