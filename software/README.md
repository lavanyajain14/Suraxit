# Suraxit - Fall Detection & Safety Monitoring Dashboard

A minimalistic, modern dashboard for real-time monitoring of fall detection systems and worker safety metrics.

## Features

- **Landing Page**: Elegant hero section with video background
- **Dashboard**: Real-time sensor data visualization in bento grid layout
- **SPO2 Monitoring**: Blood oxygen level tracking
- **Accelerometer Data**: 3-axis motion detection
- **Fall Detection**: Instant fall detection alerts
- **Environmental Monitoring**: Air quality and gas level monitoring
- **Device Status**: Real-time status of all connected sensors (ESP32, MPU6050, SPO2 sensor)

## Tech Stack

- React 18
- Vite
- React Router
- Tailwind CSS
- Lucide React (icons)

## Design System

### Fonts
- **UI/Navigation**: Manrope
- **Buttons/Tags**: Cabin
- **Headlines**: Instrument Serif
- **Body Text**: Inter

### Colors
- **Primary**: Purple #7b39fc
- **Accent**: Dark Purple #2b2344
- **Background**: Black-grey tones (#0a0a0a, #1a1a1a)
- **Text**: White with varying opacity

## Getting Started

### Installation

```bash
cd software
npm install
```

### Development

```bash
npm run dev
```

The application will run on `http://localhost:5173`

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
software/
├── src/
│   ├── components/
│   │   └── Navbar.jsx          # Navigation component
│   ├── pages/
│   │   ├── Landing.jsx         # Landing page with hero
│   │   └── Dashboard.jsx       # Main dashboard
│   ├── App.jsx                 # Router configuration
│   ├── main.jsx                # Entry point
│   └── index.css               # Global styles
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
└── postcss.config.js
```

## Sensor Integration

The dashboard is designed to display data from:
- **ESP32**: Main microcontroller
- **MPU6050/ADXL345**: 3-axis accelerometer
- **SPO2 Sensor**: Blood oxygen monitoring
- **Buzzer/LED/LCD**: Alert systems
- **Environmental Sensors**: Air quality monitoring

## Routes

- `/` - Landing page
- `/dashboard` - Main dashboard with sensor data

## Customization

To modify sensor data or add new metrics, edit the Dashboard component at `src/pages/Dashboard.jsx`.

The bento grid layout can be customized by adjusting the grid classes in the Dashboard component.

## License

MIT
