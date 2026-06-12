# 🍕 Pizza Delivery App

A mobile pizza ordering app built with **Flutter** and **Firebase**, using the **BLoC** pattern for state management. Includes Firebase Authentication, Firestore data fetching, and a clean Material 3 UI.

---

## Screenshots

| Welcome | Home | Details |
|---------|------|---------|
| Sign in / Sign up with animated background | Pizza grid with veg/spicy tags and live prices | Full pizza detail with macros and add-to-cart |

---

## Features

- **Authentication** — Email/password sign-up and sign-in via Firebase Auth
- **Password strength indicator** — Real-time feedback on sign-up (uppercase, lowercase, number, special char, length)
- **Pizza catalogue** — Fetched from Firestore, displayed in a responsive grid
- **Veg / Non-veg tags** — Green/red labels per pizza
- **Spice level indicator** — Mild / Medium / Hot
- **Discount pricing** — Original price crossed out, discounted price highlighted
- **Nutritional macros** — Calories, protein, fat and carbs per pizza
- **Detail screen** — Full image, description, macros and add-to-cart button
- **Light/dark-friendly** — Material 3 colour scheme based on seed colour
- **Error handling** — Retry button on network failures, error messages on auth failures

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| UI | Flutter (Dart) |
| State management | BLoC / flutter_bloc |
| Authentication | Firebase Auth |
| Database | Cloud Firestore |
| Architecture | Feature-first + package-based repositories |

---

## Project Structure

```
lib/
├── blocs/
│   └── authentication_bloc/   # App-level auth state
├── components/
│   ├── macro.dart             # Nutritional macro widget
│   └── my_text_field.dart     # Reusable form field
├── screens/
│   ├── auth/
│   │   ├── blocs/             # sign_in_bloc, sign_up_bloc
│   │   └── views/             # WelcomeScreen, SignInScreen, SignUpScreen
│   └── home/
│       ├── blocs/             # get_pizza_bloc
│       └── views/             # HomeScreen, DetailsScreen
├── app.dart                   # BlocProvider root
├── app_view.dart              # MaterialApp + theme
└── main.dart                  # Firebase init + entry point

packages/
├── user_repository/           # Firebase Auth + Firestore user CRUD
└── pizza_repository/          # Firestore pizza data
```

---

## Getting Started

### Prerequisites

- [Flutter SDK](https://docs.flutter.dev/get-started/install) >= 3.8
- A Firebase project with **Authentication** (Email/Password) and **Firestore** enabled

### Firebase Setup

1. Create a project at [console.firebase.google.com](https://console.firebase.google.com)
2. Enable **Email/Password** under Authentication → Sign-in methods
3. Create a `pizzas` collection in Firestore with documents matching this schema:

```json
{
  "pizzaId": "string",
  "name": "string",
  "description": "string",
  "picture": "url",
  "price": 12,
  "discount": 10,
  "isVeg": false,
  "spicy": 2,
  "macros": {
    "calories": 280,
    "proteins": 14,
    "fat": 11,
    "carbs": 32
  }
}
```

4. Add the `google-services.json` (Android) and/or `GoogleService-Info.plist` (iOS) to the respective platform folders

### Run

```bash
flutter pub get
flutter run
```

---

## Architecture

The app follows a **feature-first** structure with BLoC for state management and a **clean separation** between UI, business logic and data:

- **Repositories** (`packages/`) handle all Firebase calls and expose domain models
- **BLoCs** map events to states — no business logic in widgets
- **Views** are purely reactive — they observe BLoC states and dispatch events

---

## What Was Improved (Code Review)

| Issue | Fix |
|-------|-----|
| `MyUser.empty` was a mutable `static final` being mutated at sign-up | Made `MyUser` fully immutable (`const` constructor, `final` fields); sign-up now creates a new instance |
| `RepositoryProvider<AuthenticationBloc>` — semantically wrong | Changed to `BlocProvider<AuthenticationBloc>` |
| Password validator on sign-in checked strength (unnecessary) | Sign-in only validates non-empty; strength check stays on sign-up only |
| `SignUpFailure` showed no error to the user | Added `_errorMsg` state displayed below the form |
| `TextEditingController` never disposed | Added `dispose()` to all stateful auth screens |
| Multiple individual `setState` calls per password keystroke | Consolidated into a single `setState` call |
| Price displayed as raw double (e.g. `$10.0`) | Used `toStringAsFixed(2)` via a computed `finalPrice` getter |
| `Colors.grey.shade200` background + deprecated `background`/`onBackground` theme props | Replaced with `ColorScheme.fromSeed` (Material 3), non-deprecated `surface`/`onSurface` |
| No error state retry in home screen | Added retry button with icon in error state |
| "Buy Now" button had empty `onPressed` | Button now shows a SnackBar confirmation |
| Cart icon had empty `onPressed` | Cart icon shows a SnackBar placeholder |
| `SimpleBlocObserver` logged all blocs as "authentication_bloc" | Labels now use `bloc.runtimeType` |
| `Pizza`/`Macros` models were mutable | Made all fields `final`; added `copyWith`, `==`, `hashCode` |
| Pizza images had no error fallback | Added `errorBuilder` with icon placeholder |
| README was default Flutter boilerplate | Replaced with full project documentation |
