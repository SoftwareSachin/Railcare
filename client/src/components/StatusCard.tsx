interface StatusCardProps {
  title: string;
  value: string;
  trend?: number;
  subtitle?: string;
  color: string;
  icon: string;
}

export default function StatusCard({ title, value, trend, subtitle, color, icon }: StatusCardProps) {
  const getColorClasses = (color: string) => {
    const colorMap: Record<string, { border: string; bg: string; text: string }> = {
      'safe-green': { border: 'border-safe-green', bg: 'bg-safe-green', text: 'text-safe-green' },
      'alert-orange': { border: 'border-alert-orange', bg: 'bg-alert-orange', text: 'text-alert-orange' },
      'railway-blue': { border: 'border-railway-blue', bg: 'bg-railway-blue', text: 'text-railway-blue' },
      'danger-red': { border: 'border-danger-red', bg: 'bg-danger-red', text: 'text-danger-red' },
      'purple-600': { border: 'border-purple-600', bg: 'bg-purple-600', text: 'text-purple-600' },
    };
    return colorMap[color] || colorMap['railway-blue'];
  };

  const colors = getColorClasses(color);

  return (
    <div className={`bg-white rounded-lg shadow-sm p-6 border-l-4 ${colors.border}`}>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
          {trend !== undefined && (
            <p className={`text-sm mt-1 ${trend < 0 ? 'text-safe-green' : 'text-alert-orange'}`}>
              {trend < 0 ? '↓' : '↑'} {Math.abs(trend)}% from peak
            </p>
          )}
          {subtitle && (
            <p className={`text-sm mt-1 ${colors.text}`}>{subtitle}</p>
          )}
        </div>
        <div className={`w-12 h-12 ${colors.bg} bg-opacity-10 rounded-full flex items-center justify-center flex-shrink-0`}>
          <i className={`${icon} ${colors.text} text-xl`}></i>
        </div>
      </div>
    </div>
  );
}
