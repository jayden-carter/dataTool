import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-storage.js";
import { getFirestore, collection, query, orderBy, onSnapshot } from "https://www.gstatic.com/firebasejs/11.6.0/firebase-firestore.js";

// Initialize Firebase Storage and Firestore
const storage = getStorage();
const db = getFirestore();

// File upload handler
document.getElementById('fileUpload').addEventListener('change', async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Create a storage reference
    const storageRef = ref(storage, `uploads/${file.name}`);

    try {
        // Upload the file
        const snapshot = await uploadBytes(storageRef, file);
        console.log('File uploaded successfully');
        
        // Get the download URL
        const downloadURL = await getDownloadURL(snapshot.ref);
        console.log('File available at', downloadURL);
        
        // Show success message
        document.getElementById('uploadStatus').textContent = 'File uploaded successfully! Processing...';
    } catch (error) {
        console.error('Error uploading file:', error);
        document.getElementById('uploadStatus').textContent = 'Error uploading file: ' + error.message;
    }
});

// Listen for processed data
const processedDataRef = collection(db, 'processedData');
const q = query(processedDataRef, orderBy('processedAt', 'desc'));

onSnapshot(q, (snapshot) => {
    const processedFilesList = document.getElementById('processedFiles');
    processedFilesList.innerHTML = ''; // Clear existing list

    snapshot.forEach((doc) => {
        const data = doc.data();
        const listItem = document.createElement('li');
        listItem.innerHTML = `
            <div class="file-info">
                <h3>${data.fileName}</h3>
                <p>Processed: ${new Date(data.processedAt.toDate()).toLocaleString()}</p>
                <p>Records: ${data.totalRecords}</p>
                <p>Status: ${data.status}</p>
            </div>
        `;
        processedFilesList.appendChild(listItem);
    });
}); 