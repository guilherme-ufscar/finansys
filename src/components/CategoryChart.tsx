import React from 'react';
import { Text, View } from 'react-native';
import Svg, { Circle, G } from 'react-native-svg';

interface DataItem {
    name: string;
    value: number;
    color: string;
}

interface CategoryChartProps {
    data: DataItem[];
}

export default function CategoryChart({ data }: CategoryChartProps) {
    const total = data.reduce((sum, item) => sum + item.value, 0);
    const size = 180;
    const strokeWidth = 25;
    const radius = (size - strokeWidth) / 2;
    const center = size / 2;
    const circumference = 2 * Math.PI * radius;

    let currentAlpha = 0;

    if (total === 0) {
        return (
            <View className="items-center justify-center p-4">
                <View className="w-40 h-40 rounded-full border-4 border-gray-100 dark:border-gray-800 items-center justify-center">
                    <Text className="text-gray-400 text-sm">Sem dados</Text>
                </View>
            </View>
        );
    }

    return (
        <View className="flex-row items-center justify-between p-4">
            <View>
                <Svg width={size} height={size}>
                    <G rotation="-90" origin={`${center}, ${center}`}>
                        {data.map((item, index) => {
                            const percentage = item.value / total;
                            const strokeDashoffset = circumference - percentage * circumference;
                            const rotation = currentAlpha * 360;
                            currentAlpha += percentage;

                            return (
                                <Circle
                                    key={index}
                                    cx={center}
                                    cy={center}
                                    r={radius}
                                    stroke={item.color}
                                    strokeWidth={strokeWidth}
                                    strokeDasharray={`${circumference} ${circumference}`}
                                    strokeDashoffset={strokeDashoffset}
                                    strokeLinecap="round"
                                    fill="transparent"
                                    transform={`rotate(${rotation}, ${center}, ${center})`}
                                />
                            );
                        })}
                    </G>
                </Svg>
                <View className="absolute inset-0 items-center justify-center">
                    <Text className="text-xs text-gray-400 font-medium">Total</Text>
                    <Text className="text-lg font-bold dark:text-white">
                        R$ {total.toFixed(0)}
                    </Text>
                </View>
            </View>

            <View className="flex-1 ml-6">
                {data.slice(0, 4).map((item, index) => (
                    <View key={index} className="flex-row items-center mb-2">
                        <View className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: item.color }} />
                        <View className="flex-1">
                            <Text className="text-xs text-gray-500 dark:text-gray-400 font-medium" numberOfLines={1}>
                                {item.name}
                            </Text>
                            <Text className="text-sm font-bold dark:text-gray-200">
                                {((item.value / total) * 100).toFixed(0)}%
                            </Text>
                        </View>
                    </View>
                ))}
            </View>
        </View>
    );
}
