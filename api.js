/**
 * Reem Team API Client
 * Connects web portal to backend server
 */

// Configuration
const API_BASE_URL = 'http://127.0.0.1:3000/api'; // Change to your backend URL
const API_TIMEOUT = 30000; // 30 seconds

class ReemTeamAPI {
  constructor() {
    this.token = localStorage.getItem('authToken');
    this.user = JSON.parse(localStorage.getItem('currentUser') || '{}');
  }

  /**
   * Make HTTP request
   */
  async request(endpoint, options = {}) {
    const url = `${API_BASE_URL}${endpoint}`;
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), API_TIMEOUT);

      const response = await fetch(url, {
        ...options,
        headers,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (response.status === 401) {
        // Token expired or invalid
        this.logout();
        window.location.href = 'login.html';
        throw new Error('Session expired. Please login again.');
      }

      if (!response.ok) {
        const error = await response.json().catch(() => ({}));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('API Error:', error);
      throw error;
    }
  }

  /**
   * Authentication
   */
  async login(username, password) {
    const response = await this.request('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ username, password }),
    });

    if (response.token) {
      this.token = response.token;
      this.user = response.user;
      localStorage.setItem('authToken', this.token);
      localStorage.setItem('currentUser', JSON.stringify(this.user));
      sessionStorage.setItem('currentUser', username);
    }

    return response;
  }

  logout() {
    this.token = null;
    this.user = {};
    localStorage.removeItem('authToken');
    localStorage.removeItem('currentUser');
    sessionStorage.removeItem('currentUser');
  }

  /**
   * System Users Management
   */
  async getSystemUsers() {
    return this.request('/system-users');
  }

  async getSystemUserById(id) {
    return this.request(`/system-users/${id}`);
  }

  async createSystemUser(data) {
    return this.request('/system-users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSystemUser(id, data) {
    return this.request(`/system-users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteSystemUser(id) {
    return this.request(`/system-users/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Employees
   */
  async getEmployees() {
    return this.request('/employees');
  }

  async getEmployeeById(id) {
    return this.request(`/employees/${id}`);
  }

  async createEmployee(data) {
    return this.request('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateEmployee(id, data) {
    return this.request(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteEmployee(id) {
    return this.request(`/employees/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Departments
   */
  async getDepartments() {
    return this.request('/departments');
  }

  async getDepartmentById(id) {
    return this.request(`/departments/${id}`);
  }

  async createDepartment(data) {
    return this.request('/departments', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateDepartment(id, data) {
    return this.request(`/departments/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteDepartment(id) {
    return this.request(`/departments/${id}`, {
      method: 'DELETE',
    });
  }

  /**
   * Attendance
   */
  async getTodayAttendance() {
    return this.request('/attendance/today');
  }

  async checkIn(employeeId, location) {
    return this.request('/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({ employeeId, location }),
    });
  }

  async checkOut(recordId) {
    return this.request('/attendance/check-out', {
      method: 'POST',
      body: JSON.stringify({ recordId }),
    });
  }

  async getAttendanceByDate(employeeId, date) {
    return this.request(`/attendance/${employeeId}/${date}`);
  }

  async getAttendanceRange(employeeId, startDate, endDate) {
    return this.request(`/attendance/${employeeId}/range?start=${startDate}&end=${endDate}`);
  }

  /**
   * Notifications
   */
  async getNotifications() {
    return this.request('/notifications');
  }

  async getUnreadNotifications() {
    return this.request('/notifications/unread');
  }

  async createNotification(data) {
    return this.request('/notifications', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async markNotificationAsRead(notificationId) {
    return this.request(`/notifications/${notificationId}/read`, {
      method: 'PUT',
    });
  }

  async deleteNotification(notificationId) {
    return this.request(`/notifications/${notificationId}`, {
      method: 'DELETE',
    });
  }

  /**
   * Audit Logs
   */
  async getAuditLogs() {
    return this.request('/audit-logs');
  }

  async getAuditLogsByUser(userId) {
    return this.request(`/audit-logs/user/${userId}`);
  }

  /**
   * Reports
   */
  async getReports() {
    return this.request('/reports');
  }

  async getReportById(id) {
    return this.request(`/reports/${id}`);
  }

  async createReport(data) {
    return this.request('/reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateReport(id, data) {
    return this.request(`/reports/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  /**
   * Statistics
   */
  async getTodayStats() {
    return this.request('/attendance/stats/today');
  }

  async getMonthlyStats(employeeId, year, month) {
    return this.request(`/attendance/stats/monthly?employeeId=${employeeId}&year=${year}&month=${month}`);
  }
}

// Create global API instance
const api = new ReemTeamAPI();

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
  module.exports = ReemTeamAPI;
}
