import { Link } from '@inertiajs/react';
import {
    ArrowLeftRight,
    ChevronRight,
    LayoutDashboard,
    Package,
    Warehouse,
} from 'lucide-react';

import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
    SidebarGroup,
    SidebarGroupLabel,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarMenuSub,
    SidebarMenuSubButton,
    SidebarMenuSubItem,
} from '@/components/ui/sidebar';
import { useCurrentUrl } from '@/hooks/use-current-url';
import { dashboard as inventoryDashboard } from '@/routes/inventory';
import { index as partsIndex } from '@/routes/inventory/parts';
import { index as transactionsIndex } from '@/routes/inventory/transactions';

export function NavInventory() {
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();

    const dashboardHref = inventoryDashboard.url();
    const partsHref = partsIndex.url();
    const transactionsHref = transactionsIndex.url();

    const sectionOpen =
        isCurrentOrParentUrl(dashboardHref) ||
        isCurrentOrParentUrl(partsHref) ||
        isCurrentOrParentUrl(transactionsHref);

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Inventory</SidebarGroupLabel>
            <SidebarMenu>
                <SidebarMenuItem>
                    <Collapsible
                        className="group/collapsible w-full"
                        defaultOpen={sectionOpen}
                    >
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip="Inventory">
                                <Warehouse />
                                <span>Inventory</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton
                                        asChild
                                        isActive={isCurrentUrl(dashboardHref)}
                                    >
                                        <Link href={dashboardHref} prefetch>
                                            <LayoutDashboard />
                                            <span>Inventory</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton
                                        asChild
                                        isActive={isCurrentUrl(partsHref, undefined, true)}
                                    >
                                        <Link href={partsHref} prefetch>
                                            <Package />
                                            <span>Parts</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton
                                        asChild
                                        isActive={isCurrentUrl(
                                            transactionsHref,
                                            undefined,
                                            true,
                                        )}
                                    >
                                        <Link href={transactionsHref} prefetch>
                                            <ArrowLeftRight />
                                            <span>Transactions</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                            </SidebarMenuSub>
                        </CollapsibleContent>
                    </Collapsible>
                </SidebarMenuItem>
            </SidebarMenu>
        </SidebarGroup>
    );
}
