async function searchRecords() {
    const searchQuery = document.getElementById('searchInput').value;
    const resultsDiv = document.getElementById('searchResults');
    
    try {
        const response = await fetch(`/search?q=${encodeURIComponent(searchQuery)}`);
        const data = await response.json();
        
        if (data.length === 0) {
            resultsDiv.innerHTML = '<p>No records found</p>';
            return;
        }

        resultsDiv.innerHTML = data.map(record => `
            <div class="record-item">
                <p>ID: ${record.id}</p>
                <p>Name: ${record.name}</p>
                <p>Value: ${record.value}</p>
            </div>
        `).join('');
    } catch (error) {
        resultsDiv.innerHTML = '<p class="error">Error searching records</p>';
    }
}

async function updateRecord() {
    const id = parseInt(document.getElementById('recordId').value);
    const name = document.getElementById('recordName').value;
    const value = document.getElementById('recordValue').value;
    const messageDiv = document.getElementById('updateMessage');

    if (!id || !name || !value) {
        messageDiv.innerHTML = '<p class="error">Please fill in all fields</p>';
        return;
    }

    try {
        const response = await fetch('/update', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ id, name, value })
        });

        const data = await response.json();
        
        if (response.ok) {
            messageDiv.innerHTML = `<p class="success">${data.message}</p>`;
            // Clear form
            document.getElementById('recordId').value = '';
            document.getElementById('recordName').value = '';
            document.getElementById('recordValue').value = '';
        } else {
            messageDiv.innerHTML = `<p class="error">${data.message}</p>`;
        }
    } catch (error) {
        messageDiv.innerHTML = '<p class="error">Error updating record</p>';
    }
}

async function loadAllRecords() {
    const recordsDiv = document.getElementById('allRecords');
    
    try {
        const response = await fetch('/records');
        const result = await response.json();
        
        if (!result.success) {
            recordsDiv.innerHTML = '<p class="error">Error loading records</p>';
            return;
        }

        if (result.data.length === 0) {
            recordsDiv.innerHTML = '<p>No records found</p>';
            return;
        }

        recordsDiv.innerHTML = result.data.map(record => `
            <div class="record-item">
                <p>ID: ${record.id}</p>
                <p>Name: ${record.name}</p>
                <p>Value: ${record.value}</p>
            </div>
        `).join('');
    } catch (error) {
        recordsDiv.innerHTML = '<p class="error">Error loading records</p>';
    }
}

let currentChart = null;

async function sendMessage() {
    const chatInput = document.getElementById('chatInput');
    const message = chatInput.value.trim();
    const chatMessages = document.getElementById('chatMessages');
    
    if (!message) return;

    // Add user message to chat
    appendMessage(message, 'user');
    chatInput.value = '';

    try {
        const response = await fetch('/chat', {  // Changed from /api/chat to /chat
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ message })
        });

        const data = await response.json();
        
        if (response.ok) {
            // Add the AI response to chat
            appendMessage(data.message, 'ai', data);
            
            // Handle visualization if present
            if (data.visualization === 'chart') {
                const chartData = {
                    type: data.chartType || 'bar',
                    data: {
                        labels: Object.keys(data.data),
                        datasets: [{
                            data: Object.values(data.data),
                            backgroundColor: [
                                '#FF6384',
                                '#36A2EB',
                                '#FFCE56',
                                '#4BC0C0',
                                '#9966FF'
                            ]
                        }]
                    },
                    options: {
                        responsive: true,
                        maintainAspectRatio: false,
                        plugins: {
                            legend: {
                                position: 'bottom'
                            }
                        }
                    }
                };
                updateVisualization(chartData);
            }
        } else {
            appendMessage('Sorry, I encountered an error processing your request.', 'ai');
        }
    } catch (error) {
        console.error('Chat error:', error);
        appendMessage('Sorry, there was an error communicating with the server.', 'ai');
    }
}

function createClickableCommand(command) {
    return `<a href="#" class="command-link" onclick="runCommand('${command}'); return false;">${command}</a>`;
}

function formatCommandsMessage(message, data) {
    if (!data) return message;

    let formattedMessage = message;
    Object.entries(data).forEach(([category, commands]) => {
        commands.forEach(cmd => {
            const quotedCmd = `"${cmd}"`;
            formattedMessage = formattedMessage.replace(
                quotedCmd,
                createClickableCommand(cmd)
            );
        });
    });
    return formattedMessage;
}

function appendMessage(message, type, data = null) {
    const chatMessages = document.getElementById('chatMessages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message ${type}-message`;
    
    if (type === 'ai' && data && data.visualization === 'commands') {
        messageDiv.innerHTML = formatCommandsMessage(message, data.data);
    } else {
        messageDiv.textContent = message;
    }
    
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function runCommand(command) {
    const chatInput = document.getElementById('chatInput');
    chatInput.value = command;
    sendMessage();
}

// Show welcome message when the chat loads
document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('/chat', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: 'help' })
    });

    if (response.ok) {
        const data = await response.json();
        appendMessage('👋 Welcome! Here are some things you can ask me:', 'ai');
        appendMessage(data.message, 'ai', data);
    }
});

// Add styles for clickable commands
const style = document.createElement('style');
style.textContent = `
.command-link {
    color: #007bff;
    text-decoration: none;
    cursor: pointer;
}
.command-link:hover {
    text-decoration: underline;
}
`;
document.head.appendChild(style);

function extractChartData(response) {
    try {
        // Look for JSON data in the response
        const jsonMatch = response.match(/```json\n([\s\S]*?)\n```/);
        if (jsonMatch) {
            return JSON.parse(jsonMatch[1]);
        }
    } catch (error) {
        console.error('Error parsing chart data:', error);
    }
    return null;
}

function updateVisualization(chartData) {
    const ctx = document.getElementById('dataChart');
    
    // Destroy existing chart if it exists
    if (currentChart) {
        currentChart.destroy();
    }

    currentChart = new Chart(ctx, {
        type: chartData.type || 'bar',
        data: chartData.data,
        options: chartData.options || {
            responsive: true,
            maintainAspectRatio: false
        }
    });
}

// Add event listener for Enter key in chat input
document.getElementById('chatInput').addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        sendMessage();
    }
});