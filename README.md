# Ept AI Chatbot Integration

This Ionic Angular application integrates Ept AI chatbot v2.0 for intelligent conversational AI support.

## Setup Instructions

### 1. Get Your Ept AI Access Token

1. Sign up at [https://ept.ai](https://ept.ai)
2. Create a new chatbot project
3. Get your access token from the dashboard

### 2. Configure the Chatbot

Open `src/app/home/home.page.ts` and replace `'YOUR_ACCESS_TOKEN_HERE'` with your actual Ept AI access token:

```typescript
ngOnInit() {
  // Replace with your actual token
  this.chatbotService.initializeChatbot('your-actual-token-here');
}
```

### 3. Customize Chatbot Settings (Optional)

Edit `src/app/services/chatbot.service.ts` to customize:
- Bot name and icon
- Default questions
- Welcome message
- File upload settings
- UI preferences

### 4. Add Knowledge Sources

To add knowledge sources to your chatbot:

1. Log in to your Ept AI dashboard at [https://ept.ai](https://ept.ai)
2. Navigate to your chatbot project
3. Go to "Knowledge Sources" section
4. Add your knowledge sources:
   - Upload documents (PDF, DOCX, TXT)
   - Add website URLs
   - Connect to databases
   - Add FAQ content

The chatbot will automatically use these knowledge sources to answer questions.

## Running the Application

```bash
# Install dependencies (if not already done)
npm install

# Start the development server
ionic serve
```

The app will open at `http://localhost:8100` and the chatbot widget will appear in the bottom-right corner.

## Features

- ✅ Modern Ept AI chatbot v2.0 with advanced UI
- ✅ File upload support
- ✅ Knowledge sources integration
- ✅ Customizable welcome message
- ✅ Default question suggestions
- ✅ Dark mode support
- ✅ Mobile-responsive design

## Chatbot Service API

The `ChatbotService` provides the following methods:

- `initializeChatbot(accessToken: string)` - Initialize the chatbot
- `showChatbot()` - Show the chatbot widget
- `hideChatbot()` - Hide the chatbot widget
- `setDarkMode(enabled: boolean)` - Toggle dark mode
- `updateAccessToken(newToken: string)` - Update access token (tokens expire after 24 hours)
- `isReady()` - Check if chatbot is initialized

## Troubleshooting

### Chatbot doesn't appear
- Check browser console for errors
- Verify your access token is correct
- Ensure the Ept AI script loaded successfully

### Token expired error
- Access tokens expire after 24 hours
- Use `chatbotService.updateAccessToken(newToken)` to refresh

### Knowledge sources not working
- Verify knowledge sources are properly configured in Ept AI dashboard
- Check that your chatbot has access to the knowledge sources
- Allow time for knowledge sources to be indexed (may take a few minutes)

## Next Steps

- Add backend service for secure token management (see `implementation_plan.md`)
- Customize chatbot styling to match your app theme
- Add analytics tracking for chatbot interactions
- Implement user authentication integration

## Documentation

- [Ept AI v2.0 Documentation](https://docs.ept.ai/docs/developer-guide/2.0/v2.0.0)
- [Ionic Framework](https://ionicframework.com/docs)
