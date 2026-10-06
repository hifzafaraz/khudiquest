const app = require('./server');
const http = require('http');

const PORT = 5098;
const server = http.createServer(app);

server.listen(PORT, async () => {
  console.log(`Running Khudi Quest API test suite on http://localhost:${PORT}...`);
  const baseUrl = `http://localhost:${PORT}`;

  try {
    // 1. Health check
    let res = await fetch(baseUrl + '/api/health');
    let data = await res.json();
    if (data.status !== 'operational') throw new Error('Health check failed');
    console.log('✓ Health check passed');

    // 2. Root check
    res = await fetch(baseUrl + '/');
    data = await res.json();
    if (!data.message) throw new Error('Root route failed');
    console.log('✓ Root route passed');

    // 3. User Registration
    const testEmail = `test_${Date.now()}@khudiquest.com`;
    const testPassword = 'Password123!';
    res = await fetch(baseUrl + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    data = await res.json();
    if (res.status !== 201) throw new Error('Registration failed: ' + JSON.stringify(data));
    console.log('✓ User registration passed');

    // 4. Duplicate Registration
    res = await fetch(baseUrl + '/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    if (res.status !== 400) throw new Error('Duplicate registration should return 400');
    console.log('✓ Duplicate registration check passed');

    // 5. User Login
    res = await fetch(baseUrl + '/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: testEmail, password: testPassword })
    });
    data = await res.json();
    if (!data.token) throw new Error('Login failed: ' + JSON.stringify(data));
    console.log('✓ User login passed');

    // 6. Add Task
    res = await fetch(baseUrl + '/api/tasks/add', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        text: 'Automated verification test item',
        quadrant: 'q1',
        fromTime: '08:00',
        toTime: '09:00',
        day: 'Mon',
        userEmail: testEmail
      })
    });
    const task = await res.json();
    if (!task._id) throw new Error('Task creation failed: ' + JSON.stringify(task));
    console.log('✓ Task creation passed');

    // 7. Fetch Tasks
    res = await fetch(baseUrl + '/api/tasks/fetch-all', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail: testEmail })
    });
    const tasks = await res.json();
    if (!Array.isArray(tasks) || tasks.length === 0) throw new Error('Task fetching failed');
    console.log('✓ Task fetching passed');

    // 8. Toggle Task
    res = await fetch(baseUrl + '/api/tasks/toggle-status', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ taskId: task._id, completedStatus: true })
    });
    data = await res.json();
    if (res.status !== 200) throw new Error('Task toggle failed');
    console.log('✓ Task toggle status passed');

    // 9. Purge Tasks
    res = await fetch(baseUrl + '/api/tasks/purge-history', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userEmail: testEmail })
    });
    if (res.status !== 200) throw new Error('Task purge failed');
    console.log('✓ Task purge history passed');

    console.log('\n🎉 ALL BACKEND CHECKS VERIFIED SUCCESSFULLY!\n');
    server.close();
    process.exit(0);
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    server.close();
    process.exit(1);
  }
});
