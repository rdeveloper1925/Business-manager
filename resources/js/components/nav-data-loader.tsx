import { Link } from '@inertiajs/react';
import { ChevronRight, Database, Users } from 'lucide-react';

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
import { customersPage } from '@/actions/App/Http/Controllers/DataLoaderController';

export function NavDataLoader() {
    const { isCurrentUrl, isCurrentOrParentUrl } = useCurrentUrl();
    const customersHref = customersPage.url();
    const childActive = isCurrentUrl(customersHref);

    return (
        <SidebarGroup className="px-2 py-0">
            <SidebarGroupLabel>Data loader</SidebarGroupLabel>
            <SidebarMenu>
                <SidebarMenuItem>
                    <Collapsible
                        className="group/collapsible w-full"
                        defaultOpen={isCurrentOrParentUrl(customersHref)}
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
                                        isActive={childActive}
                                    >
                                        <Link href={customersHref} prefetch>
                                            <Users />
                                            <span>Customer data load</span>
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
