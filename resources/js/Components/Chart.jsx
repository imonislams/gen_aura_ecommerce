import { Suspense, lazy } from 'react';

const LazyChart = lazy(async () => {
    const chartjs = await import('chart.js');
    chartjs.Chart.register(
        chartjs.CategoryScale,
        chartjs.LinearScale,
        chartjs.BarElement,
        chartjs.LineElement,
        chartjs.PointElement,
        chartjs.ArcElement,
        chartjs.Tooltip,
        chartjs.Legend,
        chartjs.Filler
    );
    const reactChart = await import('react-chartjs-2');

    return {
        default: function DynamicChart({ type, data, options }) {
            const Component = type === 'line' ? reactChart.Line : type === 'doughnut' ? reactChart.Doughnut : reactChart.Bar;
            return <Component data={data} options={options} />;
        },
    };
});

export default function Chart({ type = 'bar', data, options = {}, height = 220 }) {
    return (
        <div style={{ height }}>
            <Suspense
                fallback={
                    <div className="h-full grid place-items-center text-sm text-gray-400">Loading chart…</div>
                }
            >
                <LazyChart
                    type={type}
                    data={data}
                    options={{ responsive: true, maintainAspectRatio: false, ...options }}
                />
            </Suspense>
        </div>
    );
}
