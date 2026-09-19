<div align="center">

<br />

```
 ███╗   ██╗███████╗████████╗     ██╗
 ████╗  ██║██╔════╝╚══██╔══╝    ██╔╝
 ██╔██╗ ██║█████╗     ██║      ██╔╝ 
 ██║╚██╗██║██╔══╝     ██║     ██╔╝  
 ██║ ╚████║███████╗   ██║    ██╔╝   
 ╚═╝  ╚═══╝╚══════╝   ╚═╝   ╚═╝    
     &
 ███╗   ██╗ ██████╗ ████████╗██╗ ██████╗ ███╗   ██╗
 ████╗  ██║██╔═══██╗╚══██╔══╝██║██╔═══██╗████╗  ██║
 ██╔██╗ ██║██║   ██║   ██║   ██║██║   ██║██╔██╗ ██║
 ██║╚██╗██║██║   ██║   ██║   ██║██║   ██║██║╚██╗██║
 ██║ ╚████║╚██████╔╝   ██║   ██║╚██████╔╝██║ ╚████║
 ╚═╝  ╚═══╝ ╚═════╝    ╚═╝   ╚═╝ ╚═════╝ ╚═╝  ╚═══╝
```

### *Your network has a memory problem. We fixed it.*

<br />

[![Platform](https://img.shields.io/badge/Platform-iOS%20%26%20Android-black?style=for-the-badge&logo=apple)](https://expo.dev/go)
[![Built with](https://img.shields.io/badge/Built%20with-React%20Native-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://reactnative.dev)
[![Powered by](https://img.shields.io/badge/Powered%20by-Firebase-FFCA28?style=for-the-badge&logo=firebase&logoColor=black)](https://firebase.google.com)
[![Expo](https://img.shields.io/badge/Expo-54-000020?style=for-the-badge&logo=expo)](https://expo.dev)

<br />

</div>

---

<br />

## The Problem Nobody Talks About

You leave a conference with 30 new contacts saved in your phone.

Three weeks later, you scroll through and think: *"Who is Alex Chen again?"*

You remember the conversation was important. You remember they mentioned something about a job opening. But the details? Gone.

**LinkedIn stores connections. Your phone stores numbers. Neither stores context.**

Net & Notion stores the full story.

<br />

---

<br />

## What Makes This Different

<br />

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│   Standard contact app          Net & Notion                │
│   ─────────────────             ─────────────               │
│                                                             │
│   Alex Chen                     Alex Chen                   │
│   +1 416 555 0192               Senior Recruiter @ Shopify  │
│                                 Met at: TechTO Meetup       │
│                                 March 14, 2025 · Downtown   │
│                                                             │
│                                 "Mentioned open roles in    │
│                                  platform eng. Follow up    │
│                                  after April."              │
│                                                             │
│                                 🏷 Technology · Recruiting   │
│                                 🔔 Reminder: April 15       │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

<br />

---

<br />

## Features

<br />

| | Feature | What it does |
|---|---|---|
| 🤝 | **Contact + context** | Save who you met, where, when, and why it matters |
| 📝 | **Rich notes** | Capture the conversation before you forget it |
| ✨ | **AI categories** | Auto-tag contacts by industry from your own notes |
| 🔍 | **Smart search** | Find anyone by name, company, event, or what you talked about |
| 📷 | **QR scanning** | Scan a LinkedIn QR to instantly fill contact details |
| 🔔 | **Follow-up reminders** | Set a date to reconnect — directly on the contact |
| 🗂 | **Filter by relationship** | Recruiter, mentor, client, partner, classmate, and more |

<br />

---

<br />

## Getting Started

<br />

**Prerequisites:** Node.js 18+ and [Expo Go](https://expo.dev/go) on your phone.

<br />

```bash
# Clone the repo
git clone <repo-url>
cd net-and-notion

# Install
npm install

# Run
npx expo start
```

> Scan the QR code with Expo Go and the app loads instantly on your device.

<br />

### Firebase Setup

Create `src/firebase/firebaseConfig.js`:

```js
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "YOUR_API_KEY",
  authDomain: "YOUR_AUTH_DOMAIN",
  projectId: "YOUR_PROJECT_ID",
  storageBucket: "YOUR_STORAGE_BUCKET",
  messagingSenderId: "YOUR_MESSAGING_SENDER_ID",
  appId: "YOUR_APP_ID",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
```

> ⚠️ This file is in `.gitignore`. Never commit it.

<br />

---

<br />

## Tech Stack

<br />

```
React Native  ──────────────────  Cross-platform mobile UI
Expo 54       ──────────────────  Build, run, and deploy
Firebase Auth ──────────────────  Secure user authentication
Firestore     ──────────────────  Real-time NoSQL database
React Nav     ──────────────────  Stack + tab navigation
Expo Camera   ──────────────────  QR code scanning
```

<br />

---

<br />

## Git Workflow

<br />

```
main  ←──── Pull Request ←──── feat/your-name
  │                                    │
  │                              daily commits
  │                              as you build
  │
  └── always stable, always reviewed before merge
```

<br />

1. Work on **your own feature branch**
2. Commit progress **every day**
3. Open a **Pull Request** when ready
4. Get a **teammate review** before merging

<br />

---

<br />

## The Team

<br />

<div align="center">

| Roy Bryan David Franck | Rasa Reiszadeh | Cynthia Franxin Salazar Benavides | Ayla Shamika Young |
|:---:|:---:|:---:|:---:|

</div>

<br />

---

<br />

<div align="center">

*Built at Seneca College · WEB530 · 2026*

**The people you meet matter. Remember them.**

</div>
