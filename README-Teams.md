# Microsoft Teams Clone

A fully functional Microsoft Teams clone built with React and Tailwind CSS. This application replicates the core features and user interface of Microsoft Teams, providing a complete communication and collaboration platform.

## 🌟 Features

### ✅ **Core Functionality**
- **Teams & Channels**: Organized workspace with expandable teams and channels
- **Real-time Messaging**: Chat interface with message threading
- **Video Calling**: Full video conference interface with participant grid
- **User Management**: Avatar-based user identification
- **Search**: Channel-wide search functionality
- **Responsive Design**: Works seamlessly across desktop and mobile devices

### 🎥 **Video Call Features**
- Participant video grid (2x2 layout)
- Mute/unmute controls
- Video on/off toggle
- Screen sharing capability
- Participant list
- Call duration tracking
- End call functionality

### 💬 **Messaging Features**
- Rich text message composer
- Formatting toolbar (Bold, Italic, Underline, Links, Emojis)
- File attachment support
- Message reactions
- Reply threading
- Auto-scroll to latest messages
- Keyboard shortcuts (Enter to send, Shift+Enter for new line)

### 🎨 **UI/UX Features**
- Microsoft Teams-like color scheme
- Smooth animations and transitions
- Hover effects and interactive elements
- Custom scrollbars
- Focus indicators for accessibility
- Professional avatars with gradients

## 🏗️ **Project Structure**

```
src/
├── components/
│   ├── TeamsApp.js          # Main application container
│   ├── Sidebar.js           # Teams/channels navigation
│   ├── TopBar.js            # Channel header with controls
│   ├── ChatArea.js          # Message display area
│   ├── MessageList.js       # Individual message rendering
│   ├── MessageInput.js      # Rich text message composer
│   └── VideoCall.js         # Video conference interface
├── App.js                   # App entry point
├── App.css                  # Teams-like styling
└── index.js                 # React DOM entry
```

## 🚀 **Getting Started**

### **Prerequisites**
- Node.js (v14 or higher)
- npm or yarn

### **Installation**

1. **Clone the repository:**
   ```bash
   git clone -b teams-clone-app https://github.com/BajrangBarala7/3d.git
   cd 3d
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Start the development server:**
   ```bash
   npm start
   ```

4. **Open your browser:**
   Navigate to `http://localhost:3000`

## 🎯 **Usage Guide**

### **Navigation**
- **Sidebar**: Click on teams to expand/collapse channels
- **Channels**: Click on any channel to switch the active conversation
- **Search**: Use the search bar in the top bar to find messages

### **Messaging**
- **Send Message**: Type in the message input and press Enter
- **New Line**: Use Shift+Enter for line breaks
- **Formatting**: Click the 🎨 icon to show/hide formatting toolbar
- **Attachments**: Click the 📎 icon to attach files
- **Emojis**: Click the 😊 icon for emoji picker

### **Video Calls**
- **Start Call**: Click the 📹 button in the top bar
- **Mute/Unmute**: Click the microphone button
- **Video Toggle**: Click the camera button
- **Screen Share**: Click the monitor button
- **End Call**: Click the red phone button

## 🛠️ **Technical Details**

### **Technologies Used**
- **React 18.2.0** - Frontend framework
- **Tailwind CSS 3.3.6** - Utility-first CSS framework
- **React Hooks** - State management
- **CSS Grid & Flexbox** - Layout system

### **Key Components**

#### **TeamsApp.js**
- Main application state management
- Handles active team/channel switching
- Manages video call state

#### **Sidebar.js**
- Teams and channels navigation
- Expandable/collapsible teams
- User profile section
- Navigation menu (Chat, Calls, Calendar, Files)

#### **VideoCall.js**
- Participant video grid
- Call controls interface
- Mute/video/screen share states
- Call information display

#### **MessageInput.js**
- Rich text input with formatting
- File attachment support
- Keyboard shortcuts
- Auto-resize textarea

### **State Management**
```javascript
// Main app state
const [activeTeam, setActiveTeam] = useState('General');
const [activeChannel, setActiveChannel] = useState('General');
const [isCallActive, setIsCallActive] = useState(false);

// Video call state
const [isMuted, setIsMuted] = useState(false);
const [isVideoOff, setIsVideoOff] = useState(false);
const [isScreenSharing, setIsScreenSharing] = useState(false);
```

## 🎨 **Customization**

### **Colors & Themes**
Edit `src/App.css` to customize the color scheme:
```css
/* Primary colors */
--teams-purple: #464775;
--teams-blue: #0078d4;
--teams-gray: #f3f2f1;
```

### **Adding New Features**
1. **New Components**: Add to `src/components/`
2. **Styling**: Use Tailwind classes or custom CSS
3. **State**: Use React hooks for local state

### **Teams & Channels**
Modify the teams array in `Sidebar.js`:
```javascript
const teams = [
  {
    name: 'Your Team',
    channels: ['General', 'Random', 'Development']
  }
];
```

## 📱 **Responsive Design**

The application is fully responsive with:
- **Desktop**: Full sidebar and multi-column layout
- **Tablet**: Collapsible sidebar
- **Mobile**: Stack layout with drawer navigation

## 🔧 **Development**

### **Available Scripts**
- `npm start` - Development server
- `npm build` - Production build
- `npm test` - Run tests
- `npm eject` - Eject from Create React App

### **Adding New Features**
1. Create component in `src/components/`
2. Import and use in parent component
3. Add styling with Tailwind classes
4. Update state management as needed

### **Testing**
```bash
# Run tests
npm test

# Run tests in watch mode
npm test -- --watch
```

## 🌐 **Browser Support**

- Chrome (recommended)
- Firefox
- Safari
- Edge

## 📄 **License**

This project is open source and available under the MIT License.

## 🤝 **Contributing**

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 **Support**

For support, please create an issue in the GitHub repository.

---

**Built with ❤️ using React and Tailwind CSS**