/* ================================
   AI Vision - Frontend Application Logic
   ================================ */

// Chart instances
let alertsChartInstance = null;
let usersChartInstance = null;
let buildingAlertsChartInstance = null;
let alertTypesChartInstance = null;
let accumulatedAlertsChartInstance = null;
let userRoleChartInstance = null;

// Current page and job tracking
let currentPage = 'dashboard';
let currentJobId = null; // Track current video being viewed

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    setupEventListeners();
    switchPage('dashboard');
});

/**
 * Setup global event listeners
 */
function setupEventListeners() {
    // Sidebar menu toggle
    const menuToggle = document.getElementById('menuToggle');
    if (menuToggle) {
        menuToggle.addEventListener('click', toggleSidebar);
    }

    // Navigation items
    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const pageName = item.getAttribute('data-page');
            if (pageName) {
                // Update active nav item
                document.querySelectorAll('.nav-item').forEach(navItem => {
                    navItem.classList.remove('active');
                });
                item.classList.add('active');
                // Switch page
                switchPage(pageName);
            }
        });
    });

    // Upload form
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        setupUploadForm();
    }

    // Add User form
    const addUserForm = document.getElementById('addUserForm');
    if (addUserForm) {
        addUserForm.addEventListener('submit', handleAddUser);
    }
}

/**
 * Toggle sidebar visibility on mobile
 */
function toggleSidebar() {
    const wrapper = document.querySelector('.wrapper');
    const sidebar = document.querySelector('.sidebar');
    
    if (sidebar) {
        sidebar.classList.toggle('active');
        wrapper.classList.toggle('sidebar-open');
    }
}


/**
 * Switch between pages
 */
function switchPage(pageName) {
    console.log('Switching to page:', pageName);
    currentPage = pageName;
    
    // Hide all pages
    document.querySelectorAll('.page-section').forEach(section => {
        section.classList.remove('active');
    });
    
    // Show selected page
    const pageElement = document.getElementById(pageName + '-page');
    console.log('Page element found:', pageElement);
    if (pageElement) {
        pageElement.classList.add('active');
    }
    
    // Update page title
    const pageTitle = document.getElementById('pageTitle');
    if (pageTitle) {
        const titleMap = {
            'dashboard': 'DASHBOARD',
            'camera-directory': 'CAMERA DIRECTORY',
            'upload-video': 'UPLOAD VIDEO',
            'manage-files': 'MANAGE FILES',
            'alerts-summary': 'ALERTS SUMMARY',
            'building-alerts': 'BUILDING ALERTS',
            'accumulated-alerts': 'ACCUMULATED ALERTS',
            'add-users': 'ADD USERS',
            'contacts': 'CONTACTS',
            'user-chart': 'USER CHART'
        };
        pageTitle.textContent = titleMap[pageName] || pageName.toUpperCase();
    }
    
    // Close sidebar on mobile
    const sidebar = document.querySelector('.sidebar');
    if (sidebar && window.innerWidth < 768) {
        sidebar.classList.remove('active');
    }
    
    // Load page-specific data
    loadPageData(pageName);
}

/**
 * Load page-specific data
 */
function loadPageData(pageName) {
    switch(pageName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'alerts-summary':
            loadAlertsSummary(currentJobId);
            break;
        case 'building-alerts':
            loadBuildingAlerts(currentJobId);
            break;
        case 'accumulated-alerts':
            loadAccumulatedAlerts(currentJobId);
            break;
        case 'upload-video':
            // Already set up
            break;
        case 'manage-files':
            loadFilesList();
            break;
        case 'user-chart':
            loadUserChart();
            break;
        case 'camera-directory':
            loadCameras();
            break;
    }
}

/**
 * Load Dashboard Data
 */
function loadDashboardData() {
    loadStatistics();
    loadRecentAlerts();
    
    // Initialize dashboard charts
    setTimeout(() => {
        if (document.getElementById('alertsChart')) {
            initializeDashboardCharts();
        }
    }, 100);
}

/**
 * Initialize dashboard charts
 */
function initializeDashboardCharts() {
    const alertsCtx = document.getElementById('alertsChart');
    const usersCtx = document.getElementById('usersChart');
    
    if (!alertsCtx || !usersCtx) return;

    // Destroy existing charts
    if (alertsChartInstance) alertsChartInstance.destroy();
    if (usersChartInstance) usersChartInstance.destroy();

    // Alerts Generated Chart
    alertsChartInstance = new Chart(alertsCtx, {
        type: 'line',
        data: {
            labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
            datasets: [
                {
                    label: 'Alerts',
                    data: [12, 19, 3, 5, 2, 3, 9],
                    borderColor: '#3b82f6',
                    backgroundColor: 'rgba(59, 130, 246, 0.1)',
                    borderWidth: 2,
                    tension: 0.4,
                    fill: true,
                    pointBackgroundColor: '#3b82f6',
                    pointBorderColor: '#fff',
                    pointBorderWidth: 2
                }
            ]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: { color: '#cbd5e1' }
                }
            },
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#94a3b8' },
                    grid: { color: '#334155' }
                },
                x: {
                    ticks: { color: '#94a3b8' },
                    grid: { color: '#334155' }
                }
            }
        }
    });

    // Users Chart
    usersChartInstance = new Chart(usersCtx, {
        type: 'doughnut',
        data: {
            labels: ['Admin', 'Manager', 'Viewer'],
            datasets: [{
                data: [5, 10, 15],
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
                borderColor: '#0f172a',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true,
            plugins: {
                legend: {
                    display: true,
                    labels: { color: '#cbd5e1' }
                }
            }
        }
    });
}

/**
 * Load Statistics
 */
function loadStatistics() {
    fetch('/api/statistics')
        .then(response => response.json())
        .then(data => {
            console.log('Statistics loaded:', data);
            // Update dashboard with stats
        })
        .catch(error => console.error('Error loading statistics:', error));
}

/**
 * Load Recent Alerts
 */
function loadRecentAlerts() {
    fetch('/api/alerts')
        .then(response => response.json())
        .then(data => {
            const alertsList = document.getElementById('recentAlerts');
            if (!alertsList) return;
            
            if (!data.length) {
                alertsList.innerHTML = '<p style="color: #94a3b8; text-align: center; padding: 2rem;">No alerts found</p>';
                return;
            }

            alertsList.innerHTML = data.slice(0, 5).map(alert => `
                <div class="alert-item">
                    <div class="alert-building">${alert.building || 'Unknown'}</div>
                    <div class="alert-camera">${alert.camera_region || 'Unknown'}</div>
                    <div class="alert-date">${new Date(alert.timestamp).toLocaleDateString()}</div>
                    <span class="alert-badge alert-${alert.type?.toLowerCase() || 'normal'}">${alert.type || 'Normal'}</span>
                </div>
            `).join('');
        })
        .catch(error => console.error('Error loading alerts:', error));
}

/**
 * Merge consecutive alerts of the same type within 1 second gap
 */
function mergeConsecutiveAlerts(alerts) {
    if (!alerts || alerts.length === 0) return [];
    
    // Sort alerts by time
    const sortedAlerts = [...alerts].sort((a, b) => {
        const timeA = a.start_time !== undefined ? a.start_time : new Date(a.upload_time || a.timestamp || 0).getTime() / 1000;
        const timeB = b.start_time !== undefined ? b.start_time : new Date(b.upload_time || b.timestamp || 0).getTime() / 1000;
        return timeA - timeB;
    });
    
    const mergedAlerts = [];
    let currentSegment = null;
    let confidenceSum = 0;
    let confidenceCount = 0;
    
    sortedAlerts.forEach(alert => {
        if (!currentSegment) {
            // Start new segment
            currentSegment = {
                type: alert.type,
                start_time: alert.start_time,
                end_time: alert.end_time,
                source: alert.source,
                upload_time: alert.upload_time,
                timestamp: alert.timestamp
            };
            confidenceSum = alert.confidence || 0;
            confidenceCount = 1;
        } else if (
            currentSegment.type === alert.type &&
            (alert.start_time - currentSegment.end_time) <= 1.0  // Within 1 second gap
        ) {
            // Extend current segment
            currentSegment.end_time = Math.max(currentSegment.end_time, alert.end_time);
            confidenceSum += (alert.confidence || 0);
            confidenceCount++;
        } else {
            // Save current segment and start new one
            currentSegment.duration = currentSegment.end_time - currentSegment.start_time;
            currentSegment.confidence = confidenceSum / confidenceCount;
            mergedAlerts.push(currentSegment);
            
            currentSegment = {
                type: alert.type,
                start_time: alert.start_time,
                end_time: alert.end_time,
                source: alert.source,
                upload_time: alert.upload_time,
                timestamp: alert.timestamp
            };
            confidenceSum = alert.confidence || 0;
            confidenceCount = 1;
        }
    });
    
    // Add last segment
    if (currentSegment) {
        currentSegment.duration = currentSegment.end_time - currentSegment.start_time;
        currentSegment.confidence = confidenceSum / confidenceCount;
        mergedAlerts.push(currentSegment);
    }
    
    return mergedAlerts;
}

/**
 * Load Alerts Summary
 * @param {string} jobId - Optional job ID to filter alerts for specific video
 */
function loadAlertsSummary(jobId = null) {
    const url = jobId ? `/api/alerts?job_id=${jobId}` : '/api/alerts';
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Filter only dangerous alerts (no normal)
            const dangerousAlerts = data.filter(alert => 
                alert.type && ['fire', 'fall', 'fighting'].includes(alert.type.toLowerCase())
            );
            
            // Merge consecutive alerts
            const mergedAlerts = mergeConsecutiveAlerts(dangerousAlerts);
            
            // Create alert types count FROM MERGED ALERTS
            const alertTypes = {
                'fire': 0,
                'fall': 0,
                'fighting': 0
            };
            
            mergedAlerts.forEach(alert => {
                const type = alert.type.toLowerCase();
                if (alertTypes.hasOwnProperty(type)) {
                    alertTypes[type]++;
                }
            });

            const ctx = document.getElementById('alertTypesChart');
            if (ctx && alertTypesChartInstance) {
                alertTypesChartInstance.destroy();
            }
            
            if (ctx) {
                // Color mapping
                const colors = {
                    'normal': '#10b981',
                    'fire': '#f97316',
                    'fall': '#eab308',
                    'fighting': '#ef4444'
                };
                
                const labels = Object.keys(alertTypes);
                const values = Object.values(alertTypes);
                const backgroundColors = labels.map(label => colors[label]);
                
                alertTypesChartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels.map(l => l.charAt(0).toUpperCase() + l.slice(1)),
                        datasets: [{
                            label: 'Count',
                            data: values,
                            backgroundColor: backgroundColors,
                            borderColor: backgroundColors.map(c => c),
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { 
                                display: true,
                                labels: { color: '#cbd5e1' } 
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return `${context.label}: ${context.parsed.y} alerts`;
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: { 
                                    color: '#94a3b8',
                                    stepSize: 1
                                },
                                grid: { color: '#334155' }
                            },
                            x: {
                                ticks: { color: '#94a3b8' },
                                grid: { color: '#334155' }
                            }
                        }
                    }
                });
            }

            // Load alerts list (recent MERGED alerts only)
            const alertsList = document.getElementById('alertsList');
            if (alertsList) {
                const sortedAlerts = mergedAlerts
                    .sort((a, b) => {
                        const timeA = a.upload_time || a.timestamp || 0;
                        const timeB = b.upload_time || b.timestamp || 0;
                        return new Date(timeB) - new Date(timeA);
                    })
                    .slice(0, 50); // Show last 50 alerts
                
                if (sortedAlerts.length === 0) {
                    alertsList.innerHTML = '<p style="text-align: center; padding: 2rem; color: #64748b;">No dangerous alerts detected</p>';
                } else {
                    alertsList.innerHTML = sortedAlerts.map(alert => {
                        const colors = {
                            'fire': '#f97316',
                            'fall': '#eab308',
                            'fighting': '#ef4444'
                        };
                        const color = colors[alert.type?.toLowerCase()] || '#64748b';
                        const time = alert.upload_time || alert.timestamp || 'Unknown';
                        const timeStr = time !== 'Unknown' ? new Date(time).toLocaleString() : 'Unknown';
                        
                        return `
                            <div style="padding: 1rem; border-bottom: 1px solid #334155; color: #cbd5e1;">
                                <div style="display: flex; justify-content: space-between; align-items: center;">
                                    <div style="flex: 1;">
                                        <div style="font-weight: 600; color: ${color}; margin-bottom: 0.25rem;">
                                            ${alert.type?.toUpperCase() || 'UNKNOWN'}
                                        </div>
                                        <small style="color: #94a3b8;">
                                            <i class="fas fa-clock" style="margin-right: 0.5rem;"></i>
                                            ${timeStr}
                                        </small>
                                        ${alert.start_time ? `
                                            <small style="color: #94a3b8; margin-left: 1rem;">
                                                <i class="fas fa-video" style="margin-right: 0.5rem;"></i>
                                                ${alert.start_time.toFixed(2)}s - ${alert.end_time.toFixed(2)}s
                                            </small>
                                        ` : ''}
                                    </div>
                                    <div style="text-align: right;">
                                        <div style="background: ${color}; color: white; padding: 0.25rem 0.75rem; border-radius: 12px; font-size: 0.75rem; font-weight: 600;">
                                            ${(alert.confidence * 100).toFixed(0)}%
                                        </div>
                                    </div>
                                </div>
                            </div>
                        `;
                    }).join('');
                }
            }
        })
        .catch(error => console.error('Error loading alerts summary:', error));
}

/**
 * Load Building Alerts
 * @param {string} jobId - Optional job ID to filter alerts for specific video
 */
function loadBuildingAlerts(jobId = null) {
    const url = jobId ? `/api/alerts?job_id=${jobId}` : '/api/alerts';
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Filter only dangerous alerts
            const dangerousAlerts = data.filter(alert => 
                alert.type && ['fire', 'fall', 'fighting'].includes(alert.type.toLowerCase())
            );
            
            // Merge consecutive alerts
            const mergedAlerts = mergeConsecutiveAlerts(dangerousAlerts);
            
            const ctx = document.getElementById('buildingAlertsChart');
            if (ctx && buildingAlertsChartInstance) {
                buildingAlertsChartInstance.destroy();
            }
            
            if (ctx) {
                let labels, counts, chartLabel;
                
                if (jobId) {
                    // When viewing specific video: group by alert TYPE
                    const typeGroups = {
                        'fire': 0,
                        'fall': 0,
                        'fighting': 0
                    };
                    
                    mergedAlerts.forEach(alert => {
                        const type = alert.type.toLowerCase();
                        if (typeGroups.hasOwnProperty(type)) {
                            typeGroups[type]++;
                        }
                    });
                    
                    labels = Object.keys(typeGroups).map(t => t.charAt(0).toUpperCase() + t.slice(1));
                    counts = Object.values(typeGroups);
                    chartLabel = 'Alerts by Type';
                } else {
                    // When viewing all: group by date
                    const dateGroups = {};
                    mergedAlerts.forEach(alert => {
                        const time = alert.upload_time || alert.timestamp;
                        if (time) {
                            const date = new Date(time).toLocaleDateString('en-CA'); // YYYY-MM-DD format
                            dateGroups[date] = (dateGroups[date] || 0) + 1;
                        }
                    });
                    
                    // Sort dates chronologically and limit to last 10 days
                    const sortedDates = Object.keys(dateGroups)
                        .sort((a, b) => new Date(a) - new Date(b))
                        .slice(-10);
                    
                    labels = sortedDates.map(date => {
                        const d = new Date(date);
                        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    });
                    counts = sortedDates.map(date => dateGroups[date]);
                    chartLabel = 'Alerts per Day';
                }
                
                buildingAlertsChartInstance = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: chartLabel,
                            data: counts,
                            backgroundColor: '#10b981',
                            borderColor: '#059669',
                            borderWidth: 1
                        }]
                    },
                    options: {
                        responsive: true,
                        indexAxis: 'y',
                        plugins: {
                            legend: { 
                                display: true,
                                labels: { color: '#cbd5e1' } 
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return `Alerts: ${context.parsed.x}`;
                                    }
                                }
                            }
                        },
                        scales: {
                            x: {
                                beginAtZero: true,
                                ticks: { 
                                    color: '#94a3b8',
                                    stepSize: 1
                                },
                                grid: { color: '#334155' }
                            },
                            y: {
                                ticks: { color: '#94a3b8' },
                                grid: { color: '#334155' }
                            }
                        }
                    }
                });
            }
        })
        .catch(error => console.error('Error loading building alerts:', error));
}

/**
 * Load Accumulated Alerts
 * @param {string} jobId - Optional job ID to filter alerts for specific video
 */
function loadAccumulatedAlerts(jobId = null) {
    const url = jobId ? `/api/alerts?job_id=${jobId}` : '/api/alerts';
    fetch(url)
        .then(response => response.json())
        .then(data => {
            // Filter only dangerous alerts
            const dangerousAlerts = data.filter(alert => 
                alert.type && ['fire', 'fall', 'fighting'].includes(alert.type.toLowerCase())
            );
            
            // Merge consecutive alerts
            const mergedAlerts = mergeConsecutiveAlerts(dangerousAlerts);

            const ctx = document.getElementById('accumulatedAlertsChart');
            if (ctx && accumulatedAlertsChartInstance) {
                accumulatedAlertsChartInstance.destroy();
            }
            
            if (ctx) {
                let labels, values, chartLabel;
                
                if (jobId) {
                    // When viewing specific video: cumulative by video timeline with time buckets
                    // Sort by start_time
                    const sortedAlerts = mergedAlerts.sort((a, b) => a.start_time - b.start_time);
                    
                    if (sortedAlerts.length === 0) {
                        labels = ['0s'];
                        values = [0];
                        chartLabel = 'Cumulative Alerts in Video';
                    } else {
                        // Find video duration (max end_time)
                        const maxTime = Math.max(...sortedAlerts.map(a => a.end_time || a.start_time));
                        
                        // Create time buckets (every 5 seconds or adaptive based on video length)
                        const bucketSize = maxTime > 60 ? 10 : 5; // 10s for long videos, 5s for short
                        const numBuckets = Math.ceil(maxTime / bucketSize);
                        
                        labels = [];
                        values = [];
                        let cumulative = 0;
                        let alertIndex = 0;
                        
                        // Start from 0
                        labels.push('0s');
                        values.push(0);
                        
                        // For each time bucket
                        for (let i = 1; i <= numBuckets; i++) {
                            const bucketTime = i * bucketSize;
                            
                            // Count alerts that occurred before this bucket time
                            while (alertIndex < sortedAlerts.length && 
                                   sortedAlerts[alertIndex].start_time <= bucketTime) {
                                cumulative++;
                                alertIndex++;
                            }
                            
                            labels.push(`${bucketTime}s`);
                            values.push(cumulative);
                        }
                        
                        chartLabel = 'Cumulative Alerts in Video Timeline';
                    }
                } else {
                    // When viewing all: cumulative by date
                    const sortedAlerts = mergedAlerts.sort((a, b) => {
                        const timeA = new Date(a.upload_time || a.timestamp || 0);
                        const timeB = new Date(b.upload_time || b.timestamp || 0);
                        return timeA - timeB;
                    });
                    
                    // Group by date and calculate cumulative count
                    const dateAlerts = {};
                    let cumulative = 0;
                    
                    sortedAlerts.forEach(alert => {
                        const time = alert.upload_time || alert.timestamp;
                        if (time) {
                            const date = new Date(time).toLocaleDateString('en-CA'); // YYYY-MM-DD
                            if (!dateAlerts[date]) {
                                cumulative++;
                                dateAlerts[date] = cumulative;
                            } else {
                                cumulative++;
                                dateAlerts[date] = cumulative;
                            }
                        }
                    });
                    
                    // Sort dates and format labels
                    const sortedDates = Object.keys(dateAlerts).sort((a, b) => new Date(a) - new Date(b));
                    values = sortedDates.map(date => dateAlerts[date]);
                    labels = sortedDates.map(date => {
                        const d = new Date(date);
                        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                    });
                    
                    chartLabel = 'Cumulative Alerts Over Time';
                }
                
                accumulatedAlertsChartInstance = new Chart(ctx, {
                    type: 'line',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: chartLabel,
                            data: values,
                            borderColor: '#f59e0b',
                            backgroundColor: 'rgba(245, 158, 11, 0.1)',
                            borderWidth: 2,
                            fill: true,
                            tension: 0.4
                        }]
                    },
                    options: {
                        responsive: true,
                        plugins: {
                            legend: { 
                                display: true,
                                labels: { color: '#cbd5e1' } 
                            },
                            tooltip: {
                                callbacks: {
                                    label: function(context) {
                                        return `Total Alerts: ${context.parsed.y}`;
                                    }
                                }
                            }
                        },
                        scales: {
                            y: {
                                beginAtZero: true,
                                ticks: { 
                                    color: '#94a3b8',
                                    stepSize: 1
                                },
                                grid: { color: '#334155' }
                            },
                            x: {
                                ticks: { color: '#94a3b8' },
                                grid: { color: '#334155' }
                            }
                        }
                    }
                });
            }
        })
        .catch(error => console.error('Error loading accumulated alerts:', error));
}

/**
 * Load Files List
 */
function loadFilesList() {
    fetch('/api/files')
        .then(response => response.json())
        .then(data => {
            const filesList = document.getElementById('filesList');
            if (!filesList) return;
            
            if (!data.length) {
                filesList.innerHTML = '<p style="color: #94a3b8;">No files found</p>';
                return;
            }

            // Separate processed videos from uploads
            const processedVideos = data.filter(file => file.type === 'output' && file.name.endsWith('.mp4'));
            const otherFiles = data.filter(file => file.type !== 'output' || !file.name.endsWith('.mp4'));

            let html = '';

            // Display processed videos with preview
            if (processedVideos.length > 0) {
                html += '<h4 style="color: #e2e8f0; margin-bottom: 1rem;">Processed Videos</h4>';
                html += '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(400px, 1fr)); gap: 1.5rem; margin-bottom: 2rem;">';
                html += processedVideos.map(file => {
                    const videoUrl = `/outputs/${file.name}`;
                    return `
                        <div style="background: #0f172a; border-radius: 8px; overflow: hidden; border: 1px solid #334155;">
                            <video controls style="width: 100%; background: #000; max-height: 300px;">
                                <source src="${videoUrl}" type="video/mp4">
                                Your browser does not support the video tag.
                            </video>
                            <div style="padding: 1rem;">
                                <div style="color: #e2e8f0; font-weight: 600; margin-bottom: 0.5rem; word-break: break-all;">
                                    <i class="fas fa-video" style="color: #3b82f6; margin-right: 0.5rem;"></i>
                                    ${file.name}
                                </div>
                                <div style="color: #94a3b8; font-size: 0.85rem; margin-bottom: 1rem;">
                                    <i class="fas fa-hdd" style="margin-right: 0.5rem;"></i>
                                    ${(file.size / 1024 / 1024).toFixed(2)} MB
                                </div>
                                <div style="display: flex; gap: 0.5rem;">
                                    <a href="${videoUrl}" download style="flex: 1; background: #10b981; color: white; border: none; padding: 0.5rem; border-radius: 4px; cursor: pointer; text-align: center; text-decoration: none;">
                                        <i class="fas fa-download"></i> Download
                                    </a>
                                    <button onclick="deleteFile('${file.name}')" style="flex: 1; background: #ef4444; color: white; border: none; padding: 0.5rem; border-radius: 4px; cursor: pointer;">
                                        <i class="fas fa-trash"></i> Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    `;
                }).join('');
                html += '</div>';
            }

            // Display other files as list
            if (otherFiles.length > 0) {
                html += '<h4 style="color: #e2e8f0; margin-bottom: 1rem;">Other Files</h4>';
                html += '<div style="display: grid; gap: 1rem;">';
                html += otherFiles.map(file => `
                    <div style="padding: 1rem; background: #0f172a; border-radius: 4px; display: flex; justify-content: space-between; align-items: center; border: 1px solid #334155;">
                        <div>
                            <i class="fas fa-file-video" style="color: #3b82f6;"></i>
                            <strong style="color: #e2e8f0; margin-left: 0.5rem;">${file.name}</strong>
                            <br><small style="color: #94a3b8;">${(file.size / 1024 / 1024).toFixed(2)} MB</small>
                        </div>
                        <button onclick="deleteFile('${file.name}')" style="background: #ef4444; color: white; border: none; padding: 0.5rem 1rem; border-radius: 4px; cursor: pointer;">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                `).join('');
                html += '</div>';
            }

            filesList.innerHTML = html;
        })
        .catch(error => console.error('Error loading files:', error));
}

/**
 * Load User Chart
 */
function loadUserChart() {
    const ctx = document.getElementById('userRoleChart');
    if (!ctx) return;
    
    if (userRoleChartInstance) {
        userRoleChartInstance.destroy();
    }

    userRoleChartInstance = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: ['Admin', 'Manager', 'Viewer'],
            datasets: [{
                data: [5, 10, 15],
                backgroundColor: ['#3b82f6', '#10b981', '#f59e0b'],
                borderColor: '#0f172a',
                borderWidth: 2
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: { labels: { color: '#cbd5e1' } }
            }
        }
    });
}

/**
 * Load Cameras
 */
function loadCameras() {
    const cameraGrid = document.getElementById('cameraGrid');
    if (!cameraGrid) return;
    
    cameraGrid.innerHTML = `
        <div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 1rem;">
            <div style="background: #0f172a; border-radius: 8px; padding: 1rem; text-align: center;">
                <i class="fas fa-camera" style="font-size: 2rem; color: #3b82f6;"></i>
                <h4 style="color: #e2e8f0;">Camera 1</h4>
                <p style="color: #94a3b8;">Entrance</p>
                <span style="background: #10b981; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.85rem;">Online</span>
            </div>
            <div style="background: #0f172a; border-radius: 8px; padding: 1rem; text-align: center;">
                <i class="fas fa-camera" style="font-size: 2rem; color: #3b82f6;"></i>
                <h4 style="color: #e2e8f0;">Camera 2</h4>
                <p style="color: #94a3b8;">Hallway</p>
                <span style="background: #10b981; color: white; padding: 0.25rem 0.75rem; border-radius: 4px; font-size: 0.85rem;">Online</span>
            </div>
        </div>
    `;
}

/**
 * Setup Upload Form
 */
function setupUploadForm() {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadForm = document.getElementById('uploadForm');

    if (!dropZone || !fileInput || !uploadForm) return;

    // Click to select file
    dropZone.addEventListener('click', () => fileInput.click());

    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#3b82f6';
        dropZone.style.background = 'rgba(59, 130, 246, 0.1)';
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.style.borderColor = '#334155';
        dropZone.style.background = 'transparent';
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#334155';
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            fileInput.files = files;
        }
    });

    // Form submit
    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        const file = fileInput.files[0];
        const statusDiv = document.getElementById('uploadStatus');

        if (!file) {
            statusDiv.style.color = '#ef4444';
            statusDiv.textContent = 'Please select a file';
            return;
        }

        const formData = new FormData();
        formData.append('video', file);

        statusDiv.style.color = '#3b82f6';
        statusDiv.textContent = 'Uploading...';

        fetch('/api/upload-video', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.job_id) {
                statusDiv.style.color = '#10b981';
                statusDiv.textContent = `✓ Upload successful! Processing...`;
                uploadForm.reset();
                
                // Show processing section
                showProcessingProgress(data.job_id);
            } else {
                statusDiv.style.color = '#ef4444';
                statusDiv.textContent = `Error: ${data.error}`;
            }
        })
        .catch(error => {
            statusDiv.style.color = '#ef4444';
            statusDiv.textContent = `Error: ${error.message}`;
        });
    });
}

/**
 * Show processing progress and poll for updates with REAL-TIME FRAME DISPLAY
 */
function showProcessingProgress(jobId) {
    const processingSection = document.getElementById('processingSection');
    const outputVideoSection = document.getElementById('outputVideoSection');
    const progressBar = document.getElementById('progressBar');
    const progressPercent = document.getElementById('progressPercent');
    const progressText = document.getElementById('progressText');
    const realtimeFrame = document.getElementById('realtimeFrame');
    const waitingFrame = document.getElementById('waitingFrame');
    const frameInfo = document.getElementById('frameInfo');
    
    // Hide output section and show processing section
    outputVideoSection.style.display = 'none';
    processingSection.style.display = 'block';
    
    // Poll for progress updates with REAL-TIME FRAMES
    const pollInterval = setInterval(() => {
        fetch(`/api/processing-status/${jobId}`)
            .then(response => response.json())
            .then(data => {
                const progress = data.progress || 0;
                const status = data.status;
                
                // Update progress bar
                progressBar.style.width = `${progress}%`;
                progressPercent.textContent = `${Math.round(progress)}%`;
                
                // Update real-time frame display
                if (data.current_frame) {
                    const frameData = data.current_frame;
                    if (frameData.frame) {
                        // Show frame image
                        realtimeFrame.src = `data:image/jpeg;base64,${frameData.frame}`;
                        realtimeFrame.style.display = 'block';
                        waitingFrame.style.display = 'none';
                        
                        // Update frame info
                        frameInfo.innerHTML = `
                            <i class="fas fa-film" style="color: #3b82f6; margin-right: 0.5rem;"></i>
                            Frame: <strong>${frameData.frame_idx}</strong> / ${frameData.total_frames} 
                            <span style="color: #10b981; margin-left: 1rem;">
                                <i class="fas fa-check-circle"></i> Live Analysis
                            </span>
                        `;
                    }
                }
                
                if (status === 'processing') {
                    progressText.innerHTML = `
                        <i class="fas fa-brain" style="color: #3b82f6; margin-right: 0.5rem;"></i>
                        AI is analyzing video frame-by-frame...
                    `;
                } else if (status === 'completed') {
                    clearInterval(pollInterval);
                    progressBar.style.width = '100%';
                    progressPercent.textContent = '100%';
                    progressText.innerHTML = `
                        <i class="fas fa-check-circle" style="color: #10b981; margin-right: 0.5rem;"></i>
                        Processing completed successfully!
                    `;
                    
                    // Show output video
                    setTimeout(() => {
                        showOutputVideo(jobId);
                    }, 1000);
                } else if (status === 'failed') {
                    clearInterval(pollInterval);
                    progressText.innerHTML = `
                        <i class="fas fa-exclamation-circle" style="color: #ef4444; margin-right: 0.5rem;"></i>
                        Error: ${data.error || 'Processing failed'}
                    `;
                    progressText.style.color = '#ef4444';
                    
                    // Hide frame display
                    realtimeFrame.style.display = 'none';
                    waitingFrame.style.display = 'block';
                    waitingFrame.innerHTML = `
                        <i class="fas fa-times-circle" style="font-size: 3rem; color: #ef4444; display: block; margin-bottom: 1rem;"></i>
                        <p style="color: #ef4444;">Processing failed</p>
                    `;
                }
            })
            .catch(error => {
                console.error('Error polling status:', error);
            });
    }, 500); // Poll every 0.5 seconds for smoother frame updates
}

/**
 * Show output video
 */
async function showOutputVideo(jobId) {
    const processingSection = document.getElementById('processingSection');
    const outputVideoSection = document.getElementById('outputVideoSection');
    const outputVideo = document.getElementById('outputVideo');
    const downloadBtn = document.getElementById('downloadBtn');
    const viewAlertsBtn = document.getElementById('viewAlertsBtn');
    const alertCountSpan = document.getElementById('alertCount');
    
    // Hide processing and show output
    processingSection.style.display = 'none';
    outputVideoSection.style.display = 'block';
    
    // Set video source
    outputVideo.src = `/api/download-video/${jobId}`;
    outputVideo.load();
    
    // Fetch alerts and count MERGED alerts (same as action timeline)
    try {
        const response = await fetch(`/api/alerts?job_id=${jobId}`);
        const alerts = await response.json();
        
        // Filter dangerous alerts
        const dangerousAlerts = alerts.filter(alert => 
            alert.type && ['fire', 'fall', 'fighting'].includes(alert.type.toLowerCase())
        );
        
        // Merge consecutive alerts (same logic as timeline)
        const mergedAlerts = mergeConsecutiveAlerts(dangerousAlerts);
        
        // Update alert count with MERGED count
        alertCountSpan.textContent = mergedAlerts.length;
    } catch (error) {
        console.error('Error fetching alerts:', error);
        alertCountSpan.textContent = '0';
    }
    
    // Load and display timeline
    loadActionTimeline(jobId);
    
    // Download button
    downloadBtn.onclick = () => {
        window.open(`/api/download-video/${jobId}`, '_blank');
    };
    
    // View alerts button
    viewAlertsBtn.onclick = () => {
        switchPage('alerts-summary');
        document.querySelector('[data-page="alerts-summary"]').click();
    };
}

/**
 * Load and display action timeline
 */
async function loadActionTimeline(jobId) {
    const timelineContent = document.getElementById('timelineContent');
    
    // Save current job ID
    currentJobId = jobId;
    
    // Update all charts with current video's alerts
    loadAlertsSummary(jobId);
    loadBuildingAlerts(jobId);
    loadAccumulatedAlerts(jobId);
    
    try {
        const response = await fetch(`/api/alerts?job_id=${jobId}`);
        const alerts = await response.json();
        
        if (!alerts || alerts.length === 0) {
            timelineContent.innerHTML = '<p style="text-align: center; padding: 2rem 0; color: #64748b;">No actions detected</p>';
            return;
        }
        
        // Use shared merge function
        const mergedAlerts = mergeConsecutiveAlerts(alerts);
        
        // Build timeline HTML
        const actionColors = {
            'fall': '#eab308',
            'fighting': '#ef4444',
            'fire': '#f97316',
            'normal': '#10b981'
        };
        
        const actionIcons = {
            'fall': 'fa-person-falling',
            'fighting': 'fa-hand-fist',
            'fire': 'fa-fire',
            'normal': 'fa-check'
        };
        
        let html = '';
        mergedAlerts.forEach((alert, index) => {
            const color = actionColors[alert.type] || '#64748b';
            const icon = actionIcons[alert.type] || 'fa-exclamation';
            const duration = alert.duration || 0;
            
            html += `
                <div style="margin-bottom: 1rem; padding: 1rem; background: #0f172a; border-left: 4px solid ${color}; border-radius: 4px; cursor: pointer;" 
                     onclick="seekToTime(${alert.start_time})">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem;">
                        <span style="font-weight: 600; color: ${color};">
                            <i class="fas ${icon}" style="margin-right: 0.5rem;"></i>
                            ${alert.type.toUpperCase()}
                        </span>
                    </div>
                    <div style="font-size: 0.85rem; color: #94a3b8;">
                        <div><i class="fas fa-clock" style="margin-right: 0.5rem; color: #64748b;"></i>${alert.start_time.toFixed(2)}s - ${alert.end_time.toFixed(2)}s</div>
                        <div style="margin-top: 0.25rem;"><i class="fas fa-hourglass" style="margin-right: 0.5rem; color: #64748b;"></i>Duration: ${duration.toFixed(2)}s</div>
                        <div style="margin-top: 0.25rem;"><i class="fas fa-chart-line" style="margin-right: 0.5rem; color: #64748b;"></i>Confidence: ${(alert.confidence * 100).toFixed(1)}%</div>
                    </div>
                </div>
            `;
        });
        
        timelineContent.innerHTML = html;
    } catch (error) {
        console.error('Error loading timeline:', error);
        timelineContent.innerHTML = '<p style="text-align: center; padding: 2rem 0; color: #ef4444;">Error loading timeline</p>';
    }
}

/**
 * Seek video to specific time
 */
function seekToTime(timeInSeconds) {
    const outputVideo = document.getElementById('outputVideo');
    if (outputVideo) {
        outputVideo.currentTime = timeInSeconds;
        outputVideo.play();
    }
}

/**
 * Handle Add User
 */
function handleAddUser(e) {
    e.preventDefault();
    alert('Add user functionality would be implemented here');
}

/**
 * Delete File
 */
function deleteFile(filename) {
    if (!confirm('Are you sure you want to delete this file?')) return;
    
    fetch(`/api/delete-file/${filename}`, { method: 'DELETE' })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                loadFilesList();
            }
        })
        .catch(error => console.error('Error deleting file:', error));
}

/**
 * Toggle Dark Mode
 */
function toggleDarkMode() {
    document.body.classList.toggle('light-mode');
}
