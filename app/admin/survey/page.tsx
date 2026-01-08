"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
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
  Download,
  Eye,
  Mail,
  Loader,
  BarChart3,
  Filter,
  Search,
  Calendar,
  FileText,
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import jsPDF from "jspdf"

interface Survey {
  id: number
  survey_id: string
  client_name: string
  company_name: string
  email: string
  phone: string
  role: string
  industries: string[]
  industry_other: string
  business_goals: string[]
  business_goals_other: string
  slowdown_issues: string[]
  slowdown_issues_other: string
  customer_journey: string
  customer_journey_details: string
  sops_status: string
  sops_details: string
  current_tools: string[]
  current_tools_details: string
  marketing_confidence: string
  marketing_details: string
  content_quality: string
  content_details: string
  problem_areas: string[]
  problem_areas_details: string
  data_analytics: string
  data_details: string
  solution_openness: string
  solution_details: string
  created_at: string
}

const ITEMS_PER_PAGE = 10

export default function AdminSurveyPage() {
  const router = useRouter()
  const [surveys, setSurveys] = useState<Survey[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedSurvey, setSelectedSurvey] = useState<Survey | null>(null)
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterIndustry, setFilterIndustry] = useState("all")
  const [downloadingId, setDownloadingId] = useState<number | null>(null)

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/admin/login")
      return
    }

    fetchSurveys()
  }, [router])

  const fetchSurveys = async () => {
    try {
      const response = await fetch("/api/surveys")

      if (!response.ok) {
        throw new Error("Failed to fetch surveys")
      }

      const data = await response.json()
      setSurveys(data.data.data || [])
    } catch (error) {
      console.error("Error fetching surveys:", error)
      setMessage("Failed to load surveys")
    } finally {
      setLoading(false)
    }
  }

 const downloadSurveyPDF = async (survey: Survey) => {
    setDownloadingId(survey.id)
    try {
      const { generateSurveyPDF } = await import("@/lib/pdf-generator")
      await generateSurveyPDF(survey)
      setMessage("PDF downloaded successfully!")
      setTimeout(() => setMessage(""), 3000)
    } catch (error) {
      console.error("Error generating PDF:", error)
      setMessage("Error generating PDF")
      setTimeout(() => setMessage(""), 3000)
    } finally {
      setDownloadingId(null)
    }
  }

  const filteredSurveys = surveys.filter((survey) => {
    const matchesSearch =
      survey.client_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      survey.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      survey.email?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterIndustry === "all" || survey.industries?.includes(filterIndustry)

    return matchesSearch && matchesFilter
  })

  const uniqueIndustries = Array.from(new Set(surveys.flatMap((s) => s.industries || [])))

  const stats = {
    total: surveys.length,
    submitted: surveys.length,
    pending: surveys.filter((s) => !s.customer_journey).length,
    completed: surveys.filter((s) => s.customer_journey).length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading surveys...</p>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(filteredSurveys.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedSurveys = filteredSurveys.slice(startIndex, endIndex)

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-cyan-50/30 to-blue-50/20 dark:from-slate-950 dark:via-cyan-900/10 dark:to-blue-950/10">
      <div className="bg-gradient-to-r from-cyan-600 to-blue-600 dark:from-cyan-900 dark:to-blue-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <FileText className="h-8 w-8 sm:h-10 sm:w-10" />
                Survey Responses
              </h1>
              <p className="text-cyan-100">Manage and view all survey responses</p>
            </div>
            <Link href="/admin/dashboard">
              <Button variant="secondary" className="bg-white hover:bg-gray-100 text-cyan-900">
                Back to Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="border-2 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow bg-white/80 dark:bg-slate-900/80 backdrop-blur">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Total Surveys</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl">
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
                  <Mail className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
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
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow bg-white/80 dark:bg-slate-900/80 backdrop-blur">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Response Rate</p>
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

        <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-cyan-50/30 dark:from-slate-800 dark:to-cyan-900/10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-cyan-600" />
                  All Surveys
                </CardTitle>
                <CardDescription className="mt-1">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredSurveys.length)} of {filteredSurveys.length}
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search surveys..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value)
                      setCurrentPage(1)
                    }}
                    className="pl-9 border-2"
                  />
                </div>
                {uniqueIndustries.length > 0 && (
                  <Select
                    value={filterIndustry}
                    onValueChange={(value) => {
                      setFilterIndustry(value)
                      setCurrentPage(1)
                    }}
                  >
                    <SelectTrigger className="w-full sm:w-[180px] border-2">
                      <Filter className="h-4 w-4 mr-2" />
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="z-[100] bg-white dark:bg-slate-900 border-2 shadow-xl">
                      <SelectItem value="all">All Industries</SelectItem>
                      {uniqueIndustries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
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
                    <TableHead className="font-semibold">Client Name</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Company</TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">Email</TableHead>
                    <TableHead className="font-semibold">Industries</TableHead>
                    <TableHead className="font-semibold hidden sm:table-cell">Date</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSurveys.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <FileText className="h-12 w-12 text-muted-foreground/50" />
                          <p className="text-muted-foreground font-medium">No surveys found</p>
                          <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedSurveys.map((survey) => (
                      <TableRow
                        key={survey.id}
                        className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                      >
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                              {survey.client_name.charAt(0).toUpperCase()}
                            </div>
                            <span className="truncate">{survey.client_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="truncate text-sm">{survey.company_name}</span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="truncate">{survey.email}</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-1 flex-wrap max-w-xs">
                            {survey.industries?.slice(0, 2).map((industry) => (
                              <Badge key={industry} variant="secondary" className="text-xs">
                                {industry}
                              </Badge>
                            ))}
                            {survey.industries && survey.industries.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{survey.industries.length - 2}
                              </Badge>
                            )}
                          </div>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <Calendar className="h-4 w-4" />
                            {new Date(survey.created_at).toLocaleDateString()}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSelectedSurvey(survey)}
                                  className="border-2 border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 dark:border-cyan-800 dark:hover:bg-cyan-900/20"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="hidden sm:inline ml-1">View</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-2">
                                <DialogHeader>
                                  <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
                                    <FileText className="h-6 w-6 text-cyan-600" />
                                    Survey Details
                                  </DialogTitle>
                                  <DialogDescription>
                                    Response ID: {survey.survey_id} • Submitted:{" "}
                                    {new Date(survey.created_at).toLocaleString()}
                                  </DialogDescription>
                                </DialogHeader>

                                <div className="space-y-4">
                                  <div className="bg-gradient-to-br from-slate-50 to-cyan-50/30 dark:from-slate-800 dark:to-cyan-900/10 p-6 rounded-xl border-2">
                                    <div className="grid grid-cols-2 gap-4">
                                      <div>
                                        <Label className="font-semibold">Client Name</Label>
                                        <p className="text-sm">{survey.client_name}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Company</Label>
                                        <p className="text-sm">{survey.company_name}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Email</Label>
                                        <p className="text-sm break-all">{survey.email}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Phone</Label>
                                        <p className="text-sm">{survey.phone}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Role</Label>
                                        <p className="text-sm">{survey.role}</p>
                                      </div>
                                      <div>
                                        <Label className="font-semibold">Industries</Label>
                                        <p className="text-sm">{survey.industries?.join(", ") || "N/A"}</p>
                                      </div>
                                    </div>
                                  </div>

                                  {survey.industry_other && (
                                    <div className="border-t pt-4">
                                      <h3 className="font-semibold mb-3">Additional Information</h3>
                                      <div className="space-y-3 text-sm">
                                        <div>
                                          <Label className="font-medium">Industry - Other</Label>
                                          <p className="text-muted-foreground">{survey.industry_other}</p>
                                        </div>
                                      </div>
                                    </div>
                                  )}

                                  <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-3">Business Information</h3>
                                    <div className="space-y-3 text-sm">
                                      <div>
                                        <Label className="font-medium">Business Goals</Label>
                                        <p className="text-muted-foreground">
                                          {survey.business_goals?.join(", ") || "N/A"}
                                        </p>
                                      </div>
                                      {survey.business_goals_other && (
                                        <div>
                                          <Label className="font-medium">Business Goals - Other</Label>
                                          <p className="text-muted-foreground">{survey.business_goals_other}</p>
                                        </div>
                                      )}
                                      <div>
                                        <Label className="font-medium">Slowdown Issues</Label>
                                        <p className="text-muted-foreground">
                                          {survey.slowdown_issues?.join(", ") || "N/A"}
                                        </p>
                                      </div>
                                      {survey.slowdown_issues_other && (
                                        <div>
                                          <Label className="font-medium">Slowdown Issues - Other</Label>
                                          <p className="text-muted-foreground">{survey.slowdown_issues_other}</p>
                                        </div>
                                      )}
                                      <div>
                                        <Label className="font-medium">Current Tools</Label>
                                        <p className="text-muted-foreground">
                                          {survey.current_tools?.join(", ") || "N/A"}
                                        </p>
                                      </div>
                                      {survey.current_tools_details && (
                                        <div>
                                          <Label className="font-medium">Tools - Details</Label>
                                          <p className="text-muted-foreground">{survey.current_tools_details}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-3">Marketing & Content Assessment</h3>
                                    <div className="space-y-3 text-sm">
                                      <div>
                                        <Label className="font-medium">Marketing Confidence</Label>
                                        <p className="text-muted-foreground">
                                          {survey.marketing_confidence
                                            ? survey.marketing_confidence === "yes"
                                              ? "Yes, very confident"
                                              : "No, somewhat confident / not sure / not confident"
                                            : "N/A"}
                                        </p>
                                      </div>
                                      {survey.marketing_details && (
                                        <div>
                                          <Label className="font-medium">Marketing Details</Label>
                                          <p className="text-muted-foreground">{survey.marketing_details}</p>
                                        </div>
                                      )}
                                      <div>
                                        <Label className="font-medium">Content Quality</Label>
                                        <p className="text-muted-foreground">
                                          {survey.content_quality
                                            ? survey.content_quality === "yes"
                                              ? "Yes, strongly"
                                              : "No, somewhat / not really / no consistent content"
                                            : "N/A"}
                                        </p>
                                      </div>
                                      {survey.content_details && (
                                        <div>
                                          <Label className="font-medium">Content Details</Label>
                                          <p className="text-muted-foreground">{survey.content_details}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-3">Assessment Details</h3>
                                    <div className="space-y-3 text-sm">
                                      <div>
                                        <Label className="font-medium">Customer Journey</Label>
                                        <p className="text-muted-foreground">
                                          {survey.customer_journey_details || "Not specified"}
                                        </p>
                                      </div>
                                      <div>
                                        <Label className="font-medium">Problem Areas</Label>
                                        <p className="text-muted-foreground">
                                          {survey.problem_areas?.join(", ") || "N/A"}
                                        </p>
                                      </div>
                                      {survey.problem_areas_details && (
                                        <div>
                                          <Label className="font-medium">Problem Areas - Details</Label>
                                          <p className="text-muted-foreground">{survey.problem_areas_details}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>

                                  <div className="border-t pt-4">
                                    <h3 className="font-semibold mb-3">Data & Solution Assessment</h3>
                                    <div className="space-y-3 text-sm">
                                      <div>
                                        <Label className="font-medium">Data & Analytics</Label>
                                        <p className="text-muted-foreground">
                                          {survey.data_analytics
                                            ? survey.data_analytics === "yes"
                                              ? "Yes, real-time dashboards"
                                              : "No, some reports / data exists but not analyzed / mostly guessing"
                                            : "N/A"}
                                        </p>
                                      </div>
                                      {survey.data_details && (
                                        <div>
                                          <Label className="font-medium">Data Details</Label>
                                          <p className="text-muted-foreground">{survey.data_details}</p>
                                        </div>
                                      )}
                                      <div>
                                        <Label className="font-medium">Solution Openness</Label>
                                        <p className="text-muted-foreground">
                                          {survey.solution_openness
                                            ? survey.solution_openness === "yes"
                                              ? "Yes, ready to act"
                                              : "No, interested but need guidance / budget concerns / not ready yet"
                                            : "N/A"}
                                        </p>
                                      </div>
                                      {survey.solution_details && (
                                        <div>
                                          <Label className="font-medium">Solution Details</Label>
                                          <p className="text-muted-foreground">{survey.solution_details}</p>
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>

                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadSurveyPDF(survey)}
                              disabled={downloadingId === survey.id}
                              className="border-2 border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 dark:border-cyan-800 dark:hover:bg-cyan-900/20"
                            >
                              {downloadingId === survey.id ? (
                                <Loader className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {totalPages > 1 && (
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 border-t bg-slate-50/50 dark:bg-slate-800/20">
                <p className="text-sm text-muted-foreground font-medium">
                  Page {currentPage} of {totalPages}
                </p>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                    disabled={currentPage === 1}
                    className="border-2"
                  >
                    <ChevronLeft className="w-4 h-4 mr-1" />
                    Previous
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                    disabled={currentPage === totalPages}
                    className="border-2"
                  >
                    Next
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
