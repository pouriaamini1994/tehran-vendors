const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Serve static files (your HTML)
app.use(express.static(__dirname));

const DATA_FILE = path.join(__dirname, 'data.json');

// Read vendors from data.json
async function readVendors() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        // If file doesn't exist, return empty array
        return [];
    }
}

// Save vendors to data.json
async function saveVendors(vendors) {
    await fs.writeFile(DATA_FILE, JSON.stringify(vendors, null, 2));
}

// API: Get all vendors
app.get('/api/vendors', async (req, res) => {
    try {
        const vendors = await readVendors();
        res.json(vendors);
    } catch (error) {
        res.status(500).json({ error: 'Failed to read vendors' });
    }
});

// API: Add new vendor
app.post('/api/vendors', async (req, res) => {
    try {
        const vendors = await readVendors();
        const newVendor = {
            id: Date.now(), // Simple unique ID
            ...req.body,
            added: new Date().toLocaleString('fa-IR') // Persian date
        };
        
        vendors.push(newVendor);
        await saveVendors(vendors);
        res.json(newVendor);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save vendor' });
    }
});

// API: Update vendor
app.put('/api/vendors/:id', async (req, res) => {
    try {
        const vendors = await readVendors();
        const index = vendors.findIndex(v => v.id == req.params.id);
        
        if (index === -1) {
            return res.status(404).json({ error: 'Vendor not found' });
        }
        
        vendors[index] = {
            ...vendors[index],
            ...req.body,
            updated: new Date().toLocaleString('fa-IR')
        };
        
        await saveVendors(vendors);
        res.json(vendors[index]);
    } catch (error) {
        res.status(500).json({ error: 'Failed to update vendor' });
    }
});

// API: Delete vendor
app.delete('/api/vendors/:id', async (req, res) => {
    try {
        const vendors = await readVendors();
        const initialLength = vendors.length;
        const filteredVendors = vendors.filter(v => v.id != req.params.id);
        
        if (filteredVendors.length === initialLength) {
            return res.status(404).json({ error: 'Vendor not found' });
        }
        
        await saveVendors(filteredVendors);
        res.json({ success: true, message: 'Vendor deleted' });
    } catch (error) {
        res.status(500).json({ error: 'Failed to delete vendor' });
    }
});

// Serve HTML for all other routes
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`API available at http://localhost:${PORT}/api`);
    console.log(`Website at http://localhost:${PORT}`);
});
