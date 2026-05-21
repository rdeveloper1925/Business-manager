import { Link } from '@inertiajs/react';
import { LayoutGrid, Truck, Users } from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavDataLoader } from '@/components/nav-data-loader';
import { NavInventory } from '@/components/nav-inventory';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as customersIndex } from '@/routes/customers';
import { index as suppliersIndex } from '@/routes/suppliers';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Customers',
        href: customersIndex(),
        icon: Users,
    },
    {
        title: 'Suppliers',
        href: suppliersIndex(),
        icon: Truck,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
                <NavInventory />
                <NavDataLoader />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
