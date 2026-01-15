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
  Video,
  Trash2,
  Download,
} from "lucide-react"
import { Input } from "@/components/ui/input"

interface VideoSurvey {
  id: number
  survey_id: string
  company_name: string
  industry: string
  company_different: string
  brand_words: string
  video_purpose: string[]
  video_purpose_other: string
  viewer_action: string
  target_audience: string[]
  audience_matters: string[]
  preferred_style: string[]
  preferred_style_other: string
  preferred_format: string[]
  video_inclusions: string[]
  video_inclusions_other: string
  video_length: string[]
  video_length_other: string
  video_usage: string[]
  subtitles: string[]
  created_at: string
}

const ITEMS_PER_PAGE = 10

export default function AdminVideoSurveyPageContent() {
  const router = useRouter()
  const { toast } = useToast()
  const [surveys, setSurveys] = useState<VideoSurvey[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedSurvey, setSelectedSurvey] = useState<VideoSurvey | null>(null)
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterIndustry, setFilterIndustry] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [surveyToDelete, setSurveyToDelete] = useState<VideoSurvey | null>(null)
  const [deleting, setDeleting] = useState(false)
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
      const response = await fetch("/api/videoSurvey")

      if (!response.ok) {
        throw new Error("Failed to fetch video surveys")
      }

      const data = await response.json()
      
      // Handle different response structures
      let surveysData = []
      if (data.success && data.data) {
        // If data.data is paginated (has .data property)
        if (data.data.data && Array.isArray(data.data.data)) {
          surveysData = data.data.data
        } 
        // If data.data is directly an array
        else if (Array.isArray(data.data)) {
          surveysData = data.data
        }
      }
      
      console.log("Fetched surveys:", surveysData)
      setSurveys(surveysData)
    } catch (error) {
      console.error("Error fetching surveys:", error)
      setMessage("Failed to load video surveys")
      setSurveys([])
    } finally {
      setLoading(false)
    }
  }
 const downloadSurveyPDF = async (survey: VideoSurvey) => {
    setDownloadingId(survey.id)
    try {
      const { generateVideoSurveyPDF } = await import("@/lib/video-survey-pdf-generator")
      await generateVideoSurveyPDF(survey)
      toast({
        title: "Success",
        description: "PDF downloaded successfully!",
        variant: "default",
      })
    } catch (error) {
      console.error("Error generating PDF:", error)
      toast({
        title: "Error",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDownloadingId(null)
    }
  }
  const handleDeleteSurvey = async () => {
    if (!surveyToDelete) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/videoSurvey/${surveyToDelete.id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete survey")
      }

      toast({
        title: "Success",
        description: `Video survey for ${surveyToDelete.company_name} deleted successfully!`,
        variant: "default",
      })

      setSurveys(surveys.filter((s) => s.id !== surveyToDelete.id))

      setDeleteDialogOpen(false)
      setSurveyToDelete(null)
    } catch (error) {
      console.error("Error deleting survey:", error)
      toast({
        title: "Error",
        description: "Failed to delete survey. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const filteredSurveys = Array.isArray(surveys) ? surveys.filter((survey) => {
    const matchesSearch =
      survey.company_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      survey.industry?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      survey.survey_id?.toLowerCase().includes(searchQuery.toLowerCase())

    const matchesFilter = filterIndustry === "all" || survey.industry === filterIndustry

    return matchesSearch && matchesFilter
  }) : []

  const uniqueIndustries = Array.isArray(surveys) 
    ? Array.from(new Set(surveys.map((s) => s.industry).filter(Boolean))) 
    : []

  const stats = {
    total: Array.isArray(surveys) ? surveys.length : 0,
    submitted: Array.isArray(surveys) ? surveys.length : 0,
    completed: Array.isArray(surveys) ? surveys.filter((s) => s.company_different).length : 0,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading video surveys...</p>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(filteredSurveys.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedSurveys = filteredSurveys.slice(startIndex, endIndex)

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-900/10 dark:to-purple-950/10">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Video className="h-8 w-8 sm:h-10 sm:w-10" />
                Video Survey Responses
              </h1>
              <p className="text-blue-100">Manage and view all video survey responses</p>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-8">
          <Card className="border-2 border-slate-200 dark:border-slate-800 hover:shadow-lg transition-shadow bg-white/80 dark:bg-slate-900/80 backdrop-blur">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Total Surveys</p>
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
                  <Video className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
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
                  <Video className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
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
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-900/10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <Video className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  All Video Surveys
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
                    <TableHead className="font-semibold">Survey ID</TableHead>
                    <TableHead className="font-semibold">Company</TableHead>
                    <TableHead className="font-semibold hidden md:table-cell">Industry</TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">Video Purpose</TableHead>
                    <TableHead className="font-semibold hidden sm:table-cell">Date</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedSurveys.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Video className="h-12 w-12 text-muted-foreground/50" />
                          <p className="text-muted-foreground font-medium">No video surveys found</p>
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
                        <TableCell className="font-mono text-xs">
                          {survey.survey_id}
                        </TableCell>
                        <TableCell className="font-medium">
                          <div className="flex items-center gap-2">
                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                              {survey.company_name?.charAt(0)?.toUpperCase() || '?'}
                            </div>
                            <span className="truncate">{survey.company_name}</span>
                          </div>
                        </TableCell>
                        <TableCell className="hidden md:table-cell">
                          <span className="truncate text-sm">{survey.industry}</span>
                        </TableCell>
                        <TableCell className="hidden lg:table-cell">
                          <div className="flex gap-1 flex-wrap max-w-xs">
                            {survey.video_purpose?.slice(0, 2).map((purpose) => (
                              <Badge key={purpose} variant="secondary" className="text-xs">
                                {purpose}
                              </Badge>
                            ))}
                            {survey.video_purpose && survey.video_purpose.length > 2 && (
                              <Badge variant="secondary" className="text-xs">
                                +{survey.video_purpose.length - 2}
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
                                  className="border-2 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:hover:bg-blue-900/20"
                                >
                                  <Eye className="h-4 w-4" />
                                  <span className="hidden sm:inline ml-1">View</span>
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto border-2">
                                <DialogHeader>
                                  <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
                                    <Video className="h-6 w-6 text-blue-600" />
                                    Video Survey Details
                                  </DialogTitle>
                                  <DialogDescription>
                                    Survey ID: {selectedSurvey?.survey_id} | Submitted: {new Date(selectedSurvey?.created_at || "").toLocaleString()}
                                  </DialogDescription>
                                </DialogHeader>

                                {selectedSurvey && (
                                  <div className="space-y-4 text-sm">
                                    <div className="grid grid-cols-2 gap-4 border-b pb-4">
                                      <div>
                                        <p className="font-semibold text-slate-700">Company Name</p>
                                        <p>{selectedSurvey.company_name}</p>
                                      </div>
                                      <div>
                                        <p className="font-semibold text-slate-700">Industry</p>
                                        <p>{selectedSurvey.industry}</p>
                                      </div>
                                    </div>

                                    <div className="space-y-4">
                                      <div>
                                        <p className="font-semibold text-slate-700 mb-2">
                                          Q1. What makes your company different from competitors?
                                        </p>
                                        <p className="text-slate-600">{selectedSurvey.company_different || 'N/A'}</p>
                                      </div>

                                      <div>
                                        <p className="font-semibold text-slate-700 mb-2">Q2. Brand in 3 words</p>
                                        <p className="text-slate-600">{selectedSurvey.brand_words || 'N/A'}</p>
                                      </div>

                                      <div>
                                        <p className="font-semibold text-slate-700 mb-2">Q3. Main purpose of video</p>
                                        <div className="flex flex-wrap gap-2">
                                          {selectedSurvey.video_purpose?.map((purpose) => (
                                            <Badge key={purpose}>{purpose}</Badge>
                                          ))}
                                        </div>
                                        {selectedSurvey.video_purpose_other && (
                                          <p className="text-slate-600 mt-2">Other: {selectedSurvey.video_purpose_other}</p>
                                        )}
                                      </div>

                                      <div>
                                        <p className="font-semibold text-slate-700 mb-2">Q4. Viewer action desired</p>
                                        <p className="text-slate-600">{selectedSurvey.viewer_action || 'N/A'}</p>
                                      </div>

                                      <div>
                                        <p className="font-semibold text-slate-700 mb-2">Q5. Target audience</p>
                                        <div className="flex flex-wrap gap-2">
                                          {selectedSurvey.target_audience?.map((age) => (
                                            <Badge key={age} variant="secondary">
                                              {age}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>

                                      <div>
                                        <p className="font-semibold text-slate-700 mb-2">Q6. What matters most</p>
                                        <div className="flex flex-wrap gap-2">
                                          {selectedSurvey.audience_matters?.map((matter) => (
                                            <Badge key={matter} variant="secondary">
                                              {matter}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>

                                      <div>
                                        <p className="font-semibold text-slate-700 mb-2">Q7. Style preference</p>
                                        <div className="flex flex-wrap gap-2">
                                          {selectedSurvey.preferred_style?.map((style) => (
                                            <Badge key={style}>{style}</Badge>
                                          ))}
                                        </div>
                                        {selectedSurvey.preferred_style_other && (
                                          <p className="text-slate-600 mt-2">Other: {selectedSurvey.preferred_style_other}</p>
                                        )}
                                      </div>

                                      <div>
                                        <p className="font-semibold text-slate-700 mb-2">Q8. Preferred format</p>
                                        <div className="flex flex-wrap gap-2">
                                          {selectedSurvey.preferred_format?.map((format) => (
                                            <Badge key={format} variant="secondary">
                                              {format}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>

                                      <div>
                                        <p className="font-semibold text-slate-700 mb-2">Q9. Content to include</p>
                                        <div className="flex flex-wrap gap-2">
                                          {selectedSurvey.video_inclusions?.map((content) => (
                                            <Badge key={content}>{content}</Badge>
                                          ))}
                                        </div>
                                        {selectedSurvey.video_inclusions_other && (
                                          <p className="text-slate-600 mt-2">Other: {selectedSurvey.video_inclusions_other}</p>
                                        )}
                                      </div>

                                      <div>
                                        <p className="font-semibold text-slate-700 mb-2">Q10. Preferred video length</p>
                                        <div className="flex flex-wrap gap-2">
                                          {selectedSurvey.video_length?.map((length) => (
                                            <Badge key={length} variant="secondary">
                                              {length}
                                            </Badge>
                                          ))}
                                        </div>
                                        {selectedSurvey.video_length_other && (
                                          <p className="text-slate-600 mt-2">Other: {selectedSurvey.video_length_other}</p>
                                        )}
                                      </div>

                                      <div>
                                        <p className="font-semibold text-slate-700 mb-2">
                                          Q11. Where will this video be used
                                        </p>
                                        <div className="flex flex-wrap gap-2">
                                          {selectedSurvey.video_usage?.map((usage) => (
                                            <Badge key={usage}>{usage}</Badge>
                                          ))}
                                        </div>
                                      </div>

                                      <div>
                                        <p className="font-semibold text-slate-700 mb-2">Q12. Subtitles needed</p>
                                        <div className="flex flex-wrap gap-2">
                                          {selectedSurvey.subtitles?.map((subtitle) => (
                                            <Badge key={subtitle} variant="secondary">
                                              {subtitle}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </DialogContent>
                            </Dialog>
<Button
                              variant="outline"
                              size="sm"
                              onClick={() => downloadSurveyPDF(survey)}
                              disabled={downloadingId === survey.id}
                              className="border-2 border-green-200 hover:bg-green-50 hover:text-green-700 dark:border-green-800 dark:hover:bg-green-900/20"
                            >
                              {downloadingId === survey.id ? (
                                <Loader className="h-4 w-4 animate-spin" />
                              ) : (
                                <Download className="h-4 w-4" />
                              )}
                            </Button>
                            <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                              <DialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => setSurveyToDelete(survey)}
                                  className="border-2 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-900/20"
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent className="border-2">
                                <DialogHeader>
                                  <DialogTitle>Delete Video Survey</DialogTitle>
                                  <DialogDescription>
                                    Are you sure you want to delete this survey? This action cannot be undone.
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="flex justify-end gap-2">
                                  <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                    Cancel
                                  </Button>
                                  <Button variant="destructive" onClick={handleDeleteSurvey} disabled={deleting}>
                                    {deleting ? (
                                      <>
                                        <Loader className="h-4 w-4 mr-2 animate-spin" />
                                        Deleting...
                                      </>
                                    ) : (
                                      "Delete"
                                    )}
                                  </Button>
                                </div>
                              </DialogContent>
                            </Dialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-6">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
            >
              <ChevronLeft className="h-4 w-4 mr-1" />
              Previous
            </Button>
            <div className="text-sm text-muted-foreground">
              Page {currentPage} of {totalPages}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
            >
              Next
              <ChevronRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
