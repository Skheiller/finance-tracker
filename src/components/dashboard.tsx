"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Wallet,
    CreditCard,
    Landmark,
    PiggyBank,
    Plus,
    Minus,
    ArrowDownRight,
    ArrowUpRight,
    Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// MAD currency formatter
const formatMAD = (amount: number) => {
    return `${amount.toLocaleString("fr-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.م.`;
};

const accountIcons: Record<string, typeof Wallet> = {
    wallet: Wallet,
    credit: CreditCard,
    bank: Landmark,
    savings: PiggyBank,
};

interface Account {
    id: string;
    name: string;
    type: string;
    color: string;
    icon: string;
    balance: number;
    totalSpent: number;
    totalIncome: number;
    transactionCount: number;
}

interface Category {
    id: string;
    name: string;
    color: string;
    subcategories: { id: string; name: string }[];
}

interface Transaction {
    id: string;
    amount: number;
    description: string;
    date: string;
    type: string;
    category: { id: string; name: string; color: string } | null;
    subcategory: { id: string; name: string } | null;
    account: { id: string; name: string; color: string } | null;
}

interface DashboardData {
    accounts: Account[];
    totalExpenses: number;
    totalIncome: number;
    recentTransactions: Transaction[];
    categories: Category[];
}

export function DashboardClient({ data }: { data: DashboardData }) {
    const router = useRouter();

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header with Quick Add */}
            <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Dashboard</h1>
                    <p className="text-muted-foreground text-sm">
                        Track your expenses across accounts
                    </p>
                </div>
                <QuickAdd
                    accounts={data.accounts}
                    categories={data.categories}
                    onSuccess={() => router.refresh()}
                />
            </div>

            {/* Summary Cards */}
            <div className="grid gap-4 md:grid-cols-2">
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Expenses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold">
                            {formatMAD(data.totalExpenses)}
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="pb-2">
                        <CardTitle className="text-sm font-medium text-muted-foreground">
                            Total Income
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-semibold text-emerald-500">
                            {formatMAD(data.totalIncome)}
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Accounts */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium">Accounts</h2>
                    <Button variant="outline" size="sm" onClick={() => router.push("/accounts")}>
                        <Plus className="w-4 h-4 mr-1" />
                        Add Account
                    </Button>
                </div>

                {data.accounts.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No accounts yet. Add your first account to start tracking.
                        </CardContent>
                    </Card>
                ) : (
                    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {data.accounts.map((account) => {
                            const Icon = accountIcons[account.icon] || Wallet;
                            return (
                                <Card
                                    key={account.id}
                                    className="cursor-pointer hover:bg-accent/50 transition-colors"
                                    onClick={() => router.push(`/accounts/${account.id}`)}
                                >
                                    <CardContent className="pt-4">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div
                                                    className="w-10 h-10 rounded-lg flex items-center justify-center"
                                                    style={{ backgroundColor: `${account.color}20` }}
                                                >
                                                    <Icon className="w-5 h-5" style={{ color: account.color }} />
                                                </div>
                                                <div>
                                                    <p className="font-medium">{account.name}</p>
                                                    <p className="text-xs text-muted-foreground">
                                                        {account.transactionCount} transactions
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="mt-4 flex justify-between text-sm">
                                            <span className="text-muted-foreground">Spent</span>
                                            <span>{formatMAD(account.totalSpent)}</span>
                                        </div>
                                    </CardContent>
                                </Card>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Recent Transactions */}
            <div>
                <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-medium">Recent Transactions</h2>
                    <Button variant="ghost" size="sm" onClick={() => router.push("/journal")}>
                        View All
                    </Button>
                </div>

                {data.recentTransactions.length === 0 ? (
                    <Card>
                        <CardContent className="py-8 text-center text-muted-foreground">
                            No transactions yet. Use Quick Add above to record your first expense.
                        </CardContent>
                    </Card>
                ) : (
                    <Card>
                        <CardContent className="divide-y divide-border">
                            {data.recentTransactions.map((tx) => (
                                <div key={tx.id} className="py-3 flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className={cn(
                                            "w-8 h-8 rounded-full flex items-center justify-center",
                                            tx.type === "expense" ? "bg-zinc-800" : "bg-emerald-500/20"
                                        )}>
                                            {tx.type === "expense" ? (
                                                <ArrowDownRight className="w-4 h-4 text-zinc-400" />
                                            ) : (
                                                <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="text-sm font-medium">{tx.description}</p>
                                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                                <span>{format(new Date(tx.date), "MMM d")}</span>
                                                {tx.account && (
                                                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                                        {tx.account.name}
                                                    </Badge>
                                                )}
                                                {tx.category && (
                                                    <Badge
                                                        variant="outline"
                                                        className="text-[10px] px-1.5 py-0"
                                                        style={{ borderColor: tx.category.color, color: tx.category.color }}
                                                    >
                                                        {tx.category.name}
                                                    </Badge>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <span className={cn(
                                        "font-medium",
                                        tx.type === "expense" ? "text-foreground" : "text-emerald-500"
                                    )}>
                                        {tx.type === "expense" ? "-" : "+"}{formatMAD(tx.amount)}
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                )}
            </div>
        </div>
    );
}

// Compact inline Quick Add form
function QuickAdd({
    accounts,
    categories,
    onSuccess
}: {
    accounts: Account[];
    categories: Category[];
    onSuccess: () => void;
}) {
    const [isExpanded, setIsExpanded] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [accountId, setAccountId] = useState<string>("");
    const [categoryId, setCategoryId] = useState<string>("");
    const [type, setType] = useState<"expense" | "income">("expense");

    const handleSubmit = async () => {
        if (!amount || !description) return;

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/transactions", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    amount: parseFloat(amount),
                    description,
                    type,
                    accountId: accountId || null,
                    categoryId: categoryId || null,
                }),
            });

            if (response.ok) {
                setAmount("");
                setDescription("");
                setAccountId("");
                setCategoryId("");
                setIsExpanded(false);
                onSuccess();
            }
        } catch (error) {
            console.error("Error adding transaction:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isExpanded) {
        return (
            <Button
                onClick={() => setIsExpanded(true)}
                className="gap-2"
            >
                <Plus className="w-4 h-4" />
                Add Expense
            </Button>
        );
    }

    return (
        <Card className="w-full lg:w-auto lg:min-w-[400px]">
            <CardContent className="pt-4 space-y-3">
                {/* Type toggle */}
                <div className="flex gap-1 p-1 bg-muted rounded-md">
                    <button
                        onClick={() => setType("expense")}
                        className={cn(
                            "flex-1 py-1.5 text-sm rounded transition-colors",
                            type === "expense"
                                ? "bg-background shadow-sm"
                                : "text-muted-foreground"
                        )}
                    >
                        <Minus className="w-3 h-3 inline mr-1" />
                        Expense
                    </button>
                    <button
                        onClick={() => setType("income")}
                        className={cn(
                            "flex-1 py-1.5 text-sm rounded transition-colors",
                            type === "income"
                                ? "bg-background shadow-sm"
                                : "text-muted-foreground"
                        )}
                    >
                        <Plus className="w-3 h-3 inline mr-1" />
                        Income
                    </button>
                </div>

                {/* Amount */}
                <div className="relative">
                    <Input
                        type="number"
                        placeholder="0.00"
                        value={amount}
                        onChange={(e) => setAmount(e.target.value)}
                        className="text-xl font-medium pr-12"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                        د.م.
                    </span>
                </div>

                {/* Description */}
                <Input
                    placeholder="What was this for?"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                />

                {/* Account & Category row */}
                <div className="flex gap-2">
                    <Select value={accountId} onValueChange={setAccountId}>
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Account" />
                        </SelectTrigger>
                        <SelectContent>
                            {accounts.map((acc) => (
                                <SelectItem key={acc.id} value={acc.id}>
                                    {acc.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>

                    <Select value={categoryId} onValueChange={setCategoryId}>
                        <SelectTrigger className="flex-1">
                            <SelectValue placeholder="Category" />
                        </SelectTrigger>
                        <SelectContent>
                            {categories.map((cat) => (
                                <SelectItem key={cat.id} value={cat.id}>
                                    {cat.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                    <Button
                        variant="outline"
                        onClick={() => setIsExpanded(false)}
                        className="flex-1"
                    >
                        Cancel
                    </Button>
                    <Button
                        onClick={handleSubmit}
                        disabled={!amount || !description || isSubmitting}
                        className="flex-1"
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                            "Add"
                        )}
                    </Button>
                </div>
            </CardContent>
        </Card>
    );
}
