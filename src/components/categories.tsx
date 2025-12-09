"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from "@/components/ui/accordion";
import { Plus, Tag, Loader2, ChevronRight } from "lucide-react";

const categoryColors = [
    "#71717a", // zinc
    "#3b82f6", // blue
    "#10b981", // emerald
    "#f59e0b", // amber
    "#ef4444", // red
    "#8b5cf6", // violet
    "#ec4899", // pink
    "#06b6d4", // cyan
];

interface Subcategory {
    id: string;
    name: string;
}

interface Category {
    id: string;
    name: string;
    color: string;
    icon: string;
    budget: number | null;
    transactionCount: number;
    subcategories: Subcategory[];
}

interface CategoriesData {
    categories: Category[];
}

export function CategoriesClient({ data }: { data: CategoriesData }) {
    const router = useRouter();
    const [isAddCategoryOpen, setIsAddCategoryOpen] = useState(false);
    const [addingSubcategoryTo, setAddingSubcategoryTo] = useState<string | null>(null);
    const [newSubcategoryName, setNewSubcategoryName] = useState("");
    const [isSubmittingSubcategory, setIsSubmittingSubcategory] = useState(false);

    const handleAddSubcategory = async (categoryId: string) => {
        if (!newSubcategoryName) return;

        setIsSubmittingSubcategory(true);
        try {
            const response = await fetch("/api/subcategories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name: newSubcategoryName, categoryId }),
            });

            if (response.ok) {
                setNewSubcategoryName("");
                setAddingSubcategoryTo(null);
                router.refresh();
            }
        } catch (error) {
            console.error("Error adding subcategory:", error);
        } finally {
            setIsSubmittingSubcategory(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">Categories</h1>
                    <p className="text-sm text-muted-foreground">
                        Organize your spending with categories and subcategories
                    </p>
                </div>
                <Dialog open={isAddCategoryOpen} onOpenChange={setIsAddCategoryOpen}>
                    <DialogTrigger asChild>
                        <Button>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Category
                        </Button>
                    </DialogTrigger>
                    <DialogContent>
                        <DialogHeader>
                            <DialogTitle>Add Category</DialogTitle>
                        </DialogHeader>
                        <AddCategoryForm onSuccess={() => { setIsAddCategoryOpen(false); router.refresh(); }} />
                    </DialogContent>
                </Dialog>
            </div>

            {/* Categories List */}
            {data.categories.length === 0 ? (
                <Card>
                    <CardContent className="py-12 text-center">
                        <p className="text-muted-foreground mb-4">
                            No categories yet. Add your first category to organize your spending.
                        </p>
                        <Button onClick={() => setIsAddCategoryOpen(true)}>
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Category
                        </Button>
                    </CardContent>
                </Card>
            ) : (
                <Card>
                    <CardContent className="p-0">
                        <Accordion type="multiple" className="w-full">
                            {data.categories.map((category) => (
                                <AccordionItem key={category.id} value={category.id}>
                                    <AccordionTrigger className="px-4 hover:no-underline hover:bg-accent/50">
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-md flex items-center justify-center"
                                                style={{ backgroundColor: `${category.color}20` }}
                                            >
                                                <Tag className="w-4 h-4" style={{ color: category.color }} />
                                            </div>
                                            <div className="text-left">
                                                <p className="font-medium">{category.name}</p>
                                                <p className="text-xs text-muted-foreground">
                                                    {category.subcategories.length} subcategories · {category.transactionCount} transactions
                                                </p>
                                            </div>
                                        </div>
                                    </AccordionTrigger>
                                    <AccordionContent className="px-4 pb-4">
                                        <div className="ml-11 space-y-2">
                                            {/* Subcategories */}
                                            {category.subcategories.map((sub) => (
                                                <div
                                                    key={sub.id}
                                                    className="flex items-center gap-2 py-2 px-3 rounded-md hover:bg-accent/50"
                                                >
                                                    <ChevronRight className="w-3 h-3 text-muted-foreground" />
                                                    <span className="text-sm">{sub.name}</span>
                                                </div>
                                            ))}

                                            {/* Add subcategory form */}
                                            {addingSubcategoryTo === category.id ? (
                                                <div className="flex gap-2 pt-2">
                                                    <Input
                                                        placeholder="Subcategory name..."
                                                        value={newSubcategoryName}
                                                        onChange={(e) => setNewSubcategoryName(e.target.value)}
                                                        className="h-8 text-sm"
                                                        autoFocus
                                                    />
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleAddSubcategory(category.id)}
                                                        disabled={!newSubcategoryName || isSubmittingSubcategory}
                                                    >
                                                        {isSubmittingSubcategory ? (
                                                            <Loader2 className="w-3 h-3 animate-spin" />
                                                        ) : (
                                                            "Add"
                                                        )}
                                                    </Button>
                                                    <Button
                                                        size="sm"
                                                        variant="outline"
                                                        onClick={() => {
                                                            setAddingSubcategoryTo(null);
                                                            setNewSubcategoryName("");
                                                        }}
                                                    >
                                                        Cancel
                                                    </Button>
                                                </div>
                                            ) : (
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => setAddingSubcategoryTo(category.id)}
                                                    className="text-muted-foreground"
                                                >
                                                    <Plus className="w-3 h-3 mr-1" />
                                                    Add subcategory
                                                </Button>
                                            )}
                                        </div>
                                    </AccordionContent>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function AddCategoryForm({ onSuccess }: { onSuccess: () => void }) {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [name, setName] = useState("");
    const [color, setColor] = useState(categoryColors[0]);

    const handleSubmit = async () => {
        if (!name) return;

        setIsSubmitting(true);
        try {
            const response = await fetch("/api/categories", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ name, color }),
            });

            if (response.ok) {
                onSuccess();
            }
        } catch (error) {
            console.error("Error creating category:", error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="space-y-4 pt-2">
            <div className="space-y-2">
                <label className="text-sm font-medium">Name</label>
                <Input
                    placeholder="e.g., Food & Dining, Transport..."
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Color</label>
                <div className="flex gap-2 flex-wrap">
                    {categoryColors.map((c) => (
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
                    "Create Category"
                )}
            </Button>
        </div>
    );
}
