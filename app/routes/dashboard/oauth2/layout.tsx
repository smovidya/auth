import { redirect } from 'react-router';
import { Outlet } from 'react-router';
import { AppSidebar } from "~/components/app-sidebar"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "~/components/ui/breadcrumb"
import { Separator } from "~/components/ui/separator"
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "~/components/ui/sidebar"
import { authClient } from '~/lib/auth-client';

export async function loader() {
  const session = await authClient.getSession();
  if (!session) {
    return redirect('/login?return_to=/oauth2');
  }
  return null;
}

export default function OAuth2Layout() {
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <Outlet />
    </div>
  )
}
