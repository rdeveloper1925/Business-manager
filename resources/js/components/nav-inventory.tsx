import { Link } from '@inertiajs/react';
import { ChevronRight, Package, Warehouse } from 'lucide-react';

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
import { index as partsIndex } from '@/routes/inventory/parts';

export function NavInventory() {
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();
    const partsHref = partsIndex.url();
    const childActive = isCurrentUrl(partsHref);

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Inventory</SidebarGroupLabel>
            <SidebarMenu>
                <SidebarMenuItem>
                    <Collapsible
                        className="group/collapsible w-full"
                        defaultOpen={isCurrentOrParentUrl(partsHref)}
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
                                        isActive={childActive}
                                    >
                                        <Link href={partsHref} prefetch>
                                            <Package />
                                            <span>Parts</span>
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
