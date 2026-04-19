# MQTT Messenger Application Specification

## Project Overview
- **Name**: MQTT Messenger
- **Type**: Desktop Application (Electron)
- **Core Functionality**: Real-time messaging via MQTT protocol with configurable subscribe/publish topics
- **Target Users**: Developers and users wanting simple MQTT-based chat

## UI/UX Specification

### Layout Structure
- Single window application (900x650 default)
- Resizable, with minimum size 600x450
- Standard window frame with native controls

### Visual Design
- **Color Palette**:
  - Background: #1a1a2e (dark navy)
  - Surface: #16213e (darker blue)
  - Primary: #0f3460 (medium blue)
  - Accent: #e94560 (coral pink)
  - Text Primary: #eaeaea
  - Text Secondary: #a0a0a0
  - Message Sent: #1f4a6b
  - Message Received: #2a2a4a

- **Typography**:
  - Font Family: 'Segoe UI', system-ui, sans-serif
  - Heading: 18px bold
  - Body: 14px regular
  - Messages: 13px regular

- **Spacing**:
  - Base unit: 8px
  - Padding: 16px (2 units)
  - Margins: 8px between elements

### Components

1. **Header Bar**
   - App title
   - Connection status indicator (green/red dot)
   - Settings button

2. **Messages Area**
   - Scrollable list of messages
   - Each message shows: text, timestamp, sender indicator
   - Own messages aligned right (different color)
   - Incoming messages aligned left

3. **Message Input Area**
   - Multi-line text input
   - Send button
   - Auto-resize up to 4 lines

4. **Settings Modal**
   - MQTT Broker URL input
   - Subscribe Topic input
   - Publish Topic input
   - Username input (optional, for display)
   - Save/Cancel buttons

### Component States
- **Buttons**: Default → Hover (lighten 10%) → Active (darken 5%)
- **Inputs**: Default border → Focus (accent color border)
- **Connection**: Green (#22c55e) = Connected, Red (#ef4444) = Disconnected

## Functionality Specification

### Core Features
1. **MQTT Connection**
   - Connect to specified broker URL
   - Subscribe to specified topic
   - Publish messages to specified topic
   - Auto-reconnect on disconnect (with 5s delay)
   - Display connection status

2. **Messaging**
   - Send text messages to publish topic
   - Receive messages from subscribe topic
   - Display messages with timestamp
   - Distinguish own vs incoming messages

3. **Settings**
   - Configure MQTT broker URL
   - Configure subscribe topic
   - Configure publish topic
   - Set display username
   - Persist settings in localStorage

### User Interactions
1. Open app → Connect to MQTT with saved settings
2. Type message → Press Send or Enter → Message published
3. Receive message → Display in chat area
4. Click Settings → Open modal → Edit settings → Save

### Data Flow
- Incoming MQTT message → Parse JSON {sender, text, timestamp} → Add to messages array → Render
- Send form submit → Create message object → Publish to MQTT topic

### Edge Cases
- Empty message: Don't send
- No broker URL: Show error, don't connect
- MQTT connection failed: Show error status, allow retry
- Invalid JSON received: Display raw text

## Acceptance Criteria
1. Application launches without errors
2. Settings modal opens and closes properly
3. Can connect to MQTT broker with valid credentials
4. Messages sent appear in chat area
5. Messages received via MQTT appear in chat area
6. Settings persist across app restarts
7. Connection status displays correctly