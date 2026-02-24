import { scheduleSubscriptionNotification } from '@/src/lib/notifications';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 10);
}

export type TransactionType = 'INCOME' | 'EXPENSE';

export interface Category {
    id: string;
    name: string;
    icon: string; // Lucide icon name
    color: string;
}

export interface Transaction {
    id: string;
    amount: number;
    type: TransactionType;
    categoryId: string;
    date: string;
    description: string;
}

export interface Subscription {
    id: string;
    name: string;
    amount: number;
    dueDate: string;
    icon: string;
    color: string;
}

export const AVAILABLE_ICONS = [
    'shopping-cart', 'coffee', 'car', 'home', 'heart', 'briefcase',
    'utensils', 'film', 'gamepad-2', 'gift', 'plane', 'dumbbell',
    'zap', 'tv', 'music', 'smartphone'
];

export const DEFAULT_CATEGORIES: Category[] = [
    { id: '1', name: 'Alimentação', icon: 'utensils', color: '#f59e0b' },
    { id: '2', name: 'Transporte', icon: 'car', color: '#3b82f6' },
    { id: '3', name: 'Lazer', icon: 'gamepad-2', color: '#8b5cf6' },
    { id: '4', name: 'Moradia', icon: 'home', color: '#ef4444' },
    { id: '5', name: 'Salário', icon: 'briefcase', color: '#10b981' },
];

interface StoreState {
    transactions: Transaction[];
    subscriptions: Subscription[];
    categories: Category[];
    addTransaction: (tx: Omit<Transaction, 'id'>) => void;
    deleteTransaction: (id: string) => void;
    addSubscription: (sub: Omit<Subscription, 'id'>) => void;
    deleteSubscription: (id: string) => void;
    addCategory: (cat: Omit<Category, 'id'>) => void;
    deleteCategory: (id: string) => void;
}

export const useStore = create<StoreState>()(
    persist(
        (set) => ({
            transactions: [],
            subscriptions: [],
            categories: DEFAULT_CATEGORIES,

            addTransaction: (tx) =>
                set((state) => ({
                    transactions: [{ ...tx, id: generateId() }, ...state.transactions],
                })),

            deleteTransaction: (id) =>
                set((state) => ({
                    transactions: state.transactions.filter((t) => t.id !== id),
                })),

            addSubscription: (sub) => {
                const id = generateId();
                set((state) => ({
                    subscriptions: [{ ...sub, id }, ...state.subscriptions],
                }));
                scheduleSubscriptionNotification(id, sub.name, sub.dueDate).catch(e => console.log('Notification error:', e));
            },

            deleteSubscription: (id) =>
                set((state) => ({
                    subscriptions: state.subscriptions.filter((s) => s.id !== id),
                })),

            addCategory: (cat) =>
                set((state) => ({
                    categories: [...state.categories, { ...cat, id: generateId() }],
                })),

            deleteCategory: (id) =>
                set((state) => ({
                    categories: state.categories.filter((c) => c.id !== id),
                })),
        }),
        {
            name: 'finansys-storage-v2', // bumped version to avoid conflicts with old schema
            storage: createJSONStorage(() => AsyncStorage),
        }
    )
);
