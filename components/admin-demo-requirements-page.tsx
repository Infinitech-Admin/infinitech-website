"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  Loader,
  BarChart3,
  Filter,
  Search,
  Calendar,
  Building2,
  Trash2,
  Download,
} from "lucide-react"
import { Input } from "@/components/ui/input"

interface DemoRequirement {
  id: number
  business_name: string
  business_type: string
  contact_info: string
  tagline: string
  primary_purposes: string[]
  primary_purposes_other: string[]
  target_audience: string
  key_features: string[]
  key_features_other: string[]
  product_image_sources: string[]
  color_style: string
  social_media_links: string[]
  location: string
  created_at: string
}

const ITEMS_PER_PAGE = 10

export default function AdminDemoRequirementsPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [requirements, setRequirements] = useState<DemoRequirement[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedRequirement, setSelectedRequirement] = useState<DemoRequirement | null>(null)
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBusinessType, setFilterBusinessType] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [requirementToDelete, setRequirementToDelete] = useState<DemoRequirement | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/admin/login")
      return
    }

    fetchRequirements(token)
  }, [router])

  const fetchRequirements = async (token: string) => {
    try {
      const response = await fetch("/api/demoRequirements", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch demo requirements")
      }

      const data = await response.json()

      let requirementsData = []
      if (data.success && data.data) {
        if (data.data.data && Array.isArray(data.data.data)) {
          requirementsData = data.data.data
        } else if (Array.isArray(data.data)) {
          requirementsData = data.data
        }
      }

      setRequirements(requirementsData)
    } catch (error) {
      console.error("Error fetching requirements:", error)
      setMessage("Failed to load demo requirements")
      setRequirements([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteRequirement = async () => {
    if (!requirementToDelete) return

    const token = localStorage.getItem("adminToken")
    if (!token) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/demoRequirements/${requirementToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete requirement")
      }

      toast({
        title: "Success",
        description: `Demo requirement for ${requirementToDelete.business_name} deleted successfully!`,
        variant: "default",
      })

      setRequirements(requirements.filter((r) => r.id !== requirementToDelete.id))
      setDeleteDialogOpen(false)
      setRequirementToDelete(null)
    } catch (error) {
      console.error("Error deleting requirement:", error)
      toast({
        title: "Error",
        description: "Failed to delete requirement. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const filteredRequirements = Array.isArray(requirements)
    ? requirements.filter((req) => {
        const matchesSearch =
          req.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.business_type?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          req.contact_info?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesFilter = filterBusinessType === "all" || req.business_type === filterBusinessType

        return matchesSearch && matchesFilter
      })
    : []

  const uniqueBusinessTypes = Array.isArray(requirements)
    ? Array.from(new Set(requirements.map((r) => r.business_type).filter(Boolean)))
    : []

  const stats = {
    total: Array.isArray(requirements) ? requirements.length : 0,
    submitted: Array.isArray(requirements) ? requirements.length : 0,
    completed: Array.isArray(requirements)
      ? requirements.filter((r) => r.business_name && r.contact_info).length
      : 0,
  }

  // Helper function to display array items, handling "Other" cases
  const displayArrayItems = (items: string[] | string, otherValue?: string[] | string) => {
    if (Array.isArray(items)) {
      // Check if "Other" exists in the array
      const hasOther = items.includes("Other")
      
      if (hasOther && otherValue) {
        // Filter out ALL "Other" entries (even if there are duplicates) and add the custom values
        const filteredItems = items.filter(item => item !== "Other")
        const otherArray = Array.isArray(otherValue) ? otherValue : [otherValue]
        // Remove duplicates from the final result
        const combined = [...filteredItems, ...otherArray]
        return Array.from(new Set(combined))
      }
      
      // Remove any duplicates from regular items
      return Array.from(new Set(items))
    }
    
    // If items is "Other" and we have otherValue, use that
    if (items === "Other" && otherValue) {
      return Array.isArray(otherValue) ? otherValue : [otherValue]
    }
    
    return [items]
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading demo requirements...</p>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(filteredRequirements.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedRequirements = filteredRequirements.slice(startIndex, endIndex)

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-900/10 dark:to-purple-950/10">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Building2 className="h-8 w-8 sm:h-10 sm:w-10" />
                Website Demo Requirements
              </h1>
              <p className="text-blue-100">Manage and view all website demo submission requests</p>
            </div>
            <Link href="/admin/dashboard">
              <Button variant="secondary" className="bg-white hover:bg-gray-100 text-blue-900">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="border-2 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow bg-white/80 dark:bg-slate-900/80 backdrop-blur">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Total Requests</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-blue-200 dark:border-blue-800 hover:shadow-lg transition-shadow bg-white/80 dark:bg-slate-900/80 backdrop-blur">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Submitted</p>
                  <p className="text-2xl sm:text-3xl font-bold text-blue-600">{stats.submitted}</p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl">
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-purple-200 dark:border-purple-800 hover:shadow-lg transition-shadow bg-white/80 dark:bg-slate-900/80 backdrop-blur">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Completed</p>
                  <p className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.completed}</p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl">
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow bg-white/80 dark:bg-slate-900/80 backdrop-blur">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Completion Rate</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">
                    {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                  </p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {message && (
          <Alert className="mb-6 border-2" variant={message.includes("successfully") ? "default" : "destructive"}>
            <AlertDescription className="font-medium">{message}</AlertDescription>
          </Alert>
        )}

        {/* Requests Table */}
        <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-900/10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <Building2 className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  All Requests
                </CardTitle>
                <CardDescription className="mt-1">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredRequirements.length)} of{" "}
                  {filteredRequirements.length}
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search requests..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-9 border-2"
                  />
                </div>
                {uniqueBusinessTypes.length > 0 && (
                  <Select
                    value={filterBusinessType}
                    onValueChange={(value) => {
                      setFilterBusinessType(value)
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[180px] border-2">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[100] bg-white dark:bg-slate-900 border-2 shadow-xl">
                      <SelectItem value="all">All Types</SelectItem>
                      {uniqueBusinessTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0 overflow-hidden">
            <div className="w-full overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-50 dark:bg-slate-800/50 hover:bg-slate-50 dark:hover:bg-slate-800/50">
                    <TableHead className="font-semibold">Business Name</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Type</TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">Purpose</TableHead>
                    <TableHead className="font-semibold hidden sm:table-cell">Date</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedRequirements.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Building2 className="h-12 w-12 text-muted-foreground/50" />
                          <p className="text-muted-foreground font-medium">No demo requirements found</p>
                          <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedRequirements.map((req) => {
                      const displayedPurposes = displayArrayItems(req.primary_purposes, req.primary_purposes_other)
                      
                      return (
                        <TableRow
                          key={req.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                                {req.business_name?.charAt(0)?.toUpperCase() || "?"}
                              </div>
                              <span className="truncate">{req.business_name}</span>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline">{req.business_type}</Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex gap-1 flex-wrap max-w-xs">
                              {displayedPurposes.slice(0, 2).map((purpose, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {purpose}
                                </Badge>
                              ))}
                              {displayedPurposes.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{displayedPurposes.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(req.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedRequirement(req)}
                                    className="border-2 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:hover:bg-blue-900/20"
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span className="hidden sm:inline ml-1">View</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-2">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
                                      <Building2 className="h-6 w-6 text-blue-600" />
                                      Demo Requirement Details
                                    </DialogTitle>
                                    <DialogDescription>
                                      Submitted: {new Date(selectedRequirement?.created_at || "").toLocaleString()}
                                    </DialogDescription>
                                  </DialogHeader>

                                  {selectedRequirement && (
                                    <div className="space-y-4 text-sm">
                                      <div className="grid grid-cols-2 gap-4 border-b pb-4">
                                        <div>
                                          <p className="font-semibold text-slate-700">Business Name</p>
                                          <p>{selectedRequirement.business_name}</p>
                                        </div>
                                        <div>
                                          <p className="font-semibold text-slate-700">Business Type</p>
                                          <p>{selectedRequirement.business_type}</p>
                                        </div>
                                      </div>

                                      {selectedRequirement.tagline && (
                                        <div className="border-b pb-4">
                                          <p className="font-semibold text-slate-700 mb-1">Tagline</p>
                                          <p>{selectedRequirement.tagline}</p>
                                        </div>
                                      )}

                                      <div className="border-b pb-4">
                                        <p className="font-semibold text-slate-700 mb-1">Contact Info</p>
                                        <p>{selectedRequirement.contact_info}</p>
                                      </div>

                                      <div className="border-b pb-4">
                                        <p className="font-semibold text-slate-700 mb-2">Primary Purposes</p>
                                        <div className="flex flex-wrap gap-2">
                                          {displayArrayItems(
                                            selectedRequirement.primary_purposes,
                                            selectedRequirement.primary_purposes_other
                                          ).map((purpose, idx) => (
                                            <Badge key={idx} variant="secondary">
                                              {purpose}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>

                                      <div className="border-b pb-4">
                                        <p className="font-semibold text-slate-700 mb-1">Target Audience</p>
                                        <p>{selectedRequirement.target_audience}</p>
                                      </div>

                                      <div className="border-b pb-4">
                                        <p className="font-semibold text-slate-700 mb-2">Key Features</p>
                                        <div className="flex flex-wrap gap-2">
                                          {displayArrayItems(
                                            selectedRequirement.key_features,
                                            selectedRequirement.key_features_other
                                          ).map((feature, idx) => (
                                            <Badge key={idx} variant="outline">
                                              {feature}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>

                                      {selectedRequirement.product_image_sources &&
                                        selectedRequirement.product_image_sources.length > 0 && (
                                          <div className="border-b pb-4">
                                            <p className="font-semibold text-slate-700 mb-2">Product Image Sources</p>
                                            <div className="space-y-2">
                                              {selectedRequirement.product_image_sources.map((source, idx) => (
                                                <a
                                                  key={idx}
                                                  href={source}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-blue-600 hover:underline break-all block"
                                                >
                                                  {source}
                                                </a>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                      <div className="border-b pb-4">
                                        <p className="font-semibold text-slate-700 mb-1">Color Style</p>
                                        <p>{selectedRequirement.color_style}</p>
                                      </div>

                                      {selectedRequirement.social_media_links &&
                                        selectedRequirement.social_media_links.length > 0 && (
                                          <div className="border-b pb-4">
                                            <p className="font-semibold text-slate-700 mb-2">Social Media Links</p>
                                            <div className="space-y-2">
                                              {selectedRequirement.social_media_links.map((link, idx) => (
                                                <a
                                                  key={idx}
                                                  href={link}
                                                  target="_blank"
                                                  rel="noopener noreferrer"
                                                  className="text-blue-600 hover:underline break-all block"
                                                >
                                                  {link}
                                                </a>
                                              ))}
                                            </div>
                                          </div>
                                        )}

                                      {selectedRequirement.location && (
                                        <div>
                                          <p className="font-semibold text-slate-700 mb-1">Location</p>
                                          <p>{selectedRequirement.location}</p>
                                        </div>
                                      )}
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>

                              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setRequirementToDelete(req)}
                                    className="border-2 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete Demo Requirement</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to delete the requirement for{" "}
                                      {requirementToDelete?.business_name}? This action cannot be undone.
                                    </DialogDescription>
                                  </DialogHeader>
                                  <div className="flex gap-3 mt-6">
                                    <Button
                                      variant="outline"
                                      onClick={() => setDeleteDialogOpen(false)}
                                      disabled={deleting}
                                    >
                                      Cancel
                                    </Button>
                                    <Button variant="destructive" onClick={handleDeleteRequirement} disabled={deleting}>
                                      {deleting ? <Loader className="h-4 w-4 mr-2 animate-spin" /> : null}
                                      Delete
                                    </Button>
                                  </div>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-2 mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <div className="text-sm font-medium">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
