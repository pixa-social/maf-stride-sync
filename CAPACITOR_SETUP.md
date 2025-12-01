# MAF Walking - iOS Setup

## Quick Start (3 Steps)

### 1. Clone & Install
```bash
git clone <YOUR_GITHUB_REPO_URL>
cd <YOUR_PROJECT_NAME>
npm install
npm run build
npx cap add ios
npx cap sync ios
```

### 2. Open in Xcode
```bash
npx cap open ios
```

### 3. Enable HealthKit in Xcode
1. Select **App** target in the left sidebar
2. Go to **Signing & Capabilities** tab
3. Click **+ Capability** → Add **HealthKit**
4. Check **Clinical Health Records** if needed
5. Click **Run** (▶️) to build and run on your device/simulator

That's it! The app will request HealthKit permissions on first launch.

---

## After Making Code Changes

```bash
npm run build
npx cap sync ios
```

Then run again from Xcode.

## Troubleshooting

- **HealthKit not working**: Make sure you're on a real device or iOS Simulator with Health app
- **Build errors**: Try `Product > Clean Build Folder` in Xcode
- **Permissions denied**: Go to Settings > Privacy > Health on device
