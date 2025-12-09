"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
    Sheet,
    SheetContent,
    SheetHeader,
    SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    ArrowUpRight,
    ArrowDownRight,
    Check,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
    id: string;
    name: string;
    color: string;
    icon: string;
}

interface QuickAddSheetProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    categories: Category[];
}

export function QuickAddSheet({
    open,
    onOpenChange,
    categories,
}: QuickAddSheetProps) {
    const router = useRouter();
    const [type, setType] = useState<"expense" | "income">("expense");
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

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
                    categoryId: selectedCategory,
                    date: new Date().toISOString(),
                }),
            });

            if (response.ok) {
                // Reset form
                setAmount("");
                setDescription("");
                setSelectedCategory(null);
                setType("expense");
                onOpenChange(false);
                router.refresh();
            }
        } catch (error) {
            console.error("Error adding transaction:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleAmountChange = (value: string) => {
        // Only allow numbers and one decimal point
        const sanitized = value.replace(/[^0-9.]/g, "");
        const parts = sanitized.split(".");
        if (parts.length > 2) return;
        if (parts[1]?.length > 2) return;
        setAmount(sanitized);
    };

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="h-[85vh] rounded-t-3xl">
                <SheetHeader className="pb-6">
                    <SheetTitle className="text-2xl font-bold">Add Transaction</SheetTitle>
                </SheetHeader>

                <div className="space-y-6">
                    {/* Type Toggle */}
                    <div className="flex gap-2">
                        <Button
                            variant={type === "expense" ? "default" : "outline"}
                            onClick={() => setType("expense")}
                            className={cn(
                                "flex-1 h-12",
                                type === "expense" &&
                                "bg-red-500/20 text-red-400 border-red-500/50 hover:bg-red-500/30"
                            )}
                        >
                            <ArrowDownRight className="w-5 h-5 mr-2" />
                            Expense
                        </Button>
                        <Button
                            variant={type === "income" ? "default" : "outline"}
                            onClick={() => setType("income")}
                            className={cn(
                                "flex-1 h-12",
                                type === "income" &&
                                "bg-emerald-500/20 text-emerald-400 border-emerald-500/50 hover:bg-emerald-500/30"
                            )}
                        >
                            <ArrowUpRight className="w-5 h-5 mr-2" />
                            Income
                        </Button>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Amount</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-3xl font-bold text-muted-foreground">
                                $
                            </span>
                            <Input
                                type="text"
                                inputMode="decimal"
                                value={amount}
                                onChange={(e) => handleAmountChange(e.target.value)}
                                placeholder="0.00"
                                className="h-16 text-3xl font-bold pl-10 bg-accent border-0"
                            />
                        </div>
                    </div>

                    {/* Description Input */}
                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Description</label>
                        <Input
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="What was this for?"
                            className="h-12 bg-accent border-0"
                        />
                    </div>

                    {/* Category Selection */}
                    <div className="space-y-2">
                        <label className="text-sm text-muted-foreground">Category</label>
                        <div className="flex flex-wrap gap-2">
                            {categories.map((category) => (
                                <Badge
                                    key={category.id}
                                    variant="outline"
                                    onClick={() =>
                                        setSelectedCategory(
                                            selectedCategory === category.id ? null : category.id
                                        )
                                    }
                                    className={cn(
                                        "cursor-pointer px-3 py-1.5 text-sm transition-all",
                                        selectedCategory === category.id
                                            ? "ring-2 ring-offset-2 ring-offset-background"
                                            : "opacity-70 hover:opacity-100"
                                    )}
                                    style={{
                                        backgroundColor: `${category.color}20`,
                                        color: category.color,
                                        borderColor: category.color,
                                        ...(selectedCategory === category.id && {
                                            ringColor: category.color,
                                        }),
                                    }}
                                >
                                    {selectedCategory === category.id && (
                                        <Check className="w-3 h-3 mr-1" />
                                    )}
                                    {category.name}
                                </Badge>
                            ))}
                        </div>
                    </div>

                    {/* Submit Button */}
                    <Button
                        onClick={handleSubmit}
                        disabled={!amount || !description || isSubmitting}
                        className={cn(
                            "w-full h-14 text-lg font-semibold",
                            type === "expense"
                                ? "bg-red-500 hover:bg-red-600 text-white"
                                : "bg-emerald-500 hover:bg-emerald-600 text-white"
                        )}
                    >
                        {isSubmitting ? (
                            <Loader2 className="w-5 h-5 animate-spin" />
                        ) : (
                            <>
                                Add {type === "expense" ? "Expense" : "Income"}
                            </>
                        )}
                    </Button>
                </div>
            </SheetContent>
        </Sheet>
    );
}
