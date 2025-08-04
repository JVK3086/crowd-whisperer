# SCFMS Installation Guide

This guide will help you set up the Smart Crowd Flow Management System (SCFMS) on your local development environment.

## 📋 Prerequisites

Before installing SCFMS, ensure you have the following installed on your system:

### Required Software
- **Node.js**: Version 18.0 or higher (LTS recommended)
  - Download from: https://nodejs.org/
  - Verify installation: `node --version`
- **npm**: Version 9.0 or higher (comes with Node.js)
  - Verify installation: `npm --version`
- **Git**: Latest version for version control
  - Download from: https://git-scm.com/

### Recommended Development Tools
- **VS Code**: With TypeScript and React extensions
- **Chrome/Firefox**: For testing and debugging
- **Terminal/Command Prompt**: For running commands

## 🚀 Quick Start Installation

### Step 1: Clone the Repository
```bash
# Clone the project repository
git clone <repository-url>
cd scfms

# Verify you're in the correct directory
ls -la
```

### Step 2: Install Dependencies
```bash
# Install all project dependencies
npm install

# If you encounter peer dependency warnings, use:
npm install --legacy-peer-deps
```

### Step 3: Start Development Server
```bash
# Start the development server with hot reload
npm run dev
```

### Step 4: Access the Application
Once the server starts, open your browser and navigate to:
- **Main Application**: http://localhost:5173/
- **Admin Dashboard**: http://localhost:5173/admin
- **Mobile Interface**: http://localhost:5173/mobile
- **Admin Help Guide**: http://localhost:5173/admin/help
- **Mobile Help Guide**: http://localhost:5173/mobile/help

## 🔧 Detailed Setup Instructions

### Development Environment Setup

1. **Verify Node.js Installation**
   ```bash
   node --version  # Should show v18.0.0 or higher
   npm --version   # Should show v9.0.0 or higher
   ```

2. **Clone and Navigate**
   ```bash
   git clone <repository-url>
   cd scfms
   ```

3. **Install Dependencies**
   ```bash
   # Primary installation
   npm install
   
   # If you see peer dependency conflicts:
   npm install --legacy-peer-deps
   
   # Alternative using Yarn (if preferred):
   yarn install
   ```

4. **Verify Installation**
   ```bash
   # Check if all dependencies are installed
   npm list --depth=0
   
   # Verify TypeScript compilation
   npx tsc --noEmit
   ```

### Available NPM Scripts

```bash
# Development
npm run dev          # Start development server with hot reload
npm run build        # Build for production
npm run preview      # Preview production build locally

# Code Quality
npm run lint         # Run ESLint for code analysis
npm run type-check   # Check TypeScript types (if available)

# Utilities
npm run clean        # Clean build artifacts (if available)
```

## 🌐 Accessing Different Interfaces

### Admin Dashboard
- **URL**: http://localhost:5173/admin
- **Features**: Real-time monitoring, interactive maps, emergency controls, venue setup
- **Best for**: Event organizers, security teams, venue managers
- **Help Guide**: http://localhost:5173/admin/help

### Mobile Application
- **URL**: http://localhost:5173/mobile
- **Features**: Crowd maps, navigation, panic button, alerts, QR scanner, offline support
- **Best for**: Visitors, attendees, general public
- **Mobile Testing**: Use browser dev tools to simulate mobile devices
- **Help Guide**: http://localhost:5173/mobile/help

### Landing Page
- **URL**: http://localhost:5173/
- **Features**: Overview and navigation to other interfaces
- **Purpose**: Entry point and system introduction

## 🛠️ Development Workflow

### Project Structure
```
scfms/
├── src/
│   ├── components/        # Reusable UI components
│   │   ├── ui/           # shadcn/ui components
│   │   ├── ai/           # AI-related components
│   │   └── mobile/       # Mobile-specific components
│   ├── pages/            # Route components
│   ├── services/         # Business logic and API services
│   ├── hooks/            # Custom React hooks
│   └── lib/              # Utility functions
├── public/               # Static assets
├── package.json          # Project dependencies
└── README.md            # Project documentation
```

### Making Changes
1. **Edit Components**: Modify files in `src/components/`
2. **Add Pages**: Create new routes in `src/pages/`
3. **Update Services**: Modify business logic in `src/services/`
4. **Test Changes**: The dev server auto-reloads on file changes

### TypeScript Development
- All files use TypeScript for type safety
- Components are fully typed with interfaces
- Services include comprehensive type definitions
- IDE autocomplete and error checking enabled

## 🔍 Troubleshooting

### Common Issues and Solutions

#### Port Already in Use
```bash
# If port 5173 is busy, Vite will automatically try the next available port
# Check the terminal output for the actual port being used
```

#### Dependency Installation Errors
```bash
# Clear npm cache
npm cache clean --force

# Delete node_modules and reinstall
rm -rf node_modules package-lock.json
npm install --legacy-peer-deps
```

#### TypeScript Errors
```bash
# Check for TypeScript errors
npx tsc --noEmit

# Restart TypeScript server in VS Code
# Press Ctrl+Shift+P and type "TypeScript: Restart TS Server"
```

#### Browser Not Opening
- Manually navigate to http://localhost:5173/
- Check if any firewall is blocking the port
- Try using a different browser

#### Hot Reload Not Working
```bash
# Restart the development server
# Press Ctrl+C to stop, then npm run dev again
```

### Performance Issues
If the development server is slow:
1. **Close unnecessary browser tabs**
2. **Restart the development server**
3. **Clear browser cache**
4. **Check system resources**

## 🌍 Browser Compatibility

### Supported Browsers
- **Chrome**: Version 90+
- **Firefox**: Version 88+
- **Safari**: Version 14+
- **Edge**: Version 90+

### Required Browser Features
- **WebSocket Support**: For real-time updates
- **Geolocation API**: For location-based features
- **ES6+ Support**: For modern JavaScript features
- **CSS Grid/Flexbox**: For responsive layouts

### Testing on Mobile
```bash
# Open Chrome DevTools
# Press F12 or Ctrl+Shift+I
# Click the mobile device icon
# Select device type (iPhone, Android, etc.)
# Navigate to http://localhost:5173/mobile
```

## 📱 Mobile Development

### Testing Mobile Features
1. **Enable location services** in your browser
2. **Use mobile viewport** in developer tools
3. **Test touch interactions** using mouse simulation
4. **Check responsive design** at different screen sizes

### Mobile-Specific URLs
- **Mobile App**: http://localhost:5173/mobile
- **Features**: Touch-optimized interface, GPS integration
- **Performance**: Optimized for mobile networks

## 🔐 Environment Configuration

### Environment Variables (Future)
When backend services are integrated, create a `.env` file:
```env
# API Configuration
VITE_API_URL=http://localhost:3001
VITE_WS_URL=ws://localhost:3001

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_NOTIFICATIONS=true

# External Services
VITE_MAPS_API_KEY=your_maps_api_key
VITE_NOTIFICATION_KEY=your_notification_key
```

## 📊 Performance Optimization

### Development Performance
- **Fast Refresh**: Instant updates on file changes
- **TypeScript**: Real-time type checking
- **ESLint**: Code quality checks on save
- **Vite**: Optimized bundling and serving

### Production Build
```bash
# Create production build
npm run build

# Preview production build
npm run preview

# Build artifacts will be in 'dist/' folder
```

## 🧪 Testing the Installation

### Functional Tests
1. **Navigate to admin dashboard**: Check real-time updates and venue setup
2. **Test mobile interface**: Verify panic button, navigation, QR scanner, and offline features
3. **Check responsiveness**: Test on different screen sizes and venue types
4. **Verify real-time features**: Watch for live data updates and notifications
5. **Test help systems**: Access user guides from both admin and mobile interfaces

### Feature Verification
- ✅ **Interactive Maps**: Click zones and view details
- ✅ **Panic Button**: Test emergency alert flow
- ✅ **Navigation**: Calculate routes between destinations
- ✅ **QR Scanner**: Test QR code scanning functionality
- ✅ **Event Schedule**: View real-time event updates
- ✅ **Feedback System**: Submit reports and feedback
- ✅ **Offline Support**: Test offline map and emergency features
- ✅ **Venue Setup**: Configure different venue types
- ✅ **Multi-language**: Switch between supported languages
- ✅ **Real-time Updates**: Watch crowd data changes
- ✅ **Help Systems**: Access comprehensive user guides

## 📞 Getting Help

### Documentation
- **Main README**: Comprehensive feature documentation
- **Component Docs**: In-code documentation for all components
- **TypeScript Types**: Full type definitions available

### Support Channels
- **GitHub Issues**: Report bugs or request features
- **Code Comments**: Detailed inline documentation
- **TypeScript IntelliSense**: IDE autocomplete and help

### Community Resources
- **React Documentation**: https://react.dev/
- **TypeScript Handbook**: https://www.typescriptlang.org/docs/
- **Vite Guide**: https://vitejs.dev/guide/
- **Tailwind CSS**: https://tailwindcss.com/docs

## ✅ Installation Complete

If you've successfully completed all steps, you should now have:
- ✅ SCFMS running on http://localhost:5173/
- ✅ Admin dashboard accessible at `/admin` with venue setup
- ✅ Mobile interface available at `/mobile` with enhanced features
- ✅ Help guides accessible at `/admin/help` and `/mobile/help`
- ✅ Real-time features working with mock data
- ✅ Universal venue type support and customization
- ✅ TypeScript compilation without errors
- ✅ Hot reload working for development

**Next Steps:**
1. Explore the admin dashboard features and venue setup
2. Test the mobile interface on different devices with new features
3. Access the built-in help guides for comprehensive usage instructions
4. Configure your venue type and customize the interface
5. Review the code structure for further customization
6. Check the main README for detailed feature documentation

---

**Happy coding! 🎉**

For any issues or questions, please refer to the troubleshooting section above or create an issue in the project repository.