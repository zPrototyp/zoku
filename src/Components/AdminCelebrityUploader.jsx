import React, { useState } from 'react';
import { API_addCelebrities } from '../Services/API';
import "../assets/css/Admin.css";
const ALLOWED_IMAGES = ['celebF.jpg', 'celebM.jpg'];

const CelebrityUploader = ({bearer}) => {
  const [fileName, setFileName] = useState('');
  const [statusMessage, setStatusMessage] = useState('');
  const [error, setError] = useState(null);

  const validateCelebrity = (celeb, index) => {
    const errors = [];

    if (!celeb.name || typeof celeb.name !== 'string') {
      errors.push(`Item ${index + 1}: Missing or invalid "name"`);
    }

    if (!celeb.category || typeof celeb.category !== 'string') {
      errors.push(`Item ${index + 1}: Missing or invalid "category"`);
    }

    if (
      typeof celeb.changeVsTradition !== 'number' ||
      celeb.changeVsTradition < 0 ||
      celeb.changeVsTradition > 100
    ) {
      errors.push(`Item ${index + 1}: "changeVsTradition" must be a number between 0 and 100`);
    }

    if (
      typeof celeb.compassionVsAmbition !== 'number' ||
      celeb.compassionVsAmbition < 0 ||
      celeb.compassionVsAmbition > 100
    ) {
      errors.push(`Item ${index + 1}: "compassionVsAmbition" must be a number between 0 and 100`);
    }

    if (!celeb.description || typeof celeb.description !== 'string') {
      errors.push(`Item ${index + 1}: Missing or invalid "description"`);
    }

    if (!celeb.imgUrl || !ALLOWED_IMAGES.includes(celeb.imgUrl)) {
      errors.push(
        `Item ${index + 1}: "imgUrl" must be one of: ${ALLOWED_IMAGES.join(', ')}`
      );
    }

    return errors;
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    setFileName(file?.name || '');
    setStatusMessage('');
    setError(null);

    if (!file) return;

    if (file.type !== 'application/json') {
      setError('Please upload a valid JSON file.');
      return;
    }

    try {
      const text = await file.text();
      let parsed = JSON.parse(text);

      // Normalize to array
      const celebrityArray = Array.isArray(parsed) ? parsed : [parsed];

      const validationErrors = celebrityArray.flatMap((celeb, index) =>
        validateCelebrity(celeb, index)
      );

      if (validationErrors.length > 0) {
        throw new Error(validationErrors.join('\n'));
      }

      // Send to API      
      const response = await API_addCelebrities(bearer, celebrityArray)

      setStatusMessage('Celebrities uploaded successfully!');
    } catch (err) {
      setError(`Upload failed:\n${err.message}`);
    }
  };

  return (
    <div style={styles.container}>
      <h3>Upload Celebrities JSON</h3>
      <p>Must be of format:</p>
<pre style={{ whiteSpace: 'pre-wrap', background: '#f5f5f5', padding: '1rem', borderRadius: '4px', textAlign:'left' }}>
  {`[
  {
    "name": "Greta Thunberg",
    "type": "Förkämpen"
    "category": "Activist",
    "changeVsTradition": 30,
    "compassionVsAmbition": 15,
    "description": "Global ung aktivist...",
    "imgUrl": "celebF.jpg"
  },
  {
    "name": "Zlatan Ibrahimović",
    "type": "Segraren"
    "category": "Athlete",
    "changeVsTradition": 45,
    "compassionVsAmbition": 20,
    "description": "En av Sveriges mest ikoniska idrottare.",
    "imgUrl": "celebM.jpg"
  }
]`}
</pre>
      <input
        type="file"
        accept=".json"
        onChange={handleFileUpload}
        style={styles.input}
      />
      {fileName && <p><strong>Selected File:</strong> {fileName}</p>}
      {statusMessage && <p style={styles.success}>{statusMessage}</p>}
      {error && (
        <pre style={styles.error}>
          {error}
        </pre>
      )}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: '500px',
    margin: '2rem auto',
    padding: '1rem',
    border: '1px solid #ddd',
    borderRadius: '8px',
  },
  input: {
    margin: '1rem 0',
  },
  success: {
    color: 'green',
    fontWeight: 'bold',
  },
  error: {
    color: 'red',
    whiteSpace: 'pre-wrap',
  },
};

export default CelebrityUploader;
