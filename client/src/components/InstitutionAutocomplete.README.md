# Institution Autocomplete Component

A comprehensive autocomplete dropdown component for Indian colleges and universities with real-time search, keyboard navigation, and excellent UX.

## Features

- ✅ **Real-time Search**: Fuzzy matching with debounced search (200ms)
- ✅ **Keyboard Navigation**: Full arrow key, Enter, Escape support
- ✅ **Mouse Interaction**: Click to select suggestions
- ✅ **Free-text Entry**: Allows custom institution names not in database
- ✅ **Popular Suggestions**: Shows popular colleges when field is empty
- ✅ **Highlighted Matches**: Visual highlighting of search terms
- ✅ **Performance Optimized**: Handles thousands of entries efficiently
- ✅ **Accessibility**: ARIA attributes and screen reader support
- ✅ **Dark Mode**: Full dark mode compatibility
- ✅ **Responsive Design**: Works on all screen sizes
- ✅ **Loading States**: Visual feedback during search
- ✅ **Clear Functionality**: Easy way to clear selection

## Usage

### Basic Implementation

```jsx
import InstitutionAutocomplete from '../components/InstitutionAutocomplete';

function MyForm() {
  const { register, watch, setValue, formState: { errors } } = useForm();

  return (
    <div className="form-group">
      <label className="form-label">Institution *</label>
      <InstitutionAutocomplete
        value={watch('institution') || ''}
        onChange={(value) => setValue('institution', value)}
        placeholder="Enter your institution name"
        error={errors.institution?.message}
        required={true}
      />
    </div>
  );
}
```

### With React Hook Form Integration

```jsx
// Register the field with validation
useEffect(() => {
  register('institution', { required: 'Institution is required' });
}, [register]);

// Use in JSX
<InstitutionAutocomplete
  value={watch('institution') || ''}
  onChange={(value) => setValue('institution', value)}
  placeholder="Type to search colleges (e.g., BITS Hyderabad)"
  error={errors.institution?.message}
  required={true}
/>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `value` | string | `''` | Current input value |
| `onChange` | function | - | Callback when value changes |
| `onBlur` | function | - | Callback when input loses focus |
| `placeholder` | string | `"Enter your institution name"` | Input placeholder text |
| `error` | string | `null` | Error message to display |
| `required` | boolean | `false` | Whether field is required |
| `className` | string | `""` | Additional CSS classes |
| `disabled` | boolean | `false` | Whether input is disabled |

## Database

The component uses a comprehensive database of Indian institutions including:

- **IITs**: All 23 Indian Institutes of Technology
- **NITs**: All 31 National Institutes of Technology  
- **IIITs**: All Indian Institutes of Information Technology
- **IIMs**: All 20 Indian Institutes of Management
- **Central Universities**: Major central universities across India
- **State Universities**: Popular state universities
- **Engineering Colleges**: Top engineering colleges by state
- **Medical Colleges**: Major medical institutions

### Sample Data Structure

```javascript
export const indianColleges = [
  "Indian Institute of Technology (IIT) Bombay",
  "Birla Institute of Technology and Science (BITS) Pilani, Hyderabad Campus",
  "Anna University, Chennai",
  // ... 500+ more institutions
];
```

## Performance Optimizations

1. **Debounced Search**: 200ms delay prevents excessive API calls
2. **Limited Results**: Shows max 8 suggestions to maintain performance
3. **Virtual Scrolling**: Efficient rendering for large lists
4. **Memoized Components**: Prevents unnecessary re-renders
5. **Optimized Sorting**: Smart relevance-based sorting algorithm

## Keyboard Shortcuts

| Key | Action |
|-----|--------|
| `↓` | Navigate down in suggestions |
| `↑` | Navigate up in suggestions |
| `Enter` | Select highlighted suggestion |
| `Escape` | Close dropdown and blur input |
| `Tab` | Close dropdown and move to next field |

## Accessibility Features

- ARIA attributes for screen readers
- Proper focus management
- Keyboard navigation support
- High contrast colors
- Clear visual feedback

## Styling

The component uses Tailwind CSS classes and follows the existing design system:

- Consistent with other form inputs
- Dark mode support
- Purple accent colors
- Smooth transitions and animations
- Responsive design

## Best Practices

### 1. Form Integration
```jsx
// Always register the field for validation
useEffect(() => {
  register('institution', { 
    required: 'Institution is required',
    minLength: { value: 2, message: 'Institution name too short' }
  });
}, [register]);
```

### 2. Error Handling
```jsx
// Display validation errors
<InstitutionAutocomplete
  error={errors.institution?.message}
  // ... other props
/>
```

### 3. Loading States
```jsx
// The component handles loading states internally
// No additional setup required
```

### 4. Custom Validation
```jsx
// Add custom validation logic
const validateInstitution = (value) => {
  if (!value) return 'Institution is required';
  if (value.length < 2) return 'Institution name too short';
  return true;
};

register('institution', { validate: validateInstitution });
```

## Extending the Database

### Adding New Colleges

```javascript
// In indianColleges.js
export const indianColleges = [
  // ... existing colleges
  "Your New College Name, City",
  "Another College Name, State"
];
```

### API Integration

For production use, consider fetching from an API:

```javascript
// Replace static data with API call
const searchColleges = async (query, limit = 10) => {
  try {
    const response = await fetch(`/api/colleges/search?q=${query}&limit=${limit}`);
    const data = await response.json();
    return data.colleges;
  } catch (error) {
    console.error('Failed to fetch colleges:', error);
    return [];
  }
};
```

## Data Sources

For a comprehensive database, consider these sources:

1. **UGC List**: University Grants Commission official list
2. **AICTE Database**: All India Council for Technical Education
3. **NAAC Database**: National Assessment and Accreditation Council
4. **State Government Lists**: Individual state education department lists
5. **Open Data Portals**: Government open data initiatives

### Recommended APIs

- **UGC API**: `https://www.ugc.ac.in/` (if available)
- **Education Ministry Data**: Government education portals
- **Third-party Services**: Educational data providers

## Testing

### Unit Tests
```javascript
// Test search functionality
test('should filter colleges based on search term', () => {
  const results = searchColleges('BITS');
  expect(results).toContain('Birla Institute of Technology and Science (BITS) Pilani, Hyderabad Campus');
});

// Test keyboard navigation
test('should navigate with arrow keys', () => {
  // Test implementation
});
```

### Integration Tests
```javascript
// Test with form validation
test('should integrate with react-hook-form', () => {
  // Test implementation
});
```

## Browser Support

- Chrome 80+
- Firefox 75+
- Safari 13+
- Edge 80+

## Dependencies

- React 16.8+ (hooks support)
- Lucide React (icons)
- Tailwind CSS (styling)

## License

MIT License - feel free to use in your projects!
