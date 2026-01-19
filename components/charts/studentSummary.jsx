'use client';

import { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import 'chart.js/auto';

const StudentSummaries = ({ data }) => {
  const [chartData, setChartData] = useState({
    gender: { datasets: [], labels: [] },
    section: { datasets: [], labels: [] },
    level: { datasets: [], labels: [] },
  });

  // Aggregate data
  useEffect(() => {
    const genderCount = data.reduce((acc, student) => {
      acc[student.gender] = (acc[student.gender] || 0) + 1;
      return acc;
    }, {});
    
    const sectionCount = data.reduce((acc, student) => {
      acc[student.section] = (acc[student.section] || 0) + 1;
      return acc;
    }, {});
    
    const levelCount = data.reduce((acc, student) => {
      acc[student.level] = (acc[student.level] || 0) + 1;
      return acc;
    }, {});

    setChartData({
      gender: {
        labels: Object.keys(genderCount),
        datasets: [{
          data: Object.values(genderCount),
          backgroundColor: ['#b91c1c', '#374151', '#991b1b'],
          hoverBackgroundColor: ['#dc2626', '#4b5563', '#b91c1c'],
          borderColor: '#ffffff',
          borderWidth: 2,
        }],
      },
      section: {
        labels: Object.keys(sectionCount),
        datasets: [{
          data: Object.values(sectionCount),
          backgroundColor: ['#b91c1c', '#374151'],
          hoverBackgroundColor: ['#dc2626', '#4b5563'],
          borderColor: '#ffffff',
          borderWidth: 2,
        }],
      },
      level: {
        labels: Object.keys(levelCount),
        datasets: [{
          data: Object.values(levelCount),
          backgroundColor: '#b91c1c',
          hoverBackgroundColor: '#dc2626',
          borderColor: '#ffffff',
          borderWidth: 1,
        }],
      },
    });
  }, [data]);

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          color: '#374151',
          font: {
            size: 14,
          },
        },
      },
      tooltip: {
        backgroundColor: '#374151',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        callbacks: {
          label: (context) => `${context.label}: ${context.raw}`,
        },
      },
    },
  };

  const donutOptions = {
    ...chartOptions,
    cutout: '50%', // Creates donut shape
  };

  const barOptions = {
    ...chartOptions,
    scales: {
      x: {
        ticks: {
          color: '#374151',
          autoSkip: false,
          maxRotation: 45,
          minRotation: 45,
        },
        grid: {
          color: '#e5e7eb',
        },
      },
      y: {
        beginAtZero: true,
        ticks: {
          color: '#374151',
        },
        grid: {
          color: '#e5e7eb',
        },
      },
    },
  };

  return (
    <div className="container mx-auto p-4 bg-background-light dark:bg-background-dark">
      <div>
        <h1 className="text-2xl font-bold mt-4 text-secondary dark:text-primary">Student Summaries</h1>
        <p className="text-sm font-light mb-8 text-secondary dark:text-primary">Visualize student data by gender, section, and level.</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <div className="bg-primary dark:bg-secondary p-4 rounded-lg shadow-md">
          <h2 className="text-md font-medium mb-2 text-primary">Gender Distribution</h2>
          <div className="h-64">
            <Doughnut data={chartData.gender} options={donutOptions} />
          </div>
        </div>
        <div className="bg-primary dark:bg-secondary p-4 rounded-lg shadow-md">
          <h2 className="text-md font-medium mb-2 text-primary">Section Distribution</h2>
          <div className="h-64">
            <Doughnut data={chartData.section} options={donutOptions} />
          </div>
        </div>
        <div className="bg-primary dark:bg-secondary p-4 rounded-lg shadow-md">
          <h2 className="text-md font-medium mb-2 text-primary">Level Distribution</h2>
          <div className="h-64">
            <Bar data={chartData.level} options={barOptions} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default StudentSummaries;