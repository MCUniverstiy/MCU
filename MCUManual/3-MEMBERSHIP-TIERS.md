# 💎 Membership Tiers Management Guide

**URL:** `https://your-mcu-site.com/admin/cms/membership`

This guide explains how to manage VIP membership tiers, pricing, benefits lists, and course discount percentages.

---

## 🎯 What This Section Does
Tiers created here are displayed on the public **Membership** page (`/membership`). When users purchase a membership plan, they receive exclusive member benefits and automatic discounts on all course purchases!

---

## ➕ How to Create or Edit a Membership Tier

1. Navigate to **Content Manager → Membership tiers** (`/admin/cms/membership`).
2. Click **`+ Add membership tier`** (or click **Edit** next to an existing plan).
3. The editor sidebar will open on the right.
4. Fill out the fields:

| Field Name | Description & Example |
| :--- | :--- |
| **Display Name \*** | The plan title shown to visitors (e.g., `Chartered Fellow`, `International Member`). |
| **Category \*** | Plan group (e.g., `International`, `Executive`, `Corporate`). |
| **Price \*** | Plan price (e.g., `50000`). |
| **Currency** | Select currency from dropdown (`USD`, `HKD`, `SGD`, `GBP`, `EUR`, `AUD`). |
| **Billing Label** | Time period text (e.g., `/ year` or `/ month`). |
| **Course Discount (%)** | Percentage discount members receive on course purchases (e.g. `10` = 10% off all courses). |
| **Description** | Short summary explaining who this membership tier is designed for. |
| **Benefits (one per line)** | List of member perks. **Type one benefit per line** (e.g., <br>`Private briefings`<br>`International member directory access`<br>`Priority event invitations`). |
| **Accent Colour** | Pick a brand color hex code (e.g., `#2EC4B6` or `#E5A52E`) for card borders and accents. |
| **Display Order** | Numerical rank deciding card order on the page (`0` = first card on left, `1` = second, etc.). |
| **Highlight as most popular** | Checkbox. Adds a prominent "POPULAR" badge to the card. |
| **Visible on public page** | Checkbox. Uncheck to hide draft tiers from public visitors while keeping them in admin. |

5. Click **Save tier**.

---

## 💡 How Member Discounts Work Automatically

When an active member logs into the website and visits the **Courses** page:
* The system detects their membership tier discount rate (e.g. 10% off).
* The checkout modal automatically calculates and applies their discount price!
* Example: A HK$12,500 course with a 10% discount shows as **HK$11,250** at checkout.
