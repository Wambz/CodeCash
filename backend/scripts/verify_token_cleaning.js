
function sanitize(token) {
    if (token) {
        return String(token).trim().replace(/^['"]|['"]$/g, '');
    }
    return token;
}

const tests = [
    { input: ' validToken ', expected: 'validToken' },
    { input: '"quotedToken"', expected: 'quotedToken' },
    { input: "'singleQuoted'", expected: 'singleQuoted' },
    { input: ' " mixed " ', expected: ' mixed ' }, // inner spaces preserved
    { input: '"surrounded" ', expected: 'surrounded' }
];

console.log('Testing Token Sanitization Logic:');
let passed = true;
tests.forEach(t => {
    const result = sanitize(t.input);
    const success = result === t.expected;
    console.log(`Input: [${t.input}] -> Output: [${result}] | ${success ? '✅' : '❌'}`);
    if (!success) passed = false;
});

if (passed) console.log('All tests passed.');
else console.error('Some tests failed.');
