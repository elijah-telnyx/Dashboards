import axios from 'axios';
import dashboardConfig from '../config/dashboards.json';

const PROMETHEUS_URL = process.env.REACT_APP_PROMETHEUS_URL || 'http://localhost:9090';

export const fetchMetrics = async (panelId) => {
  try {
    const panel = dashboardConfig.panels.find(p => p.id === panelId);
    if (!panel) {
      throw new Error(`Panel ${panelId} not found in configuration`);
    }

    const now = Math.floor(Date.now() / 1000);
    const params = {
      query: panel.query,
      start: now - panel.timeRange,
      end: now,
      step: '15s'
    };

    const response = await axios.get(`${PROMETHEUS_URL}/api/v1/query_range`, { params });

    if (response.data.status === 'success') {
      const result = response.data.data.result[0]?.values.map(([timestamp, value]) => ({
        timestamp: new Date(timestamp * 1000).toLocaleTimeString(),
        value: parseFloat(value) * (panel.valueMultiplier || 1),
      })) || [];

      return {
        data: result,
        title: `${panel.title} (${panel.timeRange / 60}m)`,
        unit: panel.unit
      };
    }
    throw new Error('Failed to fetch metrics');
  } catch (error) {
    console.error('Error fetching metrics:', error);
    throw error;
  }
};

export const getPanelConfig = () => dashboardConfig.panels;
