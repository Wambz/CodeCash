// Quick test script for deposit API
const response = await fetch('http://localhost:5000/api/mpesa/deposit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
        phoneNumber: '254714494777',
        amount: 1,
        userId: '1'
    })
});
const data = await response.json();
console.log('=== DEPOSIT RESPONSE ===');
console.log(JSON.stringify(data, null, 2));

if (data.success && data.checkoutRequestId) {
    console.log('\nSTK Push initiated! Polling status...');
    // Wait 5 seconds then check status
    await new Promise(r => setTimeout(r, 5000));

    const statusRes = await fetch(`http://localhost:5000/api/mpesa/status/${data.checkoutRequestId}`);
    const statusData = await statusRes.json();
    console.log('\n=== STATUS RESPONSE ===');
    console.log(JSON.stringify(statusData, null, 2));

    // Poll again after 5 more seconds
    await new Promise(r => setTimeout(r, 5000));
    const statusRes2 = await fetch(`http://localhost:5000/api/mpesa/status/${data.checkoutRequestId}`);
    const statusData2 = await statusRes2.json();
    console.log('\n=== STATUS RESPONSE (2nd poll) ===');
    console.log(JSON.stringify(statusData2, null, 2));
}
