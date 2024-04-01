const express = require('express');
const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const app = express();
app.use(express.json());

// Pair device with Clerk user endpoint
app.post('/api/pair-device', async (req, res) => {
    const { deviceId, clerkUserId } = req.body;

    if (!deviceId || !clerkUserId) {
        return res.status(400).send({ message: 'Device ID and Clerk User ID are required' });
    }

    const { data, error } = await supabase
        .from('device_user_mapping')
        .insert([{ device_id: deviceId, clerk_user_id: clerkUserId }]);

    if (error) {
        console.error('Error pairing device:', error);
        return res.status(500).send({ message: 'Error pairing device' });
    }

    res.status(201).send(data);
});

// Fall detection endpoint
app.post('/api/fall-detection', async (req, res) => {
    const { deviceId } = req.body;

    if (!deviceId) {
        return res.status(400).send({ message: 'Device ID is required' });
    }

    const { data, error } = await supabase
        .from('device_user_mapping')
        .select('clerk_user_id')
        .eq('device_id', deviceId)
        .single();

    if (error || !data) {
        console.error('Error finding user mapping:', error);
        return res.status(500).send({ message: 'Error finding user mapping' });
    }

    const clerkUserId = data.clerk_user_id;

    // Here you would integrate with your notification service to send a notification to the user
    console.log(`Send notification to Clerk user ${clerkUserId} for device ${deviceId}`);

    res.status(200).send({ message: `Notification sent to Clerk user ${clerkUserId}` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
