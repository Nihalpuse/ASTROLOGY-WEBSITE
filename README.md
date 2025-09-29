# Astrology Website

A comprehensive astrology consultation platform with real-time chat and video calling capabilities.

## Features

- Real-time chat with astrologers
- Video calling functionality
- Booking system
- Payment integration
- Multi-language support

## Getting Started

### Prerequisites

- Node.js 18+ 
- MySQL database
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see `.env.example`)
4. Run database migrations: `npx prisma migrate dev`
5. Start the development server: `npm run dev`

### Socket Server for Video Calls

The video calling feature requires a separate socket server to be running. You have several options:

#### Option 1: Start both servers together
```bash
npm run dev:full
```

#### Option 2: Start socket server separately
```bash
# Terminal 1: Start Next.js app
npm run dev

# Terminal 2: Start socket server
npm run socket
```

#### Option 3: Start with chat functionality
```bash
npm run dev:chat
```

### Environment Variables

Create a `.env` file with the following variables:

```env
# Database
DATABASE_URL="mysql://user:password@localhost:3306/your_database"

# JWT
JWT_SECRET="your-super-secret-jwt-key"

# Socket Server
SOCKET_PORT=3001
NEXT_PUBLIC_SOCKET_URL="http://localhost:3001"

# App Configuration
NEXT_PUBLIC_APP_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-nextauth-secret"
NEXTAUTH_URL="http://localhost:3000"
```

## Troubleshooting

### Video Call Issues

If you encounter "Socket connection not available" errors:

1. **Check if socket server is running**: The video calling feature requires the socket server to be active
2. **Start the socket server**: Run `npm run socket` in a separate terminal
3. **Check environment variables**: Ensure `NEXT_PUBLIC_SOCKET_URL` is set correctly
4. **Check browser console**: Look for connection errors in the browser's developer tools

### Common Issues

- **Socket connection failed**: Make sure the socket server is running on port 3001
- **Video call not starting**: Ensure you have a paid booking and the socket server is connected
- **Chat not working**: Check if the user is authenticated and has an active booking

## Development

### Available Scripts

- `npm run dev` - Start Next.js development server
- `npm run socket` - Start socket server only
- `npm run dev:full` - Start both Next.js and socket server
- `npm run dev:chat` - Start with chat functionality
- `npm run build` - Build for production
- `npm run start` - Start production server

## License

This project is licensed under the MIT License.
