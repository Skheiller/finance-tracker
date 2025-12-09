"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
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
    Loader2,
} from "lucide-react";

// MAD currency formatter
const formatMAD = (amount: number) => {
    return `${amount.toLocaleString("fr-MA", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} د.م.`;
};

const accountTypes = [
    { value: "bank", label: "Bank Account", icon: Landmark },
    { value: "cash", label: "Cash", icon: Wallet },
    { value: "savings", label: "Savings", icon: PiggyBank },
    { value: "credit", label: "Credit Card", icon: CreditCard },
    { value: "custom", label: "Other", icon: Wallet },
];

const accountColors = [
    "#71717a", // zinc
    "#3b82f6", // blue
    "#10b981", // emerald
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#ec4899", // pink
];

interface Account {
    id: string;
    name: string;
    type: string;
    color: string;
    icon: string;
    balance: number;
    isDefault: boolean;
    recentTransactions: {
        id: string;
        amount: number;
        description: string;
        date: string;
        type: string;
    }[];
}

interface AccountsData {
    accounts: Account[];
}

export function AccountsClient({ data }: { data: AccountsData }) {
    const router = useRouter();
    const [isAddOpen, setIsAddOpen] = useState(false);

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Accounts</h1>
                    <p className="text-sm text-muted-foreground">
                        Manage where your money is allocated
                    </p>
                </div>
                <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Account
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Account</DialogTitle>
                        </DialogHeader>
                        <AddAccountForm onSuccess={() => { setIsAddOpen(false); router.refresh(); }} />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Accounts Grid */}
            {data.accounts.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground mb-4">
                            No accounts yet. Add your first account to start tracking where your money goes.
                        </p>
                        <Button onClick={() => setIsAddOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Account
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {data.accounts.map((account) => {
                        const typeInfo = accountTypes.find(t => t.value === account.type) || accountTypes[4];
                        const Icon = typeInfo.icon;

                        const totalSpent = account.recentTransactions
                            .filter(t => t.type === "expense")
                            .reduce((sum, t) => sum + t.amount, 0);

                        return (
                            <Card
                                key={account.id}
                                className="cursor-pointer hover:bg-accent/50 transition-colors"
                                onClick={() => router.push(`/journal?account=${account.id}`)}
                            >
                                <CardHeader className="pb-2">
                                    <div className="flex items-center gap-3">
                                        <div
                                            className="w-10 h-10 rounded-lg flex items-center justify-center"
                                            style={{ backgroundColor: `${account.color}20` }}
                                        >
                                            <Icon className="w-5 h-5" style={{ color: account.color }} />
                                        </div>
                                        <div>
                                            <CardTitle className="text-base">{account.name}</CardTitle>
                                            <p className="text-xs text-muted-foreground">{typeInfo.label}</p>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Recent spending</span>
                                            <span>{formatMAD(totalSpent)}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-muted-foreground">Transactions</span>
                                            <span>{account.recentTransactions.length}</span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            )}
        </div>
    );
}

function AddAccountForm({ onSuccess }: { onSuccess: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [name, setName] = useState("");
    const [type, setType] = useState("bank");
    const [color, setColor] = useState(accountColors[0]);

    const handleSubmit = async () => {
        if (!name) return;

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/accounts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, type, color }),
            });

            if (response.ok) {
                onSuccess();
            }
        } catch (error) {
            console.error("Error creating account:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 pt-2">
            <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                    placeholder="e.g., CIH Bank, Cash..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Type</label>
                <Select value={type} onValueChange={setType}>
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        {accountTypes.map((t) => (
                            <SelectItem key={t.value} value={t.value}>
                                {t.label}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="flex gap-2">
                    {accountColors.map((c) => (
                        <button
                            key={c}
                            onClick={() => setColor(c)}
                            className={`w-8 h-8 rounded-full transition-all ${color === c ? "ring-2 ring-offset-2 ring-offset-background" : ""
                                }`}
                            style={{ backgroundColor: c }}
                        />
                    ))}
                </div>
            </div>

            <Button
                onClick={handleSubmit}
                disabled={!name || isSubmitting}
                className="w-full"
            >
                {isSubmitting ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                    "Create Account"
                )}
            </Button>
        </div>
    );
}
