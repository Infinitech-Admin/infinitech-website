// 📁 Place this file at: components/portal-demo-admin/DemoListTable.tsx
"use client";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  ExternalLink,
  ImageIcon,
  Loader,
  Pencil,
  Power,
  Search,
  Trash2,
  Users,
} from "lucide-react";
import type { PortalDemoRecord } from "@/lib/portalDemoApi";

type Props = {
  demos: PortalDemoRecord[];
  totalCount: number;
  currentPage: number;
  totalPages: number;
  searchQuery: string;
  togglingId: number | null;
  onSearchChange: (q: string) => void;
  onPageChange: (p: number) => void;
  onView: (demo: PortalDemoRecord) => void;
  onEditBasic: (demo: PortalDemoRecord) => void;
  onEditRoles: (demo: PortalDemoRecord) => void;
  onToggleStatus: (demo: PortalDemoRecord) => void;
  onDelete: (demo: PortalDemoRecord) => void;
};

export function DemoListTable({
  demos,
  totalCount,
  currentPage,
  totalPages,
  searchQuery,
  togglingId,
  onSearchChange,
  onPageChange,
  onView,
  onEditBasic,
  onEditRoles,
  onToggleStatus,
  onDelete,
}: Props) {
  return (
    <>
      <Card className="mb-6 border-2">
        <CardContent className="p-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search by name or category..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      <Card className="border-2 overflow-hidden">
        <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 border-b-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>All Portal Demos</CardTitle>
              <CardDescription>
                Showing {demos.length} of {totalCount} demos
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100 dark:bg-slate-800">
                  <TableHead className="font-bold">Image</TableHead>
                  <TableHead className="font-bold">Status</TableHead>
                  <TableHead className="font-bold">Name</TableHead>
                  <TableHead className="font-bold">Category</TableHead>
                  <TableHead className="font-bold">Roles</TableHead>
                  <TableHead className="font-bold">Updated</TableHead>
                  <TableHead className="font-bold text-center">
                    Actions
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {demos.map((demo) => (
                  <TableRow
                    key={demo.id}
                    className="hover:bg-cyan-50/50 dark:hover:bg-cyan-900/20 border-b"
                  >
                    <TableCell>
                      {demo.image_url ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={demo.image_url}
                          alt={demo.name}
                          className="h-10 w-14 rounded object-cover border"
                        />
                      ) : (
                        <div className="h-10 w-14 rounded border border-dashed flex items-center justify-center text-slate-300">
                          <ImageIcon className="h-4 w-4" />
                        </div>
                      )}
                    </TableCell>
                    <TableCell>
                      {demo.status === "active" ? (
                        <Badge className="bg-green-500 hover:bg-green-600">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary">Disabled</Badge>
                      )}
                    </TableCell>
                    <TableCell className="font-medium max-w-[220px] truncate">
                      {demo.name}
                    </TableCell>
                    <TableCell className="text-sm">
                      {demo.category || "N/A"}
                    </TableCell>
                    <TableCell className="text-sm">
                      <span className="inline-flex items-center gap-1 text-slate-600 dark:text-slate-300">
                        <Users className="h-4 w-4" />
                        {demo.role_count}
                      </span>
                    </TableCell>
                    <TableCell className="text-sm">
                      {new Date(demo.updated_at).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2 justify-center flex-wrap">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onView(demo)}
                          className="border-2 border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 dark:border-cyan-800"
                          title="View details"
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditBasic(demo)}
                          className="border-2 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800"
                          title="Edit"
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onEditRoles(demo)}
                          className="border-2 border-purple-200 hover:bg-purple-50 hover:text-purple-700 dark:border-purple-800"
                          title="Manage roles & sidebar"
                        >
                          <Users className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            window.open(`/portal-demos/${demo.slug}`, "_blank")
                          }
                          className="border-2 border-slate-200 hover:bg-slate-50 dark:border-slate-700"
                          title="Preview"
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onToggleStatus(demo)}
                          disabled={togglingId === demo.id}
                          className={
                            demo.status === "active"
                              ? "border-2 border-amber-200 hover:bg-amber-50 hover:text-amber-700 dark:border-amber-800"
                              : "border-2 border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-800"
                          }
                          title={
                            demo.status === "active" ? "Disable" : "Enable"
                          }
                        >
                          {togglingId === demo.id ? (
                            <Loader className="h-4 w-4 animate-spin" />
                          ) : (
                            <Power className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => onDelete(demo)}
                          className="border-2 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800"
                          title="Delete"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {demos.length === 0 && (
                  <TableRow>
                    <TableCell
                      colSpan={7}
                      className="text-center py-10 text-muted-foreground"
                    >
                      No portal demos found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6">
          <p className="text-sm text-muted-foreground">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPageChange(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                onPageChange(Math.min(totalPages, currentPage + 1))
              }
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
