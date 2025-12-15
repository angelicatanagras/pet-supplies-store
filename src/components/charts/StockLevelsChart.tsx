'use client';

import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { Product } from '@/types';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

interface StockLevelsChartProps {
  products: Product[];
}

export function StockLevelsChart({ products }: StockLevelsChartProps) {
  const sortedProducts = [...products]
    .sort((a, b) => a.stock - b.stock)
    .slice(0, 10);

  const data = {
    labels: sortedProducts.map((p) => p.name.length > 20 ? p.name.substring(0, 20) + '...' : p.name),
    datasets: [
      {
        label: 'Stock Level',
        data: sortedProducts.map((p) => p.stock),
        backgroundColor: sortedProducts.map((p) =>
          p.stock < 10 ? 'rgba(239, 68, 68, 0.8)' : 'rgba(34, 197, 94, 0.8)'
        ),
        borderColor: sortedProducts.map((p) =>
          p.stock < 10 ? 'rgba(239, 68, 68, 1)' : 'rgba(34, 197, 94, 1)'
        ),
        borderWidth: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false,
      },
      title: {
        display: true,
        text: 'Stock Levels (Lowest 10 Products)',
        font: {
          size: 16,
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Stock Quantity',
        },
      },
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
        },
      },
    },
  };

  return (
    <div className="h-[300px]">
      <Bar data={data} options={options} />
    </div>
  );
}
