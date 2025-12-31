# OD Claim - Dates and Proof Upload Feature

## ✅ Completed Features

### 1. Multiple Dates Selection

Students can now add multiple dates for their OD claim:

- **Add Date Button**: Click to add dates one by one
- **Date Display**: Shows all selected dates as removable chips
- **Remove Date**: Click X on any date chip to remove it
- **Validation**: At least one date is required to submit
- **Sorted Display**: Dates are automatically sorted chronologically

### 2. Proof Document Upload

Students can upload proof documents to support their OD claim:

- **File Upload**: Upload to Supabase Storage under `od-claims/` folder
- **Supported Formats**: PDF, JPG, JPEG, PNG, DOC, DOCX
- **File Size Limit**: Maximum 5MB
- **Optional Field**: Not required but recommended
- **Upload Feedback**: Shows file name after successful upload
- **Public URL**: Stored as accessible link in database

### 3. Enhanced Display

Both students and teachers can view:

- **OD Dates**: All dates displayed as blue chips
- **Proof Link**: Clickable link to view/download proof document
- **Event Association**: Shows if linked to a registered event

## Implementation Details

### Frontend Changes (ODClaim.jsx)

#### New State Variables

```javascript
const [formData, setFormData] = useState({
  event_name: "",
  teacher_id: "",
  description: "",
  event_id: "",
  dates: [], // NEW - Array of date strings
  proof_url: "", // NEW - Supabase URL
});

const [newDate, setNewDate] = useState("");
const [proofFile, setProofFile] = useState(null);
const [uploadingProof, setUploadingProof] = useState(false);
```

#### Date Management Functions

```javascript
// Add date to array
const handleAddDate = () => {
  if (newDate && !formData.dates.includes(newDate)) {
    setFormData((prev) => ({
      ...prev,
      dates: [...prev.dates, newDate].sort(),
    }));
    setNewDate("");
  }
};

// Remove date from array
const handleRemoveDate = (dateToRemove) => {
  setFormData((prev) => ({
    ...prev,
    dates: prev.dates.filter((date) => date !== dateToRemove),
  }));
};
```

#### File Upload Function

```javascript
const handleProofUpload = async (e) => {
  const file = e.target.files[0];

  // Validate file size (5MB max)
  if (file.size > 5 * 1024 * 1024) {
    setError("File size must be less than 5MB");
    return;
  }

  // Upload to Supabase Storage
  const filePath = `od-claims/${fileName}`;
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from("jithu")
    .upload(filePath, file);

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("jithu").getPublicUrl(filePath);

  setFormData((prev) => ({
    ...prev,
    proof_url: publicUrl,
  }));
};
```

### Backend Changes (backend.cjs)

#### Updated Schema

```javascript
const ODClaimSchema = new mongoose.Schema({
  student_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  event_id: { type: mongoose.Schema.Types.ObjectId },
  event_name: { type: String, required: true },
  teacher_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  description: { type: String, required: true },
  dates: { type: Array, default: [] }, // NEW - Array of date strings
  proof_url: { type: String }, // NEW - Supabase Storage URL
  status: {
    type: String,
    default: "pending",
    enum: ["pending", "accepted", "rejected"],
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});
```

#### Updated Create Endpoint

```javascript
app.post("/api/od-claims", authenticateToken, async (req, res) => {
  const { event_id, event_name, teacher_id, description, dates, proof_url } =
    req.body;

  // Validate dates
  if (!dates || !Array.isArray(dates) || dates.length === 0) {
    return res.status(400).json({ error: "At least one date is required" });
  }

  const odClaim = new ODClaim({
    student_id: req.userId,
    event_id: event_id || null,
    event_name,
    teacher_id,
    description,
    dates: dates, // NEW
    proof_url: proof_url || null, // NEW
    status: "pending",
  });

  await odClaim.save();
});
```

## User Experience

### Student Workflow

1. Fill in event name
2. Select related event (optional)
3. **Add multiple dates**:
   - Pick date from calendar
   - Click "Add Date"
   - Repeat for all OD dates
   - Remove any date by clicking X
4. Select responsible teacher
5. Write description
6. **Upload proof** (optional):
   - Click "Upload Proof"
   - Select file (PDF, image, or document)
   - Wait for upload confirmation
7. Submit OD claim

### Teacher Workflow

1. View OD claims (filtered by status)
2. See student details and event name
3. **View OD dates** - All dates displayed as chips
4. **Click proof link** - Opens document in new tab
5. Read description
6. Accept or reject claim

## Form Field Order

1. Event Name (text) \*required
2. Related Event (dropdown) \*optional
3. Responsible Teacher (dropdown) \*required
4. Description (textarea) \*required
5. **OD Dates (date picker + add button)** \*required - NEW
6. **Proof Document (file upload)** \*optional - NEW

## Display Features

### Student View (My OD Claims)

- Event name and status badge
- Description
- **OD Dates** - Blue chips showing all dates
- **Proof Link** - Purple link to view document
- Teacher name
- Submission date

### Teacher View (OD Claims to Review)

- Student name and roll number
- Event name and status badge
- Description
- **OD Dates** - Blue chips showing all dates
- **Proof Link** - Purple link to view document
- Submission date
- Accept/Reject buttons (for pending claims)

## File Storage Structure

### Supabase Storage

```
jithu/
  └── od-claims/
      ├── 1234567890-abc123.pdf
      ├── 1234567891-def456.jpg
      └── 1234567892-ghi789.docx
```

### File Naming Convention

```
{timestamp}-{random}.{extension}
Example: 1704123456789-x7k9m2.pdf
```

## Validation Rules

### Dates

- ✅ At least one date required
- ✅ No duplicate dates allowed
- ✅ Dates automatically sorted
- ✅ Can add/remove dates before submission

### Proof File

- ✅ Optional field
- ✅ Max size: 5MB
- ✅ Allowed formats: PDF, JPG, JPEG, PNG, DOC, DOCX
- ✅ Uploaded to Supabase Storage
- ✅ Public URL stored in database

## Testing Checklist

- [x] Add single date to OD claim
- [x] Add multiple dates to OD claim
- [x] Remove date from list
- [x] Try to submit without dates (should fail)
- [x] Upload PDF proof document
- [x] Upload image proof document
- [x] Try to upload file > 5MB (should fail)
- [x] Submit OD claim with dates and proof
- [x] Submit OD claim with dates but no proof
- [x] View OD claim as student - see dates and proof link
- [x] View OD claim as teacher - see dates and proof link
- [x] Click proof link - opens in new tab
- [x] Accept/reject OD claim with dates

## Files Modified

1. `src/pages/shared/ODClaim.jsx`

   - Added dates array state
   - Added proof file upload state
   - Added date management functions
   - Added file upload to Supabase
   - Updated form UI with date picker and file upload
   - Updated display to show dates and proof link

2. `backend.cjs`
   - Updated ODClaimSchema with `dates` and `proof_url` fields
   - Updated create endpoint to accept and validate dates
   - Updated create endpoint to accept proof_url

## Benefits

1. **Better Tracking**: Multiple dates clearly show all OD days
2. **Proof Support**: Documents provide evidence for claims
3. **Teacher Verification**: Easy access to proof documents
4. **Transparency**: All dates visible at a glance
5. **Flexibility**: Can add as many dates as needed
6. **Professional**: Proper documentation for institutional records
