import CategoryChart from '@/src/components/CategoryChart';
import Thermometer from '@/src/components/Thermometer';
import { useStore } from '@/src/store/useStore';
import dayjs from 'dayjs';
import 'dayjs/locale/pt-br';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';
import * as Icons from 'lucide-react-native';
import { Bell, Eye, EyeOff, HelpCircle, TrendingDown, TrendingUp, Wallet } from 'lucide-react-native';
import { MotiView } from 'moti';
import React, { useMemo } from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

dayjs.locale('pt-br');

const IconRenderer = ({ name, size = 20, color = 'currentColor' }: any) => {
  const IconComponent = (Icons as any)[name.split('-').map((s: string) => s.charAt(0).toUpperCase() + s.slice(1)).join('')] || HelpCircle;
  return <IconComponent size={size} color={color} />;
};

export default function SummaryScreen() {
  const { transactions, subscriptions, categories } = useStore();
  const [showBalance, setShowBalance] = React.useState(true);

  const currentMonth = dayjs().startOf('month');

  const stats = useMemo(() => {
    let inc = 0;
    let exp = 0;

    const categoryTotals: Record<string, number> = {};

    transactions.forEach(tx => {
      if (dayjs(tx.date).isAfter(currentMonth)) {
        if (tx.type === 'INCOME') {
          inc += tx.amount;
        } else {
          exp += tx.amount;
          categoryTotals[tx.categoryId] = (categoryTotals[tx.categoryId] || 0) + tx.amount;
        }
      }
    });

    const subTotal = subscriptions.reduce((acc, sub) => acc + sub.amount, 0);
    const balance = inc - exp - subTotal;

    const chartData = Object.entries(categoryTotals).map(([id, value]) => {
      const cat = categories.find(c => c.id === id);
      return {
        name: cat?.name || 'Outros',
        value,
        color: cat?.color || '#94a3b8'
      };
    }).sort((a, b) => b.value - a.value);

    return {
      income: inc,
      expense: exp,
      projectedBalance: balance,
      chartData,
      recentTransactions: transactions.slice(0, 10).sort((a, b) => dayjs(b.date).diff(dayjs(a.date)))
    };
  }, [transactions, subscriptions, categories]);

  return (
    <SafeAreaView className="flex-1 bg-white dark:bg-[#050505]" edges={['top']}>
      <ScrollView contentContainerClassName="pb-32" showsVerticalScrollIndicator={false}>

        {/* Modern Header Section - More curved and better spacing */}
        <LinearGradient
          colors={['#10b981', '#059669', '#047857']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          className="px-6 pt-10 pb-16 rounded-b-[60px] shadow-2xl"
        >
          <View className="flex-row justify-between items-center mb-10">
            <View>
              <Text className="text-white/60 text-xs font-bold uppercase tracking-widest">Saldo Disponível</Text>
              <View className="flex-row items-center mt-1">
                <Text className="text-white text-4xl font-black">
                  {showBalance ? `R$ ${stats.projectedBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'R$ ••••••'}
                </Text>
                <TouchableOpacity
                  onPress={() => {
                    Haptics.selectionAsync();
                    setShowBalance(!showBalance);
                  }}
                  className="ml-4 bg-white/10 p-2 rounded-full"
                >
                  {showBalance ? <Eye size={18} color="white" /> : <EyeOff size={18} color="white" />}
                </TouchableOpacity>
              </View>
            </View>
            <TouchableOpacity className="bg-white/20 p-3 rounded-full border border-white/10">
              <Bell color="white" size={20} />
            </TouchableOpacity>
          </View>

          <View className="flex-row gap-x-3">
            <View className="flex-1 bg-white/10 rounded-[32px] p-5 border border-white/5 backdrop-blur-md">
              <TrendingUp color="#bef264" size={16} />
              <Text className="text-white/50 text-[9px] font-bold uppercase mt-2">Entradas</Text>
              <Text className="text-white font-bold text-base mt-0.5">R$ {stats.income.toLocaleString('pt-br')}</Text>
            </View>
            <View className="flex-1 bg-white/10 rounded-[32px] p-5 border border-white/5 backdrop-blur-md">
              <TrendingDown color="#fda4af" size={16} />
              <Text className="text-white/50 text-[9px] font-bold uppercase mt-2">Saídas</Text>
              <Text className="text-white font-bold text-base mt-0.5">R$ {stats.expense.toLocaleString('pt-br')}</Text>
            </View>
          </View>
        </LinearGradient>

        <View className="px-6 -mt-8">
          {/* Health Section - Redesigned Card with padding and margin fixes */}
          <MotiView
            from={{ opacity: 0, translateY: 30 }}
            animate={{ opacity: 1, translateY: 0 }}
            className="bg-white dark:bg-[#121212] rounded-[40px] p-6 shadow-2xl shadow-black/10 border border-gray-50 dark:border-white/5 mb-10 overflow-hidden"
          >
            <View className="flex-row justify-between items-center mb-4">
              <Text className="text-gray-400 font-black text-[10px] uppercase tracking-tighter">Medidor de Saúde</Text>
              <View className="bg-emerald-50 dark:bg-emerald-900/20 px-2.5 py-1 rounded-full">
                <Text className="text-emerald-600 dark:text-emerald-400 text-[8px] font-black uppercase">Tempo Real</Text>
              </View>
            </View>
            <Thermometer income={stats.income} expense={stats.expense} projectedBalance={stats.projectedBalance} />
          </MotiView>

          {/* Chart Section */}
          <View className="mb-12">
            <View className="flex-row justify-between items-end mb-6 px-2">
              <View>
                <Text className="text-2xl font-black italic tracking-tighter dark:text-gray-100">Distribuição</Text>
                <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Gastos agrupados</Text>
              </View>
              <TouchableOpacity className="bg-emerald-50 dark:bg-emerald-900/20 px-3 py-1.5 rounded-full">
                <Text className="text-emerald-500 font-black text-[10px] uppercase">Ajustar</Text>
              </TouchableOpacity>
            </View>
            <View className="bg-white dark:bg-[#121212] rounded-[40px] p-4 border border-gray-50 dark:border-white/5 shadow-xl shadow-black/5">
              <CategoryChart data={stats.chartData} />
            </View>
          </View>

          {/* Recent History */}
          <View className="mb-12">
            <View className="flex-row justify-between items-end mb-6 px-2">
              <View>
                <Text className="text-2xl font-black italic tracking-tighter dark:text-gray-100">Movimentações</Text>
                <Text className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Últimos históricos</Text>
              </View>
              <TouchableOpacity>
                <Text className="text-emerald-500 font-black text-[10px] uppercase">Ver Tudo</Text>
              </TouchableOpacity>
            </View>

            {stats.recentTransactions.length === 0 ? (
              <View className="bg-gray-50 dark:bg-[#121212] rounded-[40px] p-12 items-center border-2 border-dashed border-gray-100 dark:border-white/5">
                <Wallet color="#9ca3af" size={32} />
                <Text className="text-gray-400 mt-3 font-black text-[10px] uppercase tracking-[2px]">Buscando dados...</Text>
              </View>
            ) : (
              stats.recentTransactions.map((tx, index) => {
                const cat = categories.find(c => c.id === tx.categoryId);
                return (
                  <MotiView
                    key={tx.id}
                    from={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 50 }}
                    className="bg-white dark:bg-[#121212] rounded-[32px] p-5 mb-4 flex-row items-center justify-between border border-gray-50 dark:border-white/5 shadow-md shadow-black/5"
                  >
                    <View className="flex-row items-center flex-1">
                      <View className={`w-14 h-14 rounded-[22px] items-center justify-center mr-4 ${tx.type === 'INCOME' ? 'bg-emerald-50 dark:bg-emerald-900/20' : 'bg-rose-50 dark:bg-rose-900/20'}`}>
                        <IconRenderer name={cat?.icon || (tx.type === 'INCOME' ? 'trending-up' : 'trending-down')} size={24} color={tx.type === 'INCOME' ? '#10b981' : '#ef4444'} />
                      </View>
                      <View className="flex-1">
                        <Text className="font-bold dark:text-gray-200 text-base" numberOfLines={1}>{tx.description}</Text>
                        <Text className="text-[10px] text-gray-400 font-black uppercase tracking-tighter mt-1">{cat?.name || 'Outros'}</Text>
                      </View>
                    </View>
                    <View className="items-end ml-4">
                      <Text className={`font-black text-lg tracking-tighter ${tx.type === 'INCOME' ? 'text-emerald-500' : 'text-gray-900 dark:text-white'}`}>
                        {tx.type === 'INCOME' ? '+' : '-'} R$ {tx.amount.toLocaleString('pt-br', { minimumFractionDigits: 2 })}
                      </Text>
                      <View className="bg-gray-50 dark:bg-white/5 px-2 py-0.5 rounded-md mt-1">
                        <Text className="text-[8px] text-gray-400 font-bold uppercase">{dayjs(tx.date).format('DD MMM')}</Text>
                      </View>
                    </View>
                  </MotiView>
                )
              })
            )}
          </View>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}
