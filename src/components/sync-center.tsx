"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
    Download,
    Upload,
    ClipboardPaste,
    FileSpreadsheet,
    CheckCircle2,
    AlertCircle,
    Loader2,
    X,
} from "lucide-react";
import { format } from "date-fns";

interface Transaction {
    id: string;
    amount: number;
    description: string;
    date: string;
    type: string;
    categoryId: string | null;
    category: { id: string; name: string; color: string } | null;
}

interface Category {
    id: string;
    name: string;
    color: string;
}

interface SyncData {
    transactions: Transaction[];
    categories: Category[];
}

export function SyncCenterClient({ data }: { data: SyncData }) {
    const router = useRouter();
    const fileInputRef = useRef<HTMLInputElement>(null);
    const [isExporting, setIsExporting] = useState(false);
    const [isImporting, setIsImporting] = useState(false);
    const [importResult, setImportResult] = useState<{ success: boolean; message: string } | null>(null);
    const [pasteContent, setPasteContent] = useState("");
    const [showPasteArea, setShowPasteArea] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // Generate CSV
            const headers = ["Date", "Description", "Type", "Amount", "Category"];
            const rows = data.transactions.map((t) => [
                format(new Date(t.date), "yyyy-MM-dd HH:mm:ss"),
                `"${t.description.replace(/"/g, '""')}"`,
                t.type,
                t.amount.toFixed(2),
                t.category?.name || "",
            ]);

            const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

            // Download
            const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
            const url = URL.createObjectURL(blob);
            const link = document.createElement("a");
            link.href = url;
            link.download = `titan-finance-export-${format(new Date(), "yyyy-MM-dd")}.csv`;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        } catch (error) {
            console.error("Export error:", error);
        } finally {
            setIsExporting(false);
        }
    };

    const parseCSV = (content: string): Array<Record<string, string>> => {
        const lines = content.trim().split("\n");
        if (lines.length < 2) return [];

        const headers = lines[0].split(",").map((h) => h.trim().toLowerCase());
        const rows: Array<Record<string, string>> = [];

        for (let i = 1; i < lines.length; i++) {
            const values: string[] = [];
            let current = "";
            let inQuotes = false;

            for (const char of lines[i]) {
                if (char === '"') {
                    inQuotes = !inQuotes;
                } else if (char === "," && !inQuotes) {
                    values.push(current.trim());
                    current = "";
                } else {
                    current += char;
                }
            }
            values.push(current.trim());

            const row: Record<string, string> = {};
            headers.forEach((header, index) => {
                row[header] = values[index] || "";
            });
            rows.push(row);
        }

        return rows;
    };

    const importTransactions = async (csvContent: string) => {
        setIsImporting(true);
        setImportResult(null);

        try {
            const rows = parseCSV(csvContent);
            if (rows.length === 0) {
                setImportResult({ success: false, message: "No valid data found in CSV" });
                return;
            }

            // Create category lookup
            const categoryLookup = new Map(data.categories.map((c) => [c.name.toLowerCase(), c.id]));

            let imported = 0;
            let failed = 0;

            for (const row of rows) {
                try {
                    const amount = parseFloat(row.amount);
                    const description = row.description?.replace(/^"|"$/g, "") || "";
                    const type = row.type?.toLowerCase() === "income" ? "income" : "expense";
                    const categoryName = row.category?.toLowerCase() || "";
                    const categoryId = categoryLookup.get(categoryName) || null;
                    const date = row.date ? new Date(row.date) : new Date();

                    if (isNaN(amount) || !description) {
                        failed++;
                        continue;
                    }

                    await fetch("/api/transactions", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            amount,
                            description,
                            type,
                            categoryId,
                            date: date.toISOString(),
                        }),
                    });

                    imported++;
                } catch {
                    failed++;
                }
            }

            setImportResult({
                success: true,
                message: `Successfully imported ${imported} transactions${failed > 0 ? `, ${failed} failed` : ""}`,
            });
            router.refresh();
        } catch (error) {
            setImportResult({ success: false, message: "Failed to parse CSV file" });
        } finally {
            setIsImporting(false);
        }
    };

    const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target?.result as string;
            importTransactions(content);
        };
        reader.readAsText(file);
    };

    const handlePasteImport = () => {
        if (pasteContent.trim()) {
            importTransactions(pasteContent);
            setPasteContent("");
            setShowPasteArea(false);
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Sync Center</h1>
                <p className="text-muted-foreground">
                    Export, import, and manage your transaction data
                </p>
            </div>

            {/* Import Result Message */}
            {importResult && (
                <Card className={importResult.success ? "border-emerald-500/50" : "border-red-500/50"}>
                    <CardContent className="py-4">
                        <div className="flex items-center gap-3">
                            {importResult.success ? (
                                <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            ) : (
                                <AlertCircle className="w-5 h-5 text-red-500" />
                            )}
                            <span>{importResult.message}</span>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="ml-auto"
                                onClick={() => setImportResult(null)}
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Export Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Download className="w-5 h-5 text-amber-500" />
                        Export to CSV
                    </CardTitle>
                    <CardDescription>
                        Download all your transactions as a CSV file for backup or external analysis.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center justify-between p-4 rounded-lg bg-accent/50">
                        <div>
                            <p className="font-medium">Full Export</p>
                            <p className="text-sm text-muted-foreground">
                                {data.transactions.length} transactions
                            </p>
                        </div>
                        <Button
                            onClick={handleExport}
                            disabled={isExporting}
                            className="bg-amber-500 hover:bg-amber-600 text-black"
                        >
                            {isExporting ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                            ) : (
                                <Download className="w-4 h-4 mr-2" />
                            )}
                            Export CSV
                        </Button>
                    </div>
                </CardContent>
            </Card>

            <Separator />

            {/* Import Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="w-5 h-5 text-emerald-500" />
                        Import from CSV
                    </CardTitle>
                    <CardDescription>
                        Upload a CSV file to bulk import transactions. Required columns: Date, Description, Type, Amount. Optional: Category.
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <input
                        type="file"
                        ref={fileInputRef}
                        accept=".csv"
                        onChange={handleFileUpload}
                        className="hidden"
                    />

                    <Button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={isImporting}
                        variant="outline"
                        className="w-full h-24 border-dashed border-2"
                    >
                        {isImporting ? (
                            <div className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Importing...
                            </div>
                        ) : (
                            <div className="flex flex-col items-center gap-2">
                                <FileSpreadsheet className="w-8 h-8 text-muted-foreground" />
                                <span>Click to upload CSV file</span>
                            </div>
                        )}
                    </Button>
                </CardContent>
            </Card>

            {/* Paste Section */}
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <ClipboardPaste className="w-5 h-5 text-blue-500" />
                        Paste from CSV
                    </CardTitle>
                    <CardDescription>
                        Paste CSV content directly for quick imports from spreadsheets.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    {!showPasteArea ? (
                        <Button
                            variant="outline"
                            onClick={() => setShowPasteArea(true)}
                            className="w-full"
                        >
                            <ClipboardPaste className="w-4 h-4 mr-2" />
                            Open Paste Area
                        </Button>
                    ) : (
                        <div className="space-y-4">
                            <textarea
                                value={pasteContent}
                                onChange={(e) => setPasteContent(e.target.value)}
                                placeholder="Paste your CSV content here...

Example format:
Date,Description,Type,Amount,Category
2024-01-15,Coffee,expense,5.50,Dining
2024-01-14,Salary,income,5000,Salary"
                                className="w-full h-48 p-3 rounded-lg bg-accent border-0 resize-none font-mono text-sm"
                            />
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setShowPasteArea(false);
                                        setPasteContent("");
                                    }}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    onClick={handlePasteImport}
                                    disabled={!pasteContent.trim() || isImporting}
                                    className="flex-1 bg-blue-500 hover:bg-blue-600 text-white"
                                >
                                    {isImporting ? (
                                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                                    ) : null}
                                    Import Pasted Data
                                </Button>
                            </div>
                        </div>
                    )}
                </CardContent>
            </Card>

            {/* CSV Format Help */}
            <Card>
                <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">
                        CSV Format Reference
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="p-4 rounded-lg bg-accent/50 font-mono text-sm overflow-x-auto">
                        <div className="text-muted-foreground mb-2"># Required columns</div>
                        <div>Date,Description,Type,Amount,Category</div>
                        <div className="text-muted-foreground mt-2"># Example row</div>
                        <div>2024-01-15,&quot;Weekly Groceries&quot;,expense,150.00,Groceries</div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
