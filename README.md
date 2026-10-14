# DripNest — Handcrafted Wooden Homeware & Lifestyle

A modern, responsive e-commerce application built with React, Vite, Tailwind CSS, and Firebase.

## Features
- **Artisan Product Catalog**: Filter by categories (Dining, Drinkware, Serving, Decor, Kitchenware), sort by price/rating/newest.
- **Product Detail Modal & Dedicated Page**: View high-resolution image galleries, description, specs (material, dimensions, care instructions, stock), and real reviews.
- **Instant WhatsApp Checkout**: Direct WhatsApp order integration configured to send all product details (name, price, description, image link) directly to `+918218167743`.
- **Shopping Bag & Inquiries**: Add items to bag, manage quantities, and checkout directly via WhatsApp.
- **Customer Reviews**: Star ratings and verified buyer feedback.
- **Admin Dashboard**: Manage products, stock quantities, and customer reviews with Firestore persistence.

---

## Deploying to Vercel

### Option 1: Vercel CLI (Quickest)
1. Extract this zip file onto your computer.
2. Open terminal in the project directory:
   ```bash
   npm install -g vercel
   vercel
   ```
3. Follow the prompts. Vercel will detect Vite automatically and deploy!

### Option 2: Upload to GitHub & Import in Vercel
1. Extract the zip file and push it to a new GitHub repository:
   ```bash
   git init
   git add .
   git commit -m "Initial commit of DripNest"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/dripnest.git
   git push -u origin main
   ```
2. Go to [vercel.com/new](https://vercel.com/new).
3. Import your GitHub repository.
4. Settings:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click **Deploy**.

---

## Local Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.
