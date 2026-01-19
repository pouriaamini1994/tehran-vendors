const express = require('express');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const DATA_FILE = path.join(__dirname, 'data.json');

// Read vendors from JSON file
async function readVendors() {
    try {
        const data = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

// Write vendors to JSON file
async function writeVendors(vendors) {
    await fs.writeFile(DATA_FILE, JSON.stringify(vendors, null, 2));
}

// GET all vendors
app.get('/api/vendors', async (req, res) => {
    const vendors = await readVendors();
    res.json(vendors);
});

// ADD new vendor
app.post('/api/vendors', async (req, res) => {
    const vendors = await readVendors();
    const newVendor = {
        id: Date.now(),
        ...req.body,
        added: new Date().toLocaleString()
    };
    vendors.push(newVendor);
    await writeVendors(vendors);
    res.json(newVendor);
});

// UPDATE vendor
app.put('/api/vendors/:id', async (req, res) => {
    const vendors = await readVendors();
    const index = vendors.findIndex(v => v.id == req.params.id);
    
    if (index !== -1) {
        vendors[index] = { ...vendors[index], ...req.body, updated: new Date().toLocaleString() };
        await writeVendors(vendors);
        res.json(vendors[index]);
    } else {
        res.status(404).json({ error: 'Vendor not found' });
    }
});

// DELETE vendor
app.delete('/api/vendors/:id', async (req, res) => {
    const vendors = await readVendors();
    const filteredVendors = vendors.filter(v => v.id != req.params.id);
    
    if (filteredVendors.length < vendors.length) {
        await writeVendors(filteredVendors);
        res.json({ message: 'Deleted' });
    } else {
        res.status(404).json({ error: 'Vendor not found' });
    }
});

// Serve your frontend HTML
app.use(express.static(__dirname));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
