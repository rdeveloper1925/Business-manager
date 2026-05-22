import { Link } from '@inertiajs/react';
import { ChevronRight, Database, Truck, Users } from 'lucide-react';
import {
    customersPage,
    suppliersPage,
} from '@/actions/App/Http/Controllers/DataLoaderController';

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

export function NavDataLoader() {
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();
    const customersHref = customersPage.url();
    const suppliersHref = suppliersPage.url();
    const sectionOpen =
        isCurrentOrParentUrl(customersHref) || isCurrentOrParentUrl(suppliersHref);

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Data loader</SidebarGroupLabel>
            <SidebarMenu>
                <SidebarMenuItem>
                    <Collapsible
                        className="group/collapsible w-full"
                        defaultOpen={sectionOpen}
                    >
                        <CollapsibleTrigger asChild>
                            <SidebarMenuButton tooltip="Data loader">
                                <Database />
                                <span>Data loader</span>
                                <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                            </SidebarMenuButton>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                            <SidebarMenuSub>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton
                                        asChild
                                        isActive={isCurrentUrl(customersHref)}
                                    >
                                        <Link href={customersHref} prefetch>
                                            <Users />
                                            <span>Customer data load</span>
                                        </Link>
                                    </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                                <SidebarMenuSubItem>
                                    <SidebarMenuSubButton
                                        asChild
                                        isActive={isCurrentUrl(suppliersHref)}
                                    >
                                        <Link href={suppliersHref} prefetch>
                                            <Truck />
                                            <span>Supplier data load</span>
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
