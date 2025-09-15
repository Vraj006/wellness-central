import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

interface BiometricData {
  _id: string;
  type: string;
  value: number;
  systolic?: number;
  diastolic?: number;
  unit: string;
  recordedAt: number;
}

interface BiometricChartProps {
  data: BiometricData[];
  type: string;
  title: string;
  color: string;
}

export function BiometricChart({ data, type, title, color }: BiometricChartProps) {
  const chartData = data
    .filter(d => d.type === type)
    .map(d => ({
      date: new Date(d.recordedAt).toLocaleDateString(),
      value: d.value,
      systolic: d.systolic,
      diastolic: d.diastolic,
    }))
    .reverse();

  const formatValue = (value: number) => {
    if (type === "bloodPressure" && chartData[0]?.systolic) {
      const item = chartData.find(d => d.value === value);
      return item ? `${item.systolic}/${item.diastolic}` : value;
    }
    return value;
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">{title}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <XAxis 
                  dataKey="date" 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  axisLine={false}
                  tickLine={false}
                  tick={{ fontSize: 12 }}
                />
                <Tooltip 
                  formatter={(value) => [formatValue(value as number), title]}
                  labelStyle={{ color: 'var(--foreground)' }}
                  contentStyle={{ 
                    backgroundColor: 'var(--background)',
                    border: '1px solid var(--border)',
                    borderRadius: '8px'
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="value"
                  stroke={color}
                  fill={color}
                  fillOpacity={0.1}
                  strokeWidth={2}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          {chartData.length > 0 && (
            <div className="flex items-center justify-between mt-4 text-sm">
              <span className="text-muted-foreground">Latest</span>
              <span className="font-medium">
                {formatValue(chartData[chartData.length - 1]?.value)} {data[0]?.unit}
              </span>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
