# 📧 Email Templates Overview

## আপনার Email System এ যেসব Templates আছে:

---

## 1. 🎉 Welcome Email

**কখন পাঠানো হয়:** নতুন user registration এর সময়

**Subject:** 🎉 Welcome to ICST Issue Portal!

**Content Highlights:**
- Personalized greeting with user's name
- Beautiful gradient header (purple to violet)
- Feature list (যা যা করা যাবে)
- Direct login button/link
- Bangla content for better understanding

**Call-to-Action:** "Login করুন" button

**Design:** 
- Modern gradient background
- Clean card layout
- Mobile responsive
- Professional footer

---

## 2. 🔑 Password Reset Email

**কখন পাঠানো হয়:** User forgot password request করলে

**Subject:** 🔑 Password Reset Request - ICST Issue Portal

**Content Highlights:**
- Security warning (30 minutes validity)
- Large prominent reset button
- Alternative link copy option
- Yellow warning box for important notice
- Bangla instructions

**Call-to-Action:** "নতুন Password Set করুন" button

**Security Features:**
- Unique token per request
- 30-minute expiration
- One-time use only
- Secure HTTPS link

**Design:**
- Pink/red gradient for urgency
- Warning box for attention
- Clear instructions
- Fallback text link

---

## 3. 📢 Bulk Email / Broadcast

**কখন পাঠানো হয়:** Admin panel থেকে bulk email পাঠালে

**Subject:** 📢 [Admin's Custom Subject]

**Content Highlights:**
- Custom subject in header
- Admin's message (supports Bangla & English)
- Clean, readable format
- Preserves line breaks and formatting

**Use Cases:**
- Important announcements
- System maintenance notices
- Event notifications
- General updates

**Design:**
- Purple gradient header
- Simple, clean content area
- Pre-wrap for proper formatting
- Professional branding

---

## 4. 📋 Issue Update Email (Backend Ready)

**কখন পাঠানো হবে:** Issue এর status change হলে

**Subject:** 📋 Issue Update: [Issue Title]

**Content Highlights:**
- Issue title displayed prominently
- Status change visualization (old → new)
- Color-coded status badges
- Direct link to dashboard

**Call-to-Action:** "Dashboard দেখুন" button

**Design:**
- Visual status transition
- Color coding for different statuses
- Clear and informative
- Quick access to detailed view

**Note:** Frontend integration পরে করা যাবে

---

## 🎨 Common Design Elements:

### Header Design:
```
┌──────────────────────────────┐
│   Gradient Background        │
│   Purple → Violet            │
│                              │
│   📧 Title/Subject           │
│   (White text, large font)   │
└──────────────────────────────┘
```

### Content Card:
```
┌──────────────────────────────┐
│  White Background            │
│  Rounded corners             │
│  Shadow for depth            │
│                              │
│  [Content here]              │
│                              │
└──────────────────────────────┘
```

### Call-to-Action Button:
```
┌──────────────────────────────┐
│   Gradient Button            │
│   Purple → Violet            │
│   White Text                 │
│   Rounded, Bold              │
│   Arrow icon →               │
└──────────────────────────────┘
```

### Footer:
```
┌──────────────────────────────┐
│  Light gray background       │
│  © 2025 ICST Issue Portal    │
│  Small text, centered        │
└──────────────────────────────┘
```

---

## 🎯 Email Template Features:

### ✅ Responsive Design
- Mobile-first approach
- Max-width: 600px (email standard)
- Flexible layouts
- Touch-friendly buttons

### ✅ Cross-Client Compatible
- Works in Gmail, Outlook, Yahoo
- Inline CSS (required for emails)
- No external dependencies
- Tables for layout (email best practice)

### ✅ Accessibility
- Semantic HTML
- High contrast colors
- Large, readable fonts
- Clear CTAs

### ✅ Branding
- Consistent color scheme
- Purple/violet gradient theme
- Professional appearance
- ICST branding

### ✅ Bilingual Support
- Bangla + English content
- UTF-8 encoding
- Proper font rendering
- Cultural sensitivity

---

## 🔧 Customization Guide:

### To Change Email Colors:

**File:** `backend/api/emailService.js`

Find:
```javascript
background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

Replace with your gradient:
```javascript
background: linear-gradient(135deg, #your-color-1 0%, #your-color-2 100%);
```

### To Change Email Content:

**File:** `backend/api/emailService.js`

Find the template:
```javascript
welcome: (name) => ({
    subject: 'Your new subject',
    html: `Your new HTML here`
}),
```

### To Add New Template:

```javascript
const emailTemplates = {
    // ... existing templates
    
    newTemplate: (param1, param2) => ({
        subject: `Your Subject with ${param1}`,
        html: `
            <!DOCTYPE html>
            <html>
            <body>
                <p>Hello ${param2}!</p>
            </body>
            </html>
        `
    })
};
```

Then use it:
```javascript
await sendEmail(userEmail, emailTemplates.newTemplate, [value1, value2]);
```

---

## 📊 Email Analytics (Future Enhancement):

### Tracking Metrics You Can Add:
- Email open rate
- Link click rate
- Bounce rate
- Delivery success rate
- Time to open

### Implementation Ideas:
- Add tracking pixel
- Use UTM parameters in links
- Log email events in database
- Create admin analytics dashboard

---

## 🔐 Security Best Practices:

### ✅ Already Implemented:
- Secure token generation (crypto.randomBytes)
- Token expiration (30 minutes)
- One-time use tokens
- HTTPS links only
- No sensitive data in emails

### 🔒 Additional Recommendations:
- Rate limiting on email endpoints
- CAPTCHA on forgot password
- Email verification for new signups
- Two-factor authentication
- IP logging for password resets

---

## 📝 Testing All Templates:

### 1. Test Welcome Email:
```bash
# Register new user via API or frontend
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test User",
    "email": "test@example.com",
    "password": "password123",
    "department": "CSE",
    "roll": "12345"
  }'
```

### 2. Test Password Reset:
```bash
curl -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 3. Test Bulk Email:
```bash
# Login as admin first, then:
curl -X POST http://localhost:3000/api/admin/send-bulk-email \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "subject": "Test Broadcast",
    "body": "This is a test message",
    "recipients": "all"
  }'
```

---

## 🎨 Template Preview URLs:

যখন local server run করবেন, templates preview করতে পারবেন:

```
http://localhost:3000/api/test/preview-email?template=welcome
http://localhost:3000/api/test/preview-email?template=reset
http://localhost:3000/api/test/preview-email?template=bulk
```

*(Note: এই preview endpoints implement করতে হবে development এর জন্য)*

---

## 💡 Pro Tips:

1. **Test Before Sending:**
   - Always send test emails to yourself first
   - Check in multiple email clients
   - Verify mobile rendering

2. **Keep It Simple:**
   - Avoid complex CSS
   - Use inline styles
   - Tables for layout
   - Minimal images

3. **Spam Prevention:**
   - Avoid spam trigger words
   - Include unsubscribe link (for bulk)
   - Authenticate your domain (SPF, DKIM)
   - Maintain good sender reputation

4. **Performance:**
   - Keep email size under 100KB
   - Optimize images
   - Async sending
   - Batch processing for bulk

---

**All templates আছে:** `backend/api/emailService.js`

**Customize করতে পারেন:** Colors, content, layout, branding

**Happy Customizing!** 🎨✨
