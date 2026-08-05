# 📖 MCU Admin Dashboard: Google Classroom Linking Walkthrough

This step-by-step guide explains how non-technical course managers can log in, create or edit courses, and link them to Google Classroom.

---

## 🔑 Step 1: Sign in to your Admin Account

1. Open your web browser and go to **`https://your-mcu-site.com/login`** (or click **Login** in the navigation bar).
2. Enter the administrator credentials:
   * **Email Address:** `mcuinstitute@gmail.com`
   * **Password:** `12345678`
3. Click the **"Sign In →"** button.

---

## 🧭 Step 2: Navigate to the Course Manager

1. Once logged in, navigate to **Content Manager** (`/admin/cms`).
2. You will see management cards for **Courses**, **Instructors**, **Membership**, and **Products**.
3. Click on **Courses** (or navigate directly to `/admin/cms/courses`).

---

## 🔗 Step 3: Copy your Link from Google Classroom

1. Open a new tab in your browser and go to **[Google Classroom](https://classroom.google.com)** using your institute Gmail.
2. Open the class created for your course (e.g., *"Wealth Management Masterclass"*).
3. Copy the full web address in your browser address bar:
   `https://classroom.google.com/c/ODY5MDk0NzIyMTAz`
   *(Note: You can copy the entire link directly — the admin panel handles parsing automatically).*

---

## 📝 Step 4: Create or Edit a Course in MCU Admin

1. On the MCU Admin Courses page (`/admin/cms/courses`), choose an action:
   * **To edit an existing course:** Click **Edit** next to the course name in the list.
   * **To create a new course:** Click the **+ Add course** button at the top right.
2. The Course Editor panel will open on the right side of your screen.

---

## ✏️ Step 5: Fill in the Course Details & Google Classroom Link

Fill out the form fields:

* **Title \***: Name of the course (e.g. `CEO Wealth Management Program`)
* **Category \***: Course topic category (e.g. `Wealth Management`)
* **Google Classroom Link or Class ID**: 
  * Paste the link you copied from Step 3:  
    `https://classroom.google.com/c/ODY5MDk0NzIyMTAz`
* **Price (HK$) \***: Price of the course (e.g. `12500` or `0` for free)
* **Duration / Level / Format / Instructor / Description**: Fill in as needed.

---

## 💾 Step 6: Save & Verify

1. Click **Save course**.
2. The course list will immediately update.
3. Look at the course in the list:
   * It will display a green indicator: **`🏫 Classroom Linked`**
   * This confirms the Google Classroom linkage is active!

---

## 🎓 Step 7: How Students Access the Classroom

When a student pays for or enrolls in the course:
1. MCU receives payment confirmation via Stripe.
2. MCU automatically sends a Google Classroom invitation email to the email address the student registered with.
3. The student opens their email, clicks **Join**, and gets instant access to all class materials, assignments, and calendar events.
