# Capacitor Setup Guide for MAF Walking App

This guide will help you set up the MAF Walking app with Apple Watch and HealthKit integration.

## Prerequisites

- macOS computer with Xcode installed (for iOS development)
- Apple Developer account (for testing on physical devices)
- iOS device or simulator
- Node.js and npm installed

## Setup Steps

### 1. Export to GitHub

1. In Lovable, click the GitHub button in the top right
2. Export your project to a new or existing GitHub repository
3. Clone the repository to your local machine:
   ```bash
   git clone <YOUR_GITHUB_REPO_URL>
   cd <YOUR_PROJECT_NAME>
   ```

### 2. Install Dependencies

```bash
npm install
```

### 3. Initialize Capacitor (Already done in code)

The Capacitor configuration is already set up in `capacitor.config.ts`. However, you need to add the iOS platform:

```bash
npx cap add ios
```

### 4. Install HealthKit Plugin

```bash
npm install @capacitor-community/health
npx cap sync ios
```

### 5. Configure iOS Project

#### Enable HealthKit Capability

1. Open the iOS project in Xcode:
   ```bash
   npx cap open ios
   ```

2. In Xcode, select your project in the navigator
3. Select the "App" target
4. Go to "Signing & Capabilities" tab
5. Click "+ Capability" and add "HealthKit"

#### Update Entitlements

The app needs HealthKit access. The entitlements should automatically be added, but verify:

1. Check that `App.entitlements` includes:
   ```xml
   <key>com.apple.developer.healthkit</key>
   <true/>
   ```

### 6. Build and Run

#### Build the web assets:
```bash
npm run build
npx cap sync ios
```

#### Run on device or simulator:

**Using Xcode:**
1. Open the project: `npx cap open ios`
2. Select your target device/simulator
3. Click Run (▶️)

**Using CLI:**
```bash
npx cap run ios
```

### 7. Testing HealthKit Integration

On first launch, the app will request HealthKit permissions. Make sure to:

1. Grant all requested permissions
2. For best results, have an Apple Watch paired with your iPhone
3. Start a walking workout to see real-time heart rate data

## Development Workflow

### Hot Reload During Development

The app is configured to use hot reload from the Lovable sandbox. To use local development instead:

1. Update `capacitor.config.ts` and remove the `server` configuration
2. Run `npm run dev` in one terminal
3. Run `npx cap run ios -l --external` in another terminal

### Syncing Changes

After making changes to the code:

```bash
npm run build
npx cap sync ios
```

## Troubleshooting

### HealthKit Not Available

- Ensure you're running on a real device or iOS Simulator (iOS 8.0+)
- Check that HealthKit capability is enabled in Xcode
- Verify permissions are granted in Settings > Privacy > Health

### Build Errors

- Clean build folder in Xcode: Product > Clean Build Folder
- Delete `node_modules` and reinstall: `rm -rf node_modules && npm install`
- Re-sync Capacitor: `npx cap sync ios`

### App Not Connecting to Apple Watch

- Ensure Apple Watch is paired and nearby
- Check that Health app has permissions
- Restart both iPhone and Apple Watch

## Production Build

For App Store distribution:

1. Update version in `package.json`
2. Build: `npm run build`
3. Sync: `npx cap sync ios`
4. Open in Xcode: `npx cap open ios`
5. Archive and submit through Xcode

## Additional Resources

- [Capacitor Documentation](https://capacitorjs.com/docs)
- [HealthKit Capability Documentation](https://developer.apple.com/documentation/healthkit)
- [@capacitor-community/health Plugin](https://github.com/Ad-Scientiam/capacitor-health)
- [Lovable Documentation](https://docs.lovable.dev/features/mobile-development)

## Support

For issues with:
- **Capacitor setup**: Check [Capacitor Docs](https://capacitorjs.com/docs/ios)
- **HealthKit integration**: Review [Apple HealthKit Docs](https://developer.apple.com/documentation/healthkit)
- **App features**: Reach out via Lovable support
