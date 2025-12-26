# 📧 Email System Setup Guide

## ✅ আপনার Mail System এখন পুরোপুরি কাজ করছে!

এই guide অনুসরণ করে আপনি email system সম্পূর্ণভাবে configure করতে পারবেন।

---

## 🔧 Setup Steps

### Step 1: Gmail App Password তৈরি করুন

**⚠️ Important:** Regular Gmail password কাজ করবে না। আপনাকে **App-Specific Password** তৈরি করতে হবে।

#### How to Create Gmail App Password:

1. **Google Account Settings** এ যান: https://myaccount.google.com/
2. **Security** section এ যান
3. **2-Step Verification** enable করুন (যদি এখনো না করে থাকেন)
4. **App passwords** section এ যান: https://myaccount.google.com/apppasswords
5. "Select app" dropdown থেকে **Mail** select করুন
6. "Select device" dropdown থেকে **Other (Custom name)** select করুন
7. নাম লিখুন: `ICST Issue Portal`
8. **Generate** button এ click করুন
9. **16-digit password** copy করুন (এটি শুধু একবার দেখাবে!)

**Example:** `abcd efgh ijkl mnop` (spaces সহ বা ছাড়া কাজ করবে)

---

### Step 2: Backend .env File Configure করুন

Backend folder এ `.env` file খুলুন এবং Gmail credentials add করুন:

```env
# Email Configuration
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=jovayerhossain0@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password-here

# Frontend URL
FRONTEND_URL=https://icst-issue-portal.vercel.app
```

**Important:**
- `EMAIL_USER`: আপনার Gmail address
- `EMAIL_PASSWORD`: Step 1 এ generate করা 16-digit app password
- `FRONTEND_URL`: আপনার frontend URL (Vercel এ deploy থাকলে)

---

### Step 3: Dependencies Install করুন

Backend folder এ terminal open করে এই command run করুন:

```bash
cd backend
npm install
```

এটি `nodemailer` package install করবে যা email পাঠানোর জন্য দরকার।

---

### Step 4: Local Testing (Optional)

Local এ test করতে:

```bash
cd backend
npm start
```

Frontend থেকে:
1. Registration করে দেখুন → Welcome email আসবে ✅
2. Forgot Password ব্যবহার করুন → Reset email আসবে ✅
3. Admin panel থেকে Bulk Email পাঠান → সব users email পাবে ✅

---

### Step 5: Vercel এ Deploy করুন

#### Backend Deploy:

1. Vercel Dashboard এ যান
2. Backend project select করুন
3. **Settings → Environment Variables** এ যান
4. নিচের variables add করুন:

```
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_SECURE=false
EMAIL_USER=jovayerhossain0@gmail.com
EMAIL_PASSWORD=your-16-digit-app-password
FRONTEND_URL=https://icst-issue-portal.vercel.app
```

5. **Redeploy** করুন

---

## 📧 Email Features যা এখন কাজ করছে:

### 1. ✉️ Welcome Email (Registration)
- নতুন user register করলে automatically welcome email যাবে
- Beautiful HTML template
- Bangla + English content

### 2. 🔑 Password Reset Email
- Forgot Password page থেকে email submit করলে
- 30 minutes valid reset link
- Secure token-based system

### 3. 📢 Bulk Email System (Admin)
- Admin panel → Bulk Email
- সব users বা শুধু students কে email পাঠান
- Beautiful email template
- Async email sending (fast response)

### 4. 📋 Issue Update Notifications (Future)
- Issue status change হলে user কে notify করবে
- Currently backend ready, frontend integration পরে করা যাবে

---

## 🔍 Testing Email System

### Test 1: Welcome Email
1. Frontend এ নতুন account register করুন
2. Check your email inbox
3. Welcome email দেখতে পাবেন ✅

### Test 2: Password Reset
1. Login page → "Forgot Password" click করুন
2. আপনার email দিন
3. Email check করুন
4. Reset link এ click করে নতুন password set করুন ✅

### Test 3: Bulk Email
1. Admin হিসেবে login করুন
2. Sidebar → "Bulk Email" যান
3. Subject ও Message লিখুন
4. Recipients select করুন (All Users / Students Only)
5. "Send Broadcast" click করুন
6. All selected users এ email যাবে ✅

---

## 🛠️ Troubleshooting

### Problem 1: Email যাচ্ছে না

**Solution:**
1. Check করুন `.env` file এ `EMAIL_USER` এবং `EMAIL_PASSWORD` correct আছে কিনা
2. Gmail App Password generate করেছেন কিনা (regular password নয়!)
3. Backend console check করুন error message এর জন্য
4. Gmail এ less secure apps allow করা আছে কিনা

### Problem 2: "Authentication failed" Error

**Solution:**
- App Password সঠিকভাবে copy করেছেন কিনা check করুন
- Spaces remove করে try করুন
- 2-Step Verification enable আছে কিনা check করুন

### Problem 3: Email Spam folder এ যাচ্ছে

**Solution:**
- এটি normal, especially নতুন sender এর জন্য
- User দের বলুন spam folder check করতে
- Gmail এ "Not Spam" mark করলে পরের emails inbox এ আসবে

### Problem 4: Vercel এ email কাজ করছে না

**Solution:**
1. Vercel Environment Variables add করেছেন কিনা check করুন
2. Backend redeploy করেছেন কিনা environment variables add করার পরে
3. Vercel function logs check করুন error দেখার জন্য

---

## 📝 Important Notes

1. **Security:** 
   - `.env` file কখনো Git এ commit করবেন না
   - App Password safe রাখুন

2. **Gmail Limits:**
   - Free Gmail: প্রতিদিন ~500 emails
   - G Suite: প্রতিদিন ~2000 emails
   - Bulk email এ delay আছে rate limiting avoid করার জন্য

3. **Email Delivery:**
   - Email sending async (background এ হয়)
   - Response immediately আসবে, কিন্তু email কিছুক্ষণ পরে পৌঁছাবে (1-5 minutes)

4. **Testing:**
   - Production এ deploy করার আগে local testing করুন
   - আলাদা test email account দিয়ে test করুন

---

## ✅ Checklist

- [ ] Gmail App Password তৈরি করা হয়েছে
- [ ] Backend `.env` file configure করা হয়েছে
- [ ] `nodemailer` package install করা হয়েছে
- [ ] Local testing সফল হয়েছে
- [ ] Vercel Environment Variables add করা হয়েছে
- [ ] Backend redeploy করা হয়েছে
- [ ] Production এ email test করা হয়েছে

---

## 🎉 Success!

এখন আপনার Email System সম্পূর্ণভাবে functional! 

**Need Help?** 
- Backend console logs check করুন
- Email template customize করতে `backend/api/emailService.js` file edit করুন
- Gmail SMTP settings: https://support.google.com/mail/answer/7126229

---

## 📧 Email Templates Location

All email templates আছে: `backend/api/emailService.js`

আপনি customize করতে পারেন:
- Email subject
- Email body HTML
- Colors & design
- Bangla/English content

Happy Emailing! 🚀
