# Translation Guide - Telugu Language Support

This project now supports multiple languages (English and Telugu) using `react-i18next`.

## How to Use Translations in Components

### 1. Import the `useTranslation` hook

```javascript
import { useTranslation } from 'react-i18next';
```

### 2. Use the `t` function in your component

```javascript
const MyComponent = () => {
  const { t } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.home')}</h1>
      <p>{t('admin.dashboard')}</p>
    </div>
  );
};
```

### 3. Translation Keys Structure

Translations are organized in namespaces:
- `common.*` - Common words used across the app
- `navbar.*` - Navigation bar translations
- `admin.*` - Admin panel translations
- `auth.*` - Authentication related translations
- `product.*` - Product related translations
- `cart.*` - Shopping cart translations
- `orders.*` - Order related translations

### 4. Adding New Translations

1. **Add to English file** (`src/i18n/locales/en.json`):
```json
{
  "mySection": {
    "myKey": "My English Text"
  }
}
```

2. **Add to Telugu file** (`src/i18n/locales/te.json`):
```json
{
  "mySection": {
    "myKey": "నా తెలుగు టెక్స్ట్"
  }
}
```

3. **Use in component**:
```javascript
{t('mySection.myKey')}
```

## Language Switcher

The language switcher is already added to the Navbar. Users can:
- Click the globe icon to see available languages
- Select English or Telugu
- The preference is saved in localStorage

## Current Translation Coverage

✅ Navbar
✅ Admin Dashboard (partially)
✅ Admin Bottom Navigation
✅ Common UI elements

## To Complete Translation Coverage

You need to add `useTranslation` and replace hardcoded strings in:
- All page components
- All form components
- All modal components
- Error messages
- Success messages
- Button labels
- Placeholder texts

## Example: Converting a Component

**Before:**
```javascript
const MyComponent = () => {
  return <button>Add to Cart</button>;
};
```

**After:**
```javascript
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation();
  return <button>{t('product.addToCart')}</button>;
};
```

## Notes

- The language preference is automatically saved and restored
- Default language is English
- If a translation key is missing, it will show the key name
- Always add translations to both `en.json` and `te.json`

