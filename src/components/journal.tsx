"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
    ArrowDownRight,
    ArrowUpRight,
    MoreVertical,
    Trash2,
    Search,
    Filter,
    Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

// MAD currency formatter
const formatMAD = (amount: number) => {
    return `${amount.toLocaleString("fr-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.م.`;
};

interface Transaction {
    id: string;
    amount: number;
    description: string;
    date: string;
    type: string;
    notes: string | null;
    category: { id: string; name: string; color: string } | null;
    subcategory: { id: string; name: string } | null;
    account: { id: string; name: string; color: string } | null;
}

interface Category {
    id: string;
    name: string;
    color: string;
    subcategories: { id: string; name: string }[];
}

interface Account {
    id: string;
    name: string;
    color: string;
}

interface JournalData {
    transactions: Transaction[];
    categories: Category[];
    accounts: Account[];
}

export function JournalClient({ data }: { data: JournalData }) {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [filterType, setFilterType] = useState<"all" | "income" | "expense">("all");
    const [filterAccount, setFilterAccount] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState<string | null>(null);

    // Filter transactions
    const filteredTransactions = data.transactions.filter((t) => {
        const matchesSearch = t.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesType = filterType === "all" || t.type === filterType;
        const matchesAccount = !filterAccount || t.account?.id === filterAccount;
        return matchesSearch && matchesType && matchesAccount;
    });

    // Group transactions by date
    const groupedTransactions = filteredTransactions.reduce((groups, transaction) => {
        const date = format(new Date(transaction.date), "yyyy-MM-dd");
        if (!groups[date]) {
            groups[date] = [];
        }
        groups[date].push(transaction);
        return groups;
    }, {} as Record<string, Transaction[]>);

    const handleDelete = async (id: string) => {
        setIsDeleting(id);
        try {
            const response = await fetch(`/api/transactions/${id}`, {
                method: "DELETE",
            });
            if (response.ok) {
                router.refresh();
            }
        } catch (error) {
            console.error("Error deleting transaction:", error);
        } finally {
            setIsDeleting(null);
        }
    };

    // Calculate totals
    const totalExpenses = filteredTransactions
        .filter(t => t.type === "expense")
        .reduce((sum, t) => sum + t.amount, 0);

    const totalIncome = filteredTransactions
        .filter(t => t.type === "income")
        .reduce((sum, t) => sum + t.amount, 0);

    return (
        <div className="space-y-6 pb-20 lg:pb-0">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">Journal</h1>
                <p className="text-sm text-muted-foreground">
                    All your transactions in one place
                </p>
            </div>

            {/* Summary */}
            <div className="grid gap-3 grid-cols-2">
                <Card>
                    <CardContent className="pt-4">
                        <p className="text-xs text-muted-foreground mb-1">Total Expenses</p>
                        <p className="text-lg font-semibold">{formatMAD(totalExpenses)}</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-4">
                        <p className="text-xs text-muted-foreground mb-1">Total Income</p>
                        <p className="text-lg font-semibold text-emerald-500">{formatMAD(totalIncome)}</p>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="pt-4">
                    <div className="flex flex-col sm:flex-row gap-3">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                            <Input
                                placeholder="Search transactions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-9"
                            />
                        </div>
                        <div className="flex gap-2">
                            <Button
                                variant={filterType === "all" ? "secondary" : "outline"}
                                onClick={() => setFilterType("all")}
                                size="sm"
                            >
                                All
                            </Button>
                            <Button
                                variant={filterType === "expense" ? "secondary" : "outline"}
                                onClick={() => setFilterType("expense")}
                                size="sm"
                            >
                                Expenses
                            </Button>
                            <Button
                                variant={filterType === "income" ? "secondary" : "outline"}
                                onClick={() => setFilterType("income")}
                                size="sm"
                            >
                                Income
                            </Button>
                        </div>
                    </div>

                    {/* Account filter pills */}
                    {data.accounts.length > 0 && (
                        <div className="flex gap-2 mt-3 flex-wrap">
                            <Button
                                variant={!filterAccount ? "secondary" : "outline"}
                                onClick={() => setFilterAccount(null)}
                                size="sm"
                                className="h-7 text-xs"
                            >
                                All Accounts
                            </Button>
                            {data.accounts.map((account) => (
                                <Button
                                    key={account.id}
                                    variant={filterAccount === account.id ? "secondary" : "outline"}
                                    onClick={() => setFilterAccount(account.id)}
                                    size="sm"
                                    className="h-7 text-xs"
                                >
                                    {account.name}
                                </Button>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* Transaction List */}
            <div className="space-y-4">
                {Object.keys(groupedTransactions).length === 0 ? (
                    <Card>
                        <CardContent className="py-12 text-center">
                            <p className="text-muted-foreground">
                                {searchQuery || filterType !== "all" || filterAccount
                                    ? "No transactions match your filters"
                                    : "No transactions yet. Add your first expense from the dashboard."}
                            </p>
                        </CardContent>
                    </Card>
                ) : (
                    Object.entries(groupedTransactions).map(([date, transactions]) => (
                        <Card key={date}>
                            <CardHeader className="py-3 px-4">
                                <CardTitle className="text-sm font-medium text-muted-foreground">
                                    {format(new Date(date), "EEEE, MMMM d, yyyy")}
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="p-0">
                                {transactions.map((transaction, idx) => (
                                    <div
                                        key={transaction.id}
                                        className={cn(
                                            "flex items-center justify-between px-4 py-3 hover:bg-accent/50 group",
                                            idx !== transactions.length - 1 && "border-b border-border"
                                        )}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className={cn(
                                                    "w-8 h-8 rounded-full flex items-center justify-center",
                                                    transaction.type === "expense" ? "bg-zinc-800" : "bg-emerald-500/20"
                                                )}
                                            >
                                                {transaction.type === "expense" ? (
                                                    <ArrowDownRight className="w-4 h-4 text-zinc-400" />
                                                ) : (
                                                    <ArrowUpRight className="w-4 h-4 text-emerald-500" />
                                                )}
                                            </div>
                                            <div>
                                                <p className="text-sm font-medium">{transaction.description}</p>
                                                <div className="flex items-center gap-1.5 flex-wrap">
                                                    {transaction.account && (
                                                        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4">
                                                            {transaction.account.name}
                                                        </Badge>
                                                    )}
                                                    {transaction.category && (
                                                        <Badge
                                                            variant="outline"
                                                            className="text-[10px] px-1.5 py-0 h-4"
                                                            style={{ borderColor: transaction.category.color, color: transaction.category.color }}
                                                        >
                                                            {transaction.category.name}
                                                            {transaction.subcategory && ` › ${transaction.subcategory.name}`}
                                                        </Badge>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2">
                                            <span
                                                className={cn(
                                                    "font-medium text-sm",
                                                    transaction.type === "income" && "text-emerald-500"
                                                )}
                                            >
                                                {transaction.type === "expense" ? "-" : "+"}
                                                {formatMAD(transaction.amount)}
                                            </span>

                                            <DropdownMenu>
                                                <DropdownMenuTrigger asChild>
                                                    <Button
                                                        variant="ghost"
                                                        size="icon"
                                                        className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <MoreVertical className="w-4 h-4" />
                                                    </Button>
                                                </DropdownMenuTrigger>
                                                <DropdownMenuContent align="end">
                                                    <DropdownMenuItem
                                                        onClick={() => handleDelete(transaction.id)}
                                                        className="text-red-500 focus:text-red-500"
                                                    >
                                                        {isDeleting === transaction.id ? (
                                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                        ) : (
                                                            <Trash2 className="w-4 h-4 mr-2" />
                                                        )}
                                                        Delete
                                                    </DropdownMenuItem>
                                                </DropdownMenuContent>
                                            </DropdownMenu>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    ))
                )}
            </div>
        </div>
    );
}
