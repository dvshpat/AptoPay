# 🚀 AptoPay — Instant Crypto Payments with QR & Rewards

AptoPay is a Web3-based cryptocurrency payment platform built on the **Aptos blockchain** during a Web3 hackathon.  
It enables **instant crypto payments** using **QR codes and usernames**, along with a built-in **reward system** to incentivize user engagement.

- 🚀 **Live Deployment:** https://aptopay.shubhh.xyz/

---

## 🎥 Project Demo



https://github.com/user-attachments/assets/b1984c08-0177-49d5-87aa-11e4af4a81da

---

![AptoPay Home](./public/home.png)

---

![QR Scan](./public/qrscan.png)

---

![Rewards](./public/hehe.png)

---

## 🌟 Features

### 🔑 Core Functionality
- **QR Code Payments** – Scan or share QR codes for fast, contactless crypto payments
- **Username-Based Payments** – Send crypto using simple usernames instead of wallet addresses
- **Payment Requests** – Create, send, accept, or reject payment requests
- **Rewards System** – Earn reward points on successful transactions
- **Instant Transactions** – Payments executed on-chain via Aptos
- **Wallet Integration** – Seamless connection with Aptos-compatible wallets (Petra recommended)

---

### 🎨 User Experience
- Modern, responsive UI built with **Next.js**
- Smooth animations using **Framer Motion**
- QR code generation & scanning
- Toast notifications and real-time feedback
- Organized tab-based interface (Pay, Receive, Request, History, Rewards)

---

## 🛠 Tech Stack

### Frontend
- **Next.js (App Router)**
- **React 19**
- **TypeScript**
- **Tailwind CSS**
- **Framer Motion**

### Blockchain & Web3
- **Aptos Blockchain**
- **Move Smart Contracts**
- **@aptos-labs/ts-sdk**
- **Aptos Wallet Adapter**

### Backend & Utilities
- **MongoDB & Mongoose**
- **JWT Authentication**
- **QR Code generation & scanning**

### Tooling & Deployment
- ESLint, PostCSS
- Vercel Deployment

---

## 📂 Project Structure

```bash
AptoPay/
│── app/                # Next.js routes and pages
│── components/         # Reusable UI components
│── context/            # Wallet & global state management
│── lib/                # Utility functions
│── config/             # App & contract configuration
│── contract/           # Aptos Move smart contracts
│── Models/             # Database models
│── types/              # TypeScript type definitions
│── public/             # Static assets
│
│── package.json
│── tsconfig.json
│── next.config.ts
│── vercel.json
│── README.md
```

##🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Aptos-compatible wallet (Petra recommended)

Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/dvshpat/AptoPay.git
   cd AptoPay
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Configuration**
   Create a `.env.local` file:
   ```env
   APTOS_API_KEY_MAINNET=your_aptos_api_key
   PHOTON_API_KEY=your_photon_rewards_api_key
   PHOTON_JWT_SECRET=your_jwt_secret
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`



## 💻 Core Components

### Payment Flow
1. **User Registration**: Users register with wallet address and username
2. **Payment Creation**: Send payments via username or QR code scan
3. **On-chain Execution**: Transactions processed on Aptos blockchain
4. **Reward Distribution**: Automatic reward points for completed payments
5. **History Tracking**: All transactions stored in MongoDB

### Request System
- Create payment requests with custom amounts and memos
- Accept/reject incoming requests
- Automatic transaction execution on acceptance
- Real-time status updates

### Rewards Integration
- Integrated with Photon rewards platform
- Automatic user registration with Photon
- Event tracking for payment activities
- Custom reward calculation (100 points per 1 APT)

## 🔐 Security Features

- **Wallet Authentication**: Secure Aptos wallet integration
- **Input Validation**: Comprehensive form validation
- **Transaction Security**: On-chain verification
- **Error Handling**: Comprehensive error boundaries

## 🎨 UI/UX Features

- **Responsive Design**: Works on all device sizes
- **Smooth Animations**: Framer Motion transitions
- **Real-time Updates**: Live payment status
- **Intuitive Navigation**: Tab-based interface
- **Visual Feedback**: Toast notifications and loading states

## 🚀 Deployment

### Vercel (Recommended)
1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard
3. Deploy automatically on git push

### Manual Deployment
```bash
npm run build
npm start
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---


📜 License
This project is open-source and available under the MIT License.


Built with ❤️ using Next.js and Aptos
