const functions = require('firebase-functions');
const admin = require('firebase-admin');
const { Storage } = require('@google-cloud/storage');
const csv = require('csv-parser');
const { Readable } = require('stream');

admin.initializeApp();
const storage = new Storage();
const db = admin.firestore();

exports.processUploadedFile = functions.storage.object().onFinalize(async (object) => {
    const fileBucket = object.bucket;
    const filePath = object.name;
    const contentType = object.contentType;

    // Only process CSV files
    if (!contentType.includes('text/csv')) {
        console.log('This is not a CSV file.');
        return null;
    }

    // Get the file
    const bucket = storage.bucket(fileBucket);
    const file = bucket.file(filePath);

    // Create a readable stream from the file
    const stream = file.createReadStream();
    const results = [];

    // Process the CSV file
    return new Promise((resolve, reject) => {
        stream
            .pipe(csv())
            .on('data', (data) => results.push(data))
            .on('end', async () => {
                try {
                    // Generate a unique ID for this processing job
                    const processingId = Date.now().toString();

                    // Calculate metrics
                    const metrics = calculateMetrics(results);

                    // Store the processed data and metrics in Firestore
                    await db.collection('processedData').doc(processingId).set({
                        fileName: filePath,
                        processedAt: admin.firestore.FieldValue.serverTimestamp(),
                        data: results,
                        metrics: metrics,
                        status: 'completed',
                        totalRecords: results.length
                    });

                    console.log(`Processed ${results.length} records from ${filePath}`);
                    resolve();
                } catch (error) {
                    console.error('Error processing file:', error);
                    reject(error);
                }
            })
            .on('error', (error) => {
                console.error('Error reading file:', error);
                reject(error);
            });
    });
});

function calculateMetrics(data) {
    // Initialize metrics object
    const metrics = {
        monthlyRevenue: {},
        itemSales: {},
        monthlyItemSales: {},
        bestSellers: [],
        worstSellers: [],
        trendingItems: []
    };

    // Process each record
    data.forEach(record => {
        const date = new Date(record.date);
        const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
        const itemName = record.item_name;
        const revenue = parseFloat(record.revenue) || 0;
        const quantity = parseInt(record.quantity) || 0;

        // Calculate monthly revenue
        metrics.monthlyRevenue[monthKey] = (metrics.monthlyRevenue[monthKey] || 0) + revenue;

        // Calculate item sales
        if (!metrics.itemSales[itemName]) {
            metrics.itemSales[itemName] = {
                totalQuantity: 0,
                totalRevenue: 0,
                monthlyQuantities: {}
            };
        }
        metrics.itemSales[itemName].totalQuantity += quantity;
        metrics.itemSales[itemName].totalRevenue += revenue;
        metrics.itemSales[itemName].monthlyQuantities[monthKey] = 
            (metrics.itemSales[itemName].monthlyQuantities[monthKey] || 0) + quantity;
    });

    // Calculate best and worst sellers
    const itemsArray = Object.entries(metrics.itemSales).map(([name, data]) => ({
        name,
        ...data
    }));

    // Sort by total quantity sold
    itemsArray.sort((a, b) => b.totalQuantity - a.totalQuantity);
    
    // Get best and worst sellers
    metrics.bestSellers = itemsArray.slice(0, 5);
    metrics.worstSellers = itemsArray.slice(-5).reverse();

    // Calculate trending items (biggest month-over-month changes)
    itemsArray.forEach(item => {
        const monthlyChanges = [];
        const months = Object.keys(item.monthlyQuantities).sort();
        
        for (let i = 1; i < months.length; i++) {
            const prevMonth = months[i - 1];
            const currentMonth = months[i];
            const change = item.monthlyQuantities[currentMonth] - item.monthlyQuantities[prevMonth];
            const changePercent = (change / item.monthlyQuantities[prevMonth]) * 100;
            
            monthlyChanges.push({
                month: currentMonth,
                change,
                changePercent
            });
        }

        // Sort by absolute change percentage
        monthlyChanges.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));
        
        if (monthlyChanges.length > 0) {
            metrics.trendingItems.push({
                name: item.name,
                ...monthlyChanges[0]
            });
        }
    });

    // Sort trending items by absolute change percentage
    metrics.trendingItems.sort((a, b) => Math.abs(b.changePercent) - Math.abs(a.changePercent));

    return metrics;
} 