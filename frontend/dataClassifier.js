export function classifyDataFields(data) {
    if (!data || data.length === 0) {
      return {};
    }
  
    const sampleSize = Math.min(5, data.length); // Sample up to 5 records
    const fieldTypes = {};
  
    // Get the first record to initialize fields
    const firstRecord = data[0];
    const fields = Object.keys(firstRecord);
  
    // For each field, check the type in the sampled records
    for (const field of fields) {
      let isNumeric = true;
      for (let i = 0; i < sampleSize; i++) {
        const value = data[i][field];
        // Consider a field numeric only if all sampled values are numbers
        // and not NaN
        if (typeof value !== 'number' || isNaN(value)) {
          isNumeric = false;
          break;
        }
      }
      fieldTypes[field] = isNumeric ? 'numeric' : 'string';
    }
  
    return fieldTypes;
  }