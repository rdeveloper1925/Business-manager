import { Head } from '@inertiajs/react';
import type { FormEvent } from 'react';
import { toast } from 'sonner';
import {
    suppliersPage,
    suppliersTemplate,
    suppliersUpload,
} from '@/actions/App/Http/Controllers/DataLoaderController';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useCsvImport } from '@/hooks/use-csv-import';
import { cn } from '@/lib/utils';
import { dashboard } from '@/routes';

export default function SupplierDataLoad() {
    const { importId, importStatus, submitFile, uploading } = useCsvImport({
        uploadUrl: suppliersUpload.url(),
        sessionStorageKey: 'bm_supplier_data_import_id',
    });

    const onSubmitFile = async (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const form = e.currentTarget;
        const input = form.elements.namedItem('csv') as HTMLInputElement;
        const file = input.files?.[0];

        if (!file) {
            toast.error('Choose a CSV file.');

            return;
        }

        submitFile(file, () => {
            input.value = '';
        });
    };

    const progress =
        importStatus?.status === 'success'
            ? 100
            : Math.min(100, Math.max(0, importStatus?.progress ?? 0));

    return (
        <>
            <Head title="Supplier data load" />
            <div className="flex flex-1 flex-col gap-6 p-4">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        Supplier data load
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Download the template, fill in your rows, then upload a
                        CSV that matches the template headers exactly.
                    </p>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Template</CardTitle>
                        <CardDescription>
                            The first row must match these columns:
                            contact_person_name, company_name, phone, email,
                            address, category. For category use one of: OEM,
                            Aftermarket, Other.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <Button variant="outline" asChild>
                            <a href={suppliersTemplate.url()} download>
                                Download CSV template
                            </a>
                        </Button>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader>
                        <CardTitle>Upload</CardTitle>
                        <CardDescription>
                            Import runs in the background. Progress updates
                            below.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <form className="flex flex-col gap-4" onSubmit={onSubmitFile}>
                            <div className="grid gap-2">
                                <Label htmlFor="csv">CSV file</Label>
                                <Input
                                    id="csv"
                                    name="csv"
                                    type="file"
                                    accept=".csv,text/csv,text/plain"
                                    disabled={uploading}
                                    required
                                />
                            </div>
                            <Button type="submit" disabled={uploading}>
                                {uploading ? 'Uploading…' : 'Upload and import'}
                            </Button>
                        </form>
                    </CardContent>
                </Card>

                {(importId !== null || importStatus !== null) && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Progress</CardTitle>
                            {importId !== null && (
                                <CardDescription>
                                    Import ID: {importId}
                                </CardDescription>
                            )}
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div
                                className="bg-muted h-2 w-full overflow-hidden rounded-full"
                                role="progressbar"
                                aria-valuenow={progress}
                                aria-valuemin={0}
                                aria-valuemax={100}
                            >
                                <div
                                    className="bg-primary h-full transition-[width] duration-300"
                                    style={{ width: `${progress}%` }}
                                />
                            </div>
                            {importStatus && (
                                <p className="text-muted-foreground text-sm">
                                    Status:{' '}
                                    <span className="text-foreground font-medium">
                                        {importStatus.status}
                                    </span>
                                    {importStatus.total > 0 && (
                                        <>
                                            {' '}
                                            — {importStatus.processed} /{' '}
                                            {importStatus.total} rows
                                        </>
                                    )}
                                </p>
                            )}
                            {importStatus?.status === 'success' && (
                                <p className="text-sm text-green-700 dark:text-green-400">
                                    Successfully loaded {importStatus.rows_loaded}{' '}
                                    row(s).
                                </p>
                            )}
                            {importStatus?.status === 'failed' && (
                                <p
                                    className={cn(
                                        'rounded-md border border-destructive/40 bg-destructive/10 p-3 text-sm text-destructive',
                                    )}
                                >
                                    {importStatus.message ?? 'Import failed.'}
                                </p>
                            )}
                        </CardContent>
                    </Card>
                )}
            </div>
        </>
    );
}

SupplierDataLoad.layout = {
    breadcrumbs: [
        { title: 'Dashboard', href: dashboard.url() },
        {
            title: 'Supplier data load',
            href: suppliersPage.url(),
        },
    ],
};
