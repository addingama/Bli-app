# BliApp - Aplikasi Pengepul

Aplikasi mobile untuk manajemen transaksi pembelian, penjualan, dan stok barang pengepul.

## Features

### ✅ MVP (Phase 1)
- ✅ Input transaksi pembelian (multiple items)
- ✅ Input transaksi penjualan (multiple items)
- ✅ Auto-calculate total & subtotal
- ✅ Master data barang (CRUD)
- ✅ Master data supplier & pembeli
- ✅ Dashboard dengan ringkasan hari ini
- ✅ Tracking stok otomatis
- ✅ Riwayat transaksi
- ✅ Material Design UI (React Native Paper)

### 🚧 Coming Soon (Phase 2)
- Export ke Excel
- Generate struk WhatsApp
- Filter & search transaksi
- Laporan keuangan
- Edit transaksi (window terbatas)
- Backup/restore database

## Tech Stack

- **Framework:** React Native + Expo
- **UI Library:** React Native Paper (Material Design 3)
- **Navigation:** React Navigation v7
- **Database:** Expo SQLite
- **Language:** TypeScript (strict mode)
- **Date Handling:** date-fns
- **Icons:** Material Community Icons

## Project Structure

```
BliApp/
├── src/
│   ├── screens/           # All screen components
│   │   ├── HomeScreen.tsx
│   │   ├── BuyTransactionScreen.tsx
│   │   ├── SellTransactionScreen.tsx
│   │   ├── StockScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   └── MenuScreen.tsx
│   ├── components/        # Reusable components (future)
│   ├── database/          # SQLite setup & queries
│   │   ├── init.ts
│   │   ├── schema.sql
│   │   ├── types.ts
│   │   └── queries/
│   ├── navigation/        # Navigation setup
│   │   └── AppNavigator.tsx
│   ├── theme/             # Theme & styles
│   │   ├── colors.ts
│   │   ├── typography.ts
│   │   └── theme.ts
│   ├── utils/             # Utility functions
│   │   ├── formatCurrency.ts
│   │   ├── generateTransactionNumber.ts
│   │   └── whatsappShare.ts
│   ├── types/             # TypeScript types
│   │   └── index.ts
│   └── constants/         # Constants
│       └── index.ts
├── App.tsx                # Root component
├── app.json               # Expo configuration
├── package.json
└── tsconfig.json
```

## Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- Expo Go app (for testing on physical device)

### Setup

1. Clone the repository (or use existing folder)
   ```bash
   cd BliApp
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Start the development server
   ```bash
   npm start
   ```

4. Run on device/emulator
   - **Android:** Press `a` or run `npm run android`
   - **iOS:** Press `i` or run `npm run ios`
   - **Web:** Press `w` or run `npm run web`
   - **Scan QR Code:** Use Expo Go app on your phone

## Development

### Running the App

```bash
# Start Expo dev server
npm start

# Run on Android emulator
npm run android

# Run on iOS simulator (macOS only)
npm run ios

# Run in web browser
npm run web
```

### Database

Database will be initialized automatically on first launch with sample data:
- 5 sample barang (Plastik PET, Kardus Bekas, etc.)
- 2 sample suppliers
- 2 sample pembeli/pabrik

To reset database:
```typescript
import { resetDatabase } from './src/database/init';
await resetDatabase();
```

### TypeScript

Project uses TypeScript in strict mode. All files are strongly typed.

```typescript
// Example: Using types
import type { Transaksi, TransaksiItem } from './src/database/types';

const transaksi: Transaksi = {
  // ... type-safe object
};
```

## Database Schema

### Master Tables
- `barang` - Master data barang/item
- `supplier` - Master data supplier/perorangan
- `pembeli` - Master data pembeli/pabrik

### Transaction Tables
- `transaksi` - Header transaksi (beli & jual)
- `transaksi_item` - Detail item per transaksi

### Stock Tables
- `stok` - Real-time stok per barang (dengan grade)
- `stok_mutasi` - History pergerakan stok (audit trail)

See `src/database/schema.sql` for complete schema.

## Design System

### Colors
- **Primary:** #4CAF50 (Green) - Transaksi Beli
- **Secondary:** #2196F3 (Blue) - Transaksi Jual
- **Success:** #4CAF50
- **Warning:** #FF9800
- **Error:** #F44336

### Typography
- Font: Roboto (Material Design)
- Scale: Display, Headline, Title, Body, Label

### Spacing
- xs: 4dp
- sm: 8dp
- md: 16dp
- lg: 24dp
- xl: 32dp
- xxl: 48dp

See `src/theme/` for complete theme configuration.

## Testing

### Manual Testing Checklist

#### Database
- [x] Database initializes on first launch
- [x] Sample data is seeded
- [ ] Tables are created correctly

#### Navigation
- [x] Bottom tabs work
- [x] Can navigate to Buy Transaction
- [x] Can navigate to Sell Transaction
- [x] Back button works

#### Screens
- [x] Home screen displays dashboard
- [x] Stock screen displays layout
- [x] History screen displays layout
- [x] Menu screen displays options
- [x] Transaction forms display correctly

## Known Issues

1. **Database Schema File Reading:** Currently using inline schema in `init.ts` as fallback
2. **No Data Persistence:** Sample data only, no actual transaction saving yet
3. **Missing Features:** Excel export, WhatsApp share, reports (Phase 2)

## Roadmap

### Phase 1 - MVP (Current)
- [x] Project setup
- [x] Database schema
- [x] Theme & navigation
- [x] Skeleton screens
- [ ] Complete transaction flow
- [ ] Stock management
- [ ] Master data CRUD

### Phase 2 - Enhancement
- [ ] Reports & export
- [ ] WhatsApp integration
- [ ] Filter & search
- [ ] Edit/void transactions
- [ ] Backup/restore

### Phase 3 - Advanced
- [ ] Foto barang
- [ ] Grading system
- [ ] Charts & analytics
- [ ] Multi-user support

## Contributing

1. Keep code clean and well-documented
2. Follow TypeScript strict mode
3. Use Material Design principles
4. Test on both Android and iOS
5. Commit dengan conventional commits (feat, fix, chore, docs)

## License

Private - Internal Use Only

## Contact

For questions or support, contact the development team.

---

**Version:** 1.0.0  
**Last Updated:** October 2026
