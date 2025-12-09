import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface Transaction {
    id: string;
    amount: number;
    description: string;
    date: string;
    type: "income" | "expense";
    categoryId: string | null;
    isRecurring: boolean;
    notes: string | null;
}

export interface Category {
    id: string;
    name: string;
    color: string;
    icon: string;
    budget: number | null;
}

interface FinanceState {
    transactions: Transaction[];
    categories: Category[];
    isLoading: boolean;
    error: string | null;

    // Actions
    setTransactions: (transactions: Transaction[]) => void;
    setCategories: (categories: Category[]) => void;
    addTransaction: (transaction: Transaction) => void;
    updateTransaction: (id: string, data: Partial<Transaction>) => void;
    deleteTransaction: (id: string) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useFinanceStore = create<FinanceState>()(
    persist(
        (set) => ({
            transactions: [],
            categories: [],
            isLoading: false,
            error: null,

            setTransactions: (transactions) => set({ transactions }),
            setCategories: (categories) => set({ categories }),
            addTransaction: (transaction) =>
                set((state) => ({
                    transactions: [transaction, ...state.transactions],
                })),
            updateTransaction: (id, data) =>
                set((state) => ({
                    transactions: state.transactions.map((t) =>
                        t.id === id ? { ...t, ...data } : t
                    ),
                })),
            deleteTransaction: (id) =>
                set((state) => ({
                    transactions: state.transactions.filter((t) => t.id !== id),
                })),
            setLoading: (isLoading) => set({ isLoading }),
            setError: (error) => set({ error }),
        }),
        {
            name: "titan-finance-storage",
            partialize: (state) => ({
                categories: state.categories,
            }),
        }
    )
);
