import { AVAILABLE_ICONS, TransactionType, useStore } from '@/src/store/useStore';
import dayjs from 'dayjs';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Icons from 'lucide-react-native';
import { CreditCard, Plus, Trash2, TrendingUp } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useMemo, useState } from 'react';
import { Alert, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const IconRenderer = ({ name, size = 20, color = 'currentColor', ...props }: any) => {
    const IconComponent = (Icons as any)[name.split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join('')] || Icons.HelpCircle;
    return <IconComponent size={size} color={color} {...props} />;
};

export default function TransactionsScreen() {
    const { transactions, categories, addTransaction, deleteTransaction, addCategory } = useStore();
    const [amount, setAmount] = useState('');
    const [description, setDescription] = useState('');
    const [type, setType] = useState<TransactionType>('EXPENSE');
    const [catId, setCatId] = useState(categories[0]?.id || '');
    const [isAdding, setIsAdding] = useState(false);
    const [showCatModal, setShowCatModal] = useState(false);

    const [newCatName, setNewCatName] = useState('');
    const [newCatIcon, setNewCatIcon] = useState(AVAILABLE_ICONS[0]);
    const [newCatColor, setNewCatColor] = useState('#3b82f6');

    const handleSave = () => {
        const parsedAmount = parseFloat(amount.replace(',', '.'));
        if (isNaN(parsedAmount) || parsedAmount <= 0) {
            Alert.alert('Erro', 'Insira um valor válido.');
            return;
        }
        if (!description) {
            Alert.alert('Erro', 'Insira uma descrição.');
            return;
        }

        addTransaction({
            amount: parsedAmount,
            description,
            type,
            categoryId: catId,
            date: new Date().toISOString()
        });

        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }

        setAmount('');
        setDescription('');
        setIsAdding(false);
    };

    const handleAddCategory = () => {
        if (!newCatName) return;
        addCategory({ name: newCatName, icon: newCatIcon, color: newCatColor });
        setNewCatName('');
        setShowCatModal(false);
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    };

    const totalVolume = useMemo(() => {
        return transactions.reduce((acc, t) => acc + t.amount, 0);
    }, [transactions]);

    const groupedTransactions = useMemo(() => {
        const groups: Record<string, typeof transactions> = {};
        transactions.forEach(tx => {
            const date = dayjs(tx.date).format('YYYY-MM-DD');
            if (!groups[date]) groups[date] = [];
            groups[date].push(tx);
        });
        return Object.entries(groups).sort((a, b) => b[0].localeCompare(a[0]));
    }, [transactions]);

    return (
        <SafeAreaView className="flex-1 bg-white dark:bg-[#050505]" edges={['top']}>
            {/* Header Dashboard - More rounded and harmonic */}
            <LinearGradient
                colors={['#3b82f6', '#2563eb', '#1d4ed8']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                className="mx-6 mt-4 p-8 rounded-[48px] shadow-2xl relative overflow-hidden"
            >
                <View className="absolute top-[-20] right-[-20] w-32 h-32 bg-white/10 rounded-full" />

                <View className="flex-row items-center mb-6">
                    <View className="bg-white/20 p-2 rounded-xl">
                        <TrendingUp color="white" size={16} />
                    </View>
                    <Text className="text-white/60 text-[10px] font-black uppercase ml-3 tracking-[2px]">Fluxo de Caixa</Text>
                </View>

                <View className="flex-row justify-between items-end">
                    <View>
                        <Text className="text-white text-3xl font-black italic tracking-tighter">
                            R$ {totalVolume.toLocaleString('pt-br', { minimumFractionDigits: 2 })}
                        </Text>
                        <Text className="text-white/40 text-[9px] font-bold uppercase mt-1">Volume total histórico</Text>
                    </View>

                    <TouchableOpacity
                        onPress={() => {
                            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
                            setIsAdding(!isAdding);
                        }}
                        className={`w-14 h-14 rounded-[24px] items-center justify-center shadow-lg ${isAdding ? 'bg-rose-500' : 'bg-white'}`}
                    >
                        <Plus color={isAdding ? 'white' : '#2563eb'} size={28} style={{ transform: [{ rotate: isAdding ? '45deg' : '0deg' }] }} />
                    </TouchableOpacity>
                </View>
            </LinearGradient>

            <ScrollView className="flex-1 mt-8" contentContainerClassName="pb-32" showsVerticalScrollIndicator={false}>

                {isAdding && (
                    <MotiView
                        from={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="mx-6 bg-gray-50 dark:bg-[#121212] p-8 rounded-[40px] mb-10 border border-gray-100 dark:border-white/5 shadow-sm"
                    >
                        <View className="flex-row bg-white dark:bg-[#1f1f1f] rounded-2xl p-1 mb-8 border border-gray-100 dark:border-white/5">
                            <TouchableOpacity
                                onPress={() => setType('INCOME')}
                                className={`flex-1 py-3.5 rounded-xl items-center ${type === 'INCOME' ? 'bg-emerald-500 shadow-lg' : ''}`}
                            >
                                <Text className={`font-black text-[10px] uppercase tracking-widest ${type === 'INCOME' ? 'text-white' : 'text-gray-400'}`}>Receita</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={() => setType('EXPENSE')}
                                className={`flex-1 py-3.5 rounded-xl items-center ${type === 'EXPENSE' ? 'bg-rose-500 shadow-lg' : ''}`}
                            >
                                <Text className={`font-black text-[10px] uppercase tracking-widest ${type === 'EXPENSE' ? 'text-white' : 'text-gray-400'}`}>Despesa</Text>
                            </TouchableOpacity>
                        </View>

                        <View className="items-center mb-8">
                            <Text className="text-[10px] text-gray-400 font-black uppercase tracking-widest mb-2">Valor do Lançamento</Text>
                            <TextInput
                                className="text-5xl font-black dark:text-white tracking-tighter"
                                placeholder="0,00"
                                placeholderTextColor="#cbd5e1"
                                keyboardType="numeric"
                                value={amount}
                                onChangeText={setAmount}
                                style={{ textAlign: 'center' }}
                            />
                        </View>

                        <TextInput
                            className="bg-white dark:bg-[#1f1f1f] rounded-[24px] p-5 mb-8 dark:text-white font-bold border border-gray-100 dark:border-white/5"
                            placeholder="Identificação (Ex: Supermercado)"
                            placeholderTextColor="#94a3b8"
                            value={description}
                            onChangeText={setDescription}
                        />

                        <View className="flex-row justify-between items-center mb-5 px-2">
                            <Text className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Categoria</Text>
                            <TouchableOpacity onPress={() => setShowCatModal(true)} className="bg-blue-50 dark:bg-blue-900/20 px-3 py-1.5 rounded-full">
                                <Text className="text-blue-600 dark:text-blue-400 font-bold text-[9px] uppercase">Nova</Text>
                            </TouchableOpacity>
                        </View>

                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-10 -mx-2">
                            {categories.map(cat => (
                                <TouchableOpacity
                                    key={cat.id}
                                    className={`mx-2 p-5 rounded-[28px] border-2 items-center justify-center min-w-[90px] ${catId === cat.id ? 'bg-white border-blue-500 shadow-xl shadow-blue-500/10' : 'bg-white dark:bg-[#1f1f1f] border-transparent'}`}
                                    onPress={() => setCatId(cat.id)}
                                >
                                    <View className="w-10 h-10 rounded-[18px] items-center justify-center mb-3" style={{ backgroundColor: `${cat.color}15` }}>
                                        <IconRenderer name={cat.icon} size={20} color={cat.color} />
                                    </View>
                                    <Text className={`text-[9px] font-black uppercase text-center ${catId === cat.id ? 'text-blue-600' : 'text-gray-400'}`}>
                                        {cat.name}
                                    </Text>
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <TouchableOpacity
                            className="bg-gray-900 dark:bg-blue-600 p-6 rounded-[28px] items-center shadow-2xl shadow-blue-500/20"
                            onPress={handleSave}
                        >
                            <Text className="text-white font-black text-base uppercase tracking-[2px]">Confirmar Lançamento</Text>
                        </TouchableOpacity>
                    </MotiView>
                )}

                {groupedTransactions.length === 0 ? (
                    <View className="py-24 items-center">
                        <View className="w-24 h-24 bg-gray-50 dark:bg-[#121212] rounded-[40px] items-center justify-center mb-6 border border-gray-100 dark:border-white/5 shadow-inner">
                            <CreditCard color="#cbd5e1" size={36} />
                        </View>
                        <Text className="text-gray-400 font-black text-[10px] uppercase tracking-[3px]">Extrato Inexistente</Text>
                    </View>
                ) : (
                    groupedTransactions.map(([date, txs]) => (
                        <View key={date} className="mb-10 px-6">
                            <Text className="mb-6 text-gray-400 text-[10px] font-black uppercase tracking-[3px] opacity-60">
                                {dayjs(date).format('DD [DE] MMMM')}
                            </Text>

                            {txs.map((tx, idx) => {
                                const cat = categories.find(c => c.id === tx.categoryId);
                                return (
                                    <MotiView
                                        key={tx.id}
                                        from={{ opacity: 0, scale: 0.95 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="bg-white dark:bg-[#121212] p-5 rounded-[36px] mb-4 flex-row items-center border border-gray-50 dark:border-white/5 shadow-xl shadow-black/5"
                                    >
                                        <View className="w-14 h-14 rounded-[22px] items-center justify-center mr-4 shadow-sm" style={{ backgroundColor: `${cat?.color || '#94a3b8'}15` }}>
                                            <IconRenderer name={cat?.icon || 'tag'} size={24} color={cat?.color || '#94a3b8'} />
                                        </View>
                                        <View className="flex-1">
                                            <Text className="font-bold text-base dark:text-white" numberOfLines={1}>{tx.description}</Text>
                                            <View className="flex-row items-center mt-1">
                                                <View className="w-1.5 h-1.5 rounded-full mr-1.5" style={{ backgroundColor: cat?.color || '#94a3b8' }} />
                                                <Text className="text-[10px] text-gray-400 font-black uppercase tracking-tight">{cat?.name || 'Outros'}</Text>
                                            </View>
                                        </View>
                                        <View className="items-end ml-4">
                                            <Text className={`font-black text-lg tracking-tighter ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-gray-900 dark:text-white'}`}>
                                                {tx.type === 'INCOME' ? '+' : '-'} R$ {tx.amount.toFixed(2)}
                                            </Text>
                                            <TouchableOpacity onPress={() => deleteTransaction(tx.id)} className="mt-3 p-2 bg-rose-50 dark:bg-rose-900/10 rounded-xl">
                                                <Trash2 color="#ef4444" size={12} />
                                            </TouchableOpacity>
                                        </View>
                                    </MotiView>
                                )
                            })}
                        </View>
                    ))
                )}
            </ScrollView>

            {/* Modal: New Category - Consistent with 'round' UI */}
            <Modal visible={showCatModal} animationType="slide" transparent>
                <View className="flex-1 justify-end bg-black/60">
                    <MotiView
                        from={{ translateY: 300 }}
                        animate={{ translateY: 0 }}
                        className="bg-white dark:bg-[#0a0a0a] rounded-t-[60px] p-10 pb-16 shadow-2xl"
                    >
                        <View className="w-12 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full self-center mb-8" />
                        <Text className="text-3xl font-black italic tracking-tighter mb-8 dark:text-white">Criar Categoria</Text>

                        <TextInput
                            className="bg-gray-50 dark:bg-[#121212] rounded-[24px] p-6 mb-8 dark:text-white font-bold border border-gray-100 dark:border-white/5"
                            placeholder="Nome da categoria"
                            placeholderTextColor="#94a3b8"
                            value={newCatName}
                            onChangeText={setNewCatName}
                        />

                        <Text className="text-[10px] font-black text-gray-400 uppercase mb-5 tracking-widest px-2">Selecione o Símbolo</Text>
                        <ScrollView horizontal showsHorizontalScrollIndicator={false} className="mb-10 -mx-2">
                            {AVAILABLE_ICONS.map(icon => (
                                <TouchableOpacity
                                    key={icon}
                                    onPress={() => setNewCatIcon(icon)}
                                    className={`w-16 h-16 rounded-[24px] items-center justify-center mx-2 ${newCatIcon === icon ? 'bg-blue-600 shadow-lg shadow-blue-500/30' : 'bg-gray-100 dark:bg-[#121212]'}`}
                                >
                                    <IconRenderer name={icon} size={28} color={newCatIcon === icon ? 'white' : '#94a3b8'} />
                                </TouchableOpacity>
                            ))}
                        </ScrollView>

                        <View className="flex-row gap-4">
                            <TouchableOpacity
                                onPress={() => setShowCatModal(false)}
                                className="flex-1 p-5 rounded-[24px] items-center"
                            >
                                <Text className="text-gray-400 font-black uppercase tracking-widest text-[10px]">Fechar</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                                onPress={handleAddCategory}
                                className="flex-[2] bg-blue-600 p-5 rounded-[24px] items-center shadow-2xl shadow-blue-500/20"
                            >
                                <Text className="text-white font-black uppercase tracking-widest text-[10px]">Cadastrar</Text>
                            </TouchableOpacity>
                        </View>
                    </MotiView>
                </View>
            </Modal>
        </SafeAreaView>
    );
}
