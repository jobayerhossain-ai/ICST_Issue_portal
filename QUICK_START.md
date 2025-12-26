# ✅ QUICK START - Mail System Setup

## 🚀 3-Minute Setup Guide

### Step 1: Gmail App Password (2 minutes)

1. Open: https://myaccount.google.com/apppasswords
2. Sign in with: **jovayerhossain0@gmail.com**
3. Click "Select app" → Choose **Mail**
4. Click "Select device" → Choose **Other** → Type: "ICST Portal"
5. Click **GENERATE**
6. **COPY the 16-digit password** (এটা শুধু একবার দেখাবে!)

Example: `abcd efgh ijkl mnop`

---

### Step 2: Update .env File (30 seconds)

Open: `backend/.env`

Find this line:
```env
EMAIL_PASSWORD=your-app-specific-password-here
```

Replace with your copied password:
```env
EMAIL_PASSWORD=abcd efgh ijkl mnop
```

**Save the file!**

---

### Step 3: Test Locally (30 seconds)

```bash
cd backend
npm start
```

Then open frontend and try:
- Register a new account → Check email for welcome message ✅
- Use "Forgot Password" → Check email for reset link ✅

---

## 🎯 That's it! Your mail system is ready! 🚀

---

## 📦 For Vercel Deployment:

### Environment Variables to Add:

Go to: Vercel Dashboard → Your Backend Project → Settings → Environment Variables

Add these:

| Key | Value |
|-----|-------|
| `EMAIL_HOST` | `smtp.gmail.com` |
| `EMAIL_PORT` | `587` |
| `EMAIL_SECURE` | `false` |
| `EMAIL_USER` | `jovayerhossain0@gmail.com` |
| `EMAIL_PASSWORD` | `your-16-digit-app-password` |
| `FRONTEND_URL` | `https://icst-issue-portal.vercel.app` |

Then click **Redeploy** button.

---

## ✅ Quick Test Checklist:

- [ ] Gmail App Password generated
- [ ] `backend/.env` updated with password
- [ ] Tested registration → Welcome email received
- [ ] Tested forgot password → Reset email received
- [ ] Admin bulk email tested → Emails delivered
- [ ] Vercel environment variables added
- [ ] Production deployment tested

---

## 🆘 Having Issues?

### Email not sending?
- Check console logs in terminal
- Verify app password is correct
- Make sure 2-Step Verification is enabled in Gmail

### "Authentication failed" error?
- Re-generate app password
- Copy without spaces
- Update .env file
- Restart backend server

### Email going to spam?
- This is normal for new senders
- Users should check spam folder
- Mark as "Not Spam" to fix for future emails

---

## 📧 What You Get:

### 1. Welcome Email
- Sent automatically on user registration
- Beautiful HTML template
- Bangla + English

### 2. Password Reset Email
- Secure token-based system
- 30-minute expiry
- One-time use only

### 3. Bulk Email System
- Send to all users or students only
- Admin panel integration
- Professional templates

### 4. Future Ready
- Issue update notifications (backend ready)
- Customizable templates
- Scalable architecture

---

**Need more details?** Check `EMAIL_SETUP_GUIDE.md`

**Happy Emailing!** 🎉
