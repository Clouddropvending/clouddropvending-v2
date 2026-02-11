# Cloud Drop Vending V2

A premium, futuristic single-page website for Cloud Drop Vending. Built with vanilla HTML/CSS/JS and Vite.

## 🚀 Getting Started

### Prerequisites
- Node.js (v16+)
- npm

### Installation
1.  Clone the repository.
2.  Install dependencies:
    ```bash
    npm install
    ```

### Development
Start the local development server:
```bash
npm run dev
```
Open `http://localhost:5173` (or the port shown) to view the site.

### Build for Production
Create an optimized build for deployment (minimized assets):
```bash
npm run build
```
The output will be in the `dist/` folder.

## 📂 Project Structure

- `index.html`: Main structure.
- `style.css`: All styles (Design System + Sections).
- `main.js`: Scroll animations (`IntersectionObserver`), Accordion, Back-to-Top logic.
- `/assets`: Put product images here.

## 🎨 Design System Constraints

- **Theme**: Dark (Charcoal/Black) + Electric Blue Accent (`#00f0ff`).
- **Typography**: 'Inter' (Google Fonts).
- **Effects**: Glassmorphism (`backdrop-filter`), 1px borders, subtle glow.
- **Motion**: Minimal. One signature "drift" animation in hero. Subtler micro-interactions.
- **Responsiveness**: Mobile-first. Strict `overflow-x: hidden`.

## ✅ Launch Checklist

1.  **Product Images**: Ensure images are in `/assets/products/` if real images are ready.
2.  **Links**: Update the "Instagram" and "Email Us" links in the footer.
3.  **Deploy**: Upload the `dist/` folder contents to a static host (GitHub Pages, Netlify, Vercel).
