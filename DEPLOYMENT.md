# Church Setup Roster - Deployment Guide

## Quick Deploy to Vercel (Recommended)

### 1. Prerequisites
- GitHub account
- Vercel account (free)
- Supabase project set up

### 2. Deploy Steps

1. **Push to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Church Setup Roster"
   git branch -M main
   git remote add origin https://github.com/yourusername/church-roster.git
   git push -u origin main
   ```

2. **Deploy on Vercel**:
   - Go to https://vercel.com/new
   - Import your GitHub repository
   - Vercel will auto-detect Next.js
   - Click "Deploy"

3. **Configure Environment Variables**:
   In Vercel dashboard → Settings → Environment Variables:
   ```
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Redeploy**:
   - Trigger a new deployment after adding env vars
   - Your app will be live at `https://your-project.vercel.app`

### 3. Custom Domain (Optional)
- In Vercel dashboard → Settings → Domains
- Add your custom domain
- Follow DNS configuration instructions

## Alternative: Manual Deployment

### Build for Production
```bash
npm run build
npm run start
```

### Deploy to Other Platforms
- **Netlify**: Connect GitHub repo, auto-build on push
- **Railway**: One-click deploy from GitHub
- **DigitalOcean App Platform**: GitHub integration

## Post-Deployment Checklist

### ✅ Functionality Test
- [ ] Homepage loads and shows events
- [ ] Can add members
- [ ] Can create events
- [ ] Can assign members to events
- [ ] WhatsApp sharing works
- [ ] Mobile responsive on real devices

### ✅ Performance Test
- [ ] Page loads in <3 seconds
- [ ] Images load properly
- [ ] Animations are smooth
- [ ] No console errors

### ✅ Mobile Test
- [ ] Test on iPhone Safari
- [ ] Test on Android Chrome
- [ ] Touch targets are adequate (44px+)
- [ ] Text is readable without zoom
- [ ] Forms work on mobile keyboards

### ✅ WhatsApp Integration Test
- [ ] Share button opens WhatsApp
- [ ] Rich previews show correctly
- [ ] Links work when received
- [ ] Event pages load from shared links

## Environment Variables

Required for production:
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
```

## Monitoring & Analytics (Optional)

### Add Google Analytics
```typescript
// Add to layout.tsx
<Script
  src="https://www.googletagmanager.com/gtag/js?id=GA_MEASUREMENT_ID"
  strategy="afterInteractive"
/>
```

### Vercel Analytics
- Enable in Vercel dashboard
- Automatic performance monitoring

## Troubleshooting

### Common Issues:
1. **Environment variables not working**: Redeploy after adding them
2. **Supabase connection fails**: Check URL and key format
3. **Build fails**: Check for TypeScript errors
4. **Images not loading**: Verify public folder structure

### Support:
- Vercel Docs: https://vercel.com/docs
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.io/docs

## Success! 🎉

Your Church Setup Roster is now live and ready to use!

**Share with your team:**
- Main URL: `https://your-app.vercel.app`
- Add to phone home screens for app-like experience
- Share individual events via WhatsApp