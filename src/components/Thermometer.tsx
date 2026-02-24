import React, { useEffect } from 'react';
import { Text, View } from 'react-native';
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated';
import Svg, { Defs, LinearGradient, Path, Stop } from 'react-native-svg';

interface ThermometerProps {
    income: number;
    expense: number;
    projectedBalance: number;
}

export default function Thermometer({ income, expense, projectedBalance }: ThermometerProps) {
    // Health logic: 1.0 (Green/Right) -> Expense is 0, 0.0 (Red/Left) -> Expense >= income
    const health = income === 0 ? (expense > 0 ? 0 : 0.5) : Math.max(0, 1 - (expense / income));

    const sv = useSharedValue(0.5);

    useEffect(() => {
        sv.value = withSpring(health, { damping: 15, stiffness: 60 });
    }, [health]);

    const size = 260;
    const strokeWidth = 18;
    const radius = size / 2 - 40;
    const center = size / 2;

    // Arc path: from Left to Right (top semi-circle)
    const arcPath = `M ${center - radius} ${center} A ${radius} ${radius} 0 0 1 ${center + radius} ${center}`;

    const needleStyle = useAnimatedStyle(() => {
        // Map health [0..1] to rotation [-90deg .. 90deg]
        const rotation = (sv.value * 180) - 180;
        return {
            transform: [
                { rotate: `${rotation}deg` }
            ]
        };
    });

    const getColor = (val: number) => {
        if (val < 0.25) return '#f43f5e'; // Red
        if (val < 0.6) return '#f59e0b'; // Amber
        return '#10b981'; // Green
    };

    return (
        <View className="items-center justify-center py-6">
            <View className="items-center justify-center" style={{ width: size, height: size / 2 + 40 }}>
                <Svg width={size} height={size / 2 + 20}>
                    <Defs>
                        <LinearGradient id="gaugeGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <Stop offset="0%" stopColor="#f43f5e" />
                            <Stop offset="50%" stopColor="#f59e0b" />
                            <Stop offset="100%" stopColor="#10b981" />
                        </LinearGradient>
                    </Defs>
                    {/* Background track */}
                    <Path
                        d={arcPath}
                        stroke="#f1f5f9"
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                    />
                    {/* Colored track */}
                    <Path
                        d={arcPath}
                        stroke="url(#gaugeGradient)"
                        strokeWidth={strokeWidth}
                        fill="none"
                        strokeLinecap="round"
                        opacity={0.8}
                    />
                </Svg>

                {/* THE NEEDLE / INDICATOR (Like a car speedometer) */}
                <Animated.View
                    style={[
                        {
                            position: 'absolute',
                            bottom: 20, // Align with the center of the SVG
                            width: 2,
                            height: radius + 20,
                            alignItems: 'center',
                            justifyContent: 'flex-start',
                        },
                        needleStyle
                    ]}
                >
                    {/* The Needle Body */}
                    <View
                        style={{
                            width: 6,
                            height: radius,
                            backgroundColor: '#1e293b',
                            borderRadius: 4,
                            marginTop: 0
                        }}
                        className="dark:bg-gray-100"
                    />
                    {/* The Arrow Head / Seta */}
                    <View
                        style={{
                            width: 0,
                            height: 0,
                            backgroundColor: 'transparent',
                            borderStyle: 'solid',
                            borderLeftWidth: 8,
                            borderRightWidth: 8,
                            borderBottomWidth: 15,
                            borderLeftColor: 'transparent',
                            borderRightColor: 'transparent',
                            borderBottomColor: '#1e293b',
                            marginTop: -5,
                            transform: [{ rotate: '0deg' }]
                        }}
                        className="dark:border-b-gray-100"
                    />
                </Animated.View>

                {/* Needle Hub (Center point) */}
                <View
                    style={{
                        position: 'absolute',
                        bottom: 8,
                        width: 24,
                        height: 24,
                        borderRadius: 12,
                        backgroundColor: '#1e293b',
                        borderWidth: 4,
                        borderColor: 'white',
                        elevation: 5,
                        shadowColor: '#000',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.25,
                        shadowRadius: 3.84,
                    }}
                    className="dark:bg-gray-100 dark:borderColor-[#121212]"
                />

                <View className="mt-6 items-center">
                    <Text className="text-[10px] text-gray-400 font-black uppercase tracking-[3px] mb-1">Status Global</Text>
                    <View className="flex-row items-center">
                        <View className="w-2.5 h-2.5 rounded-full mr-2" style={{ backgroundColor: getColor(health) }} />
                        <Text className="text-2xl font-black italic tracking-tighter" style={{ color: getColor(health) }}>
                            {health < 0.25 ? 'CRÍTICO' : health < 0.6 ? 'EQUILIBRADO' : 'SAUDÁVEL'}
                        </Text>
                    </View>
                </View>
            </View>
        </View>
    );
}
