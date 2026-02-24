import { cancelSubscriptionNotification, requestNotificationPermissions } from '@/src/lib/notifications';
import { useStore } from '@/src/store/useStore';
import dayjs from 'dayjs';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import { Bell, Calendar, Clock, CreditCard, Trash2 } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useEffect, useMemo, useState } from 'react';
import { Alert, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SubscriptionsScreen() {
    const { subscriptions, addSubscription, deleteSubscription } = useStore();
    const [name, setName] = useState('');
    const [amount, setAmount] = useState('');
    const [dueDay, setDueDay] = useState('');
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        // Request permissions for local notifications
        requestNotificationPermissions().catch(err => {
            console.log("Notification Permission Error:", err);
        });
    }, []);

    const totalMonthly = useMemo(() => {
        return subscriptions.reduce((acc, sub) => acc + sub.amount, 0);
    }, [subscriptions]);

    const handleSave = async () => {
        const parsedAmount = parseFloat(amount.replace(',', '.'));
        const day = parseInt(dueDay);

        if (!name || isNaN(parsedAmount) || isNaN(day) || day < 1 || day > 31) {
            Alert.alert('Erro', 'Preencha os campos corretamente (Dia entre 1 e 31).');
            return;
        }

        // We use the day to schedule a recurring reminder for that day of the month
        // The store handles the call to scheduleSubscriptionNotification
        const dateStr = dayjs().set('date', day).format('YYYY-MM-DD');

        addSubscription({
            name,
            amount: parsedAmount,
            dueDate: dateStr,
            icon: 'bell',
            color: '#8b5cf6'
        });

        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        setName('');
        setAmount('');
        setDueDay('');
        setIsAdding(false);
        Alert.alert('Configurado', `Sua conta de ${name} agora tem lembretes automáticos.`);
    };

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-[#050505]" edges={['top']}>
            {/* Header Dashboard */}
            <LinearGradient
                colors={['#8b5cf6', '#7c3aed', '#6d28d9']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="mx-6 mt-4 p-8 rounded-[40px] shadow-2xl relative overflow-hidden"
            >
                {/* Visual Decoration */}
                <View className="absolute top-[-20] right-[-20] w-40 h-40 bg-white/10 rounded-full" />

                <View className="flex-row items-center mb-6">
                    <View className="bg-white/20 p-2 rounded-xl">
                        <CreditCard color="white" size={20} />
                    </View>
                    <Text className="text-white/60 text-[10px] font-black uppercase ml-3 tracking-[2px]">Custos Fixos</Text>
                </View>

                <View className="flex-row items-end">
                    <Text className="text-white text-4xl font-black italic tracking-tighter">R$ {totalMonthly.toLocaleString('pt-br', { minimumFractionDigits: 2 })}</Text>
                    <Text className="text-white/50 text-[10px] font-bold mb-2 ml-2">/MÊS</Text>
                </View>

                <View className="flex-row items-center mt-6 bg-black/10 self-start px-4 py-2 rounded-2xl">
                    <Clock color="white" size={12} opacity={0.6} />
                    <Text className="text-white/80 text-[10px] font-bold ml-2">{subscriptions.length} Assinaturas Ativas</Text>
                </View>
            </LinearGradient>

            <ScrollView contentContainerClassName="pb-32" showsVerticalScrollIndicator={false} className="mt-8">
                <View className="px-6">



                    <View className="flex-row justify-between items-end mb-6">
                        <View>
                            <Text className="text-xl font-black italic tracking-tighter dark:text-white">Gerenciamento</Text>
                            <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">Alertas e vencimentos</Text>
                        </View>
                        <TouchableOpacity
                            onPress={() => setIsAdding(!isAdding)}
                            className="bg-purple-600 px-5 py-2.5 rounded-2xl shadow-lg shadow-purple-600/20"
                        >
                            <Text className="text-white font-black text-[10px] uppercase">Nova Conta</Text>
                        </TouchableOpacity>
                    </View>

                    {isAdding && (
                        <MotiView
                            from={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-gray-50 dark:bg-[#121212] p-6 rounded-[32px] mb-8 border border-purple-100 dark:border-purple-900/10 shadow-sm"
                        >
                            <TextInput
                                className="bg-white dark:bg-[#1f1f1f] rounded-2xl p-5 mb-4 dark:text-white font-bold border border-gray-100 dark:border-white/5"
                                placeholder="Ex: Netflix, Internet, Aluguel"
                                placeholderTextColor="#9ca3af"
                                value={name}
                                onChangeText={setName}
                            />
                            <View className="flex-row mb-6">
                                <View className="flex-1 mr-2">
                                    <Text className="text-[10px] text-gray-400 font-bold uppercase ml-4 mb-2">Valor</Text>
                                    <TextInput
                                        className="bg-white dark:bg-[#1f1f1f] rounded-2xl p-5 dark:text-white font-black border border-gray-100 dark:border-white/5"
                                        placeholder="0,00"
                                        placeholderTextColor="#9ca3af"
                                        keyboardType="numeric"
                                        value={amount}
                                        onChangeText={setAmount}
                                    />
                                </View>
                                <View className="w-24">
                                    <Text className="text-[10px] text-gray-400 font-bold uppercase ml-4 mb-2">Dia</Text>
                                    <TextInput
                                        className="bg-white dark:bg-[#1f1f1f] rounded-2xl p-5 dark:text-white font-black text-center border border-gray-100 dark:border-white/5"
                                        placeholder="31"
                                        placeholderTextColor="#9ca3af"
                                        keyboardType="numeric"
                                        value={dueDay}
                                        onChangeText={setDueDay}
                                    />
                                </View>
                            </View>

                            <TouchableOpacity
                                onPress={handleSave}
                                className="bg-purple-600 p-5 rounded-2xl items-center shadow-lg"
                            >
                                <Text className="text-white font-black uppercase tracking-widest">Ativar Lembrete</Text>
                            </TouchableOpacity>
                        </MotiView>
                    )}

                    {subscriptions.length === 0 && !isAdding ? (
                        <View className="py-20 items-center">
                            <View className="w-20 h-20 bg-gray-50 dark:bg-[#121212] rounded-full items-center justify-center mb-6 border border-gray-50 dark:border-white/10">
                                <Calendar color="#9ca3af" size={32} />
                            </View>
                            <Text className="text-gray-400 font-bold text-xs uppercase tracking-widest">Nenhum vencimento agendado</Text>
                        </View>
                    ) : (
                        subscriptions.map((sub, index) => (
                            <MotiView
                                key={sub.id}
                                from={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: index * 100 }}
                                className="bg-white dark:bg-[#121212] p-6 rounded-[32px] mb-4 flex-row items-center border border-gray-50 dark:border-white/5 shadow-sm"
                            >
                                <View className="w-14 h-14 rounded-[22px] bg-purple-50 dark:bg-purple-900/20 items-center justify-center mr-4">
                                    <Bell color="#8b5cf6" size={24} />
                                </View>
                                <View className="flex-1">
                                    <Text className="font-bold text-base dark:text-white">{sub.name}</Text>
                                    <View className="flex-row items-center mt-2">
                                        <View className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md flex-row items-center">
                                            <Calendar size={10} color="#6b7280" />
                                            <Text className="text-[9px] text-gray-500 dark:text-gray-400 font-black ml-1 uppercase">Dia {dayjs(sub.dueDate).date()}</Text>
                                        </View>
                                        <View className="bg-emerald-50 dark:bg-emerald-900/20 px-2 py-0.5 rounded-md ml-2">
                                            <Text className="underline text-[8px] text-emerald-600 dark:text-emerald-400 font-black uppercase">Ativo</Text>
                                        </View>
                                    </View>
                                </View>
                                <View className="items-end">
                                    <Text className="font-black text-rose-500 text-lg">
                                        R$ {sub.amount.toFixed(2)}
                                    </Text>
                                    <TouchableOpacity
                                        className="mt-4 p-2 bg-rose-50 dark:bg-rose-900/10 rounded-xl"
                                        onPress={() => {
                                            Alert.alert('Remover', `Deseja parar de monitorar ${sub.name}?`, [
                                                { text: 'Cancelar', style: 'cancel' },
                                                {
                                                    text: 'Sim, Remover', style: 'destructive', onPress: () => {
                                                        deleteSubscription(sub.id);
                                                        cancelSubscriptionNotification(sub.id);
                                                        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
                                                    }
                                                }
                                            ]);
                                        }}
                                    >
                                        <Trash2 color="#ef4444" size={14} />
                                    </TouchableOpacity>
                                </View>
                            </MotiView>
                        ))
                    )}
                </View>

            </ScrollView>
        </SafeAreaView>
    );
}
