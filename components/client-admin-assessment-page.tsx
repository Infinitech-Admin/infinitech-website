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
  Globe,
  TrendingUp,
  Target,
} from "lucide-react"
import { Input } from "@/components/ui/input"

interface ClientAssessment {
  id: number
  business_name: string
  industry_niche: string
  industry_niche_other: string
  business_type: string
  years_in_operation: string
  company_size: string
  company_size_other: string
  branches_locations: string
  geographic_scope: string
  geographic_scope_other: string
  has_physical_stores: boolean
  has_online_presence: boolean
  website_url: string
  website_type: string
  website_type_other: string
  website_condition: string
  page_speed: string
  mobile_responsive: boolean
  clear_cta: boolean
  google_brand_search: boolean
  non_brand_keywords: boolean
  has_blog_content: boolean
  meta_optimized: boolean
  seo_opportunity_level: string
  seo_notes: string
  google_ads_running: boolean
  search_ads_visible: boolean
  shopping_ads_visible: boolean
  display_ads_visible: boolean
  ad_quality: string
  paid_ads_opportunity: string
  paid_ads_opportunity_other: string
  facebook_status: string
  instagram_status: string
  tiktok_status: string
  linkedin_status: string
  other_social: string
  posting_frequency: string
  posting_frequency_other: string
  engagement_level: string
  online_purchasing_enabled: string
  payment_gateways_visible: string
  product_pages_optimized: string
  has_reviews_testimonials: string
  funnel_health: string
  funnel_health_other: string
  likely_client_intent: {
    lead_generation: boolean
    online_sales_growth: boolean
    brand_visibility: boolean
    website_traffic_increase: boolean
    market_expansion: boolean
    other: boolean
    other_text: string
  }
  inquiry_source: string
  inquiry_source_other: string
  social_media_links: string[]
  primary_recommendation: {
    website_development: boolean
    mobile_app_development: boolean
    seo: boolean
    google_ads: boolean
    seo_google_ads_bundle: boolean
    website_redesign: boolean
    analytics_conversion_tracking: boolean
    multimedia_services: boolean
    other: boolean
    other_text: string
  }
  secondary_recommendations: {
    landing_pages: boolean
    google_shopping_ads: boolean
    remarketing: boolean
    content_creation: boolean
    other: boolean
    other_text: string
  }
  contact_info: string
  location: string
  additional_notes: string
  created_at: string
}

const ITEMS_PER_PAGE = 10

export default function AdminClientAssessmentPage() {
  const router = useRouter()
  const { toast } = useToast()
  const [assessments, setAssessments] = useState<ClientAssessment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [selectedAssessment, setSelectedAssessment] = useState<ClientAssessment | null>(null)
  const [message, setMessage] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterBusinessType, setFilterBusinessType] = useState("all")
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [assessmentToDelete, setAssessmentToDelete] = useState<ClientAssessment | null>(null)
  const [deleting, setDeleting] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem("adminToken")
    if (!token) {
      router.push("/admin/login")
      return
    }

    fetchAssessments(token)
  }, [router])

  const fetchAssessments = async (token: string) => {
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/client-assessment`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch client assessments")
      }

      const data = await response.json()

      let assessmentsData = []
      if (data.success && data.data) {
        if (data.data.data && Array.isArray(data.data.data)) {
          assessmentsData = data.data.data
        } else if (Array.isArray(data.data)) {
          assessmentsData = data.data
        }
      }

      setAssessments(assessmentsData)
    } catch (error) {
      console.error("Error fetching assessments:", error)
      setMessage("Failed to load client assessments")
      setAssessments([])
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteAssessment = async () => {
    if (!assessmentToDelete) return

    const token = localStorage.getItem("adminToken")
    if (!token) return

    setDeleting(true)
    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000'
      const response = await fetch(`${apiUrl}/api/client-assessment/${assessmentToDelete.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to delete assessment")
      }

      toast({
        title: "Success",
        description: `Client assessment for ${assessmentToDelete.business_name} deleted successfully!`,
        variant: "default",
      })

      setAssessments(assessments.filter((a) => a.id !== assessmentToDelete.id))
      setDeleteDialogOpen(false)
      setAssessmentToDelete(null)
    } catch (error) {
      console.error("Error deleting assessment:", error)
      toast({
        title: "Error",
        description: "Failed to delete assessment. Please try again.",
        variant: "destructive",
      })
    } finally {
      setDeleting(false)
    }
  }

  const filteredAssessments = Array.isArray(assessments)
    ? assessments.filter((assessment) => {
        const matchesSearch =
          assessment.business_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          assessment.industry_niche?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          assessment.contact_info?.toLowerCase().includes(searchQuery.toLowerCase())

        const matchesFilter = filterBusinessType === "all" || assessment.business_type === filterBusinessType

        return matchesSearch && matchesFilter
      })
    : []

  const uniqueBusinessTypes = Array.isArray(assessments)
    ? Array.from(new Set(assessments.map((a) => a.business_type).filter(Boolean)))
    : []

  const stats = {
    total: Array.isArray(assessments) ? assessments.length : 0,
    withSEO: Array.isArray(assessments)
      ? assessments.filter((a) => a.seo_opportunity_level === "High" || a.seo_opportunity_level === "Medium").length
      : 0,
    withAds: Array.isArray(assessments) ? assessments.filter((a) => a.google_ads_running).length : 0,
    highPriority: Array.isArray(assessments)
      ? assessments.filter((a) => a.seo_opportunity_level === "High").length
      : 0,
  }

  const getRecommendations = (assessment: ClientAssessment) => {
    const recommendations: string[] = []
    if (assessment.primary_recommendation.website_development) recommendations.push("Website Dev")
    if (assessment.primary_recommendation.mobile_app_development) recommendations.push("Mobile App")
    if (assessment.primary_recommendation.seo) recommendations.push("SEO")
    if (assessment.primary_recommendation.google_ads) recommendations.push("Google Ads")
    if (assessment.primary_recommendation.seo_google_ads_bundle) recommendations.push("SEO + Ads Bundle")
    if (assessment.primary_recommendation.website_redesign) recommendations.push("Redesign")
    if (assessment.primary_recommendation.analytics_conversion_tracking) recommendations.push("Analytics")
    if (assessment.primary_recommendation.multimedia_services) recommendations.push("Multimedia")
    if (assessment.primary_recommendation.other && assessment.primary_recommendation.other_text) {
      recommendations.push(assessment.primary_recommendation.other_text)
    }
    return recommendations
  }

  const getClientIntents = (assessment: ClientAssessment) => {
    const intents: string[] = []
    if (assessment.likely_client_intent.lead_generation) intents.push("Lead Gen")
    if (assessment.likely_client_intent.online_sales_growth) intents.push("Sales Growth")
    if (assessment.likely_client_intent.brand_visibility) intents.push("Brand Visibility")
    if (assessment.likely_client_intent.website_traffic_increase) intents.push("Traffic")
    if (assessment.likely_client_intent.market_expansion) intents.push("Expansion")
    if (assessment.likely_client_intent.other && assessment.likely_client_intent.other_text) {
      intents.push(assessment.likely_client_intent.other_text)
    }
    return intents
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading client assessments...</p>
        </div>
      </div>
    )
  }

  const totalPages = Math.ceil(filteredAssessments.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedAssessments = filteredAssessments.slice(startIndex, endIndex)

  return (
    <div className="h-full bg-gradient-to-br from-slate-50 via-blue-50/30 to-purple-50/20 dark:from-slate-950 dark:via-blue-900/10 dark:to-purple-950/10">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-900 dark:to-purple-900 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
            <div>
              <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2 flex items-center gap-3">
                <Target className="h-8 w-8 sm:h-10 sm:w-10" />
                Client Assessments
              </h1>
              <p className="text-blue-100">Manage and view all client assessment submissions</p>
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
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Total Assessments</p>
                  <p className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">{stats.total}</p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl">
                  <BarChart3 className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-green-200 dark:border-green-800 hover:shadow-lg transition-shadow bg-white/80 dark:bg-slate-900/80 backdrop-blur">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">SEO Opportunities</p>
                  <p className="text-2xl sm:text-3xl font-bold text-green-600">{stats.withSEO}</p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-green-500 to-green-600 rounded-xl">
                  <TrendingUp className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-orange-200 dark:border-orange-800 hover:shadow-lg transition-shadow bg-white/80 dark:bg-slate-900/80 backdrop-blur">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">Running Ads</p>
                  <p className="text-2xl sm:text-3xl font-bold text-orange-600">{stats.withAds}</p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl">
                  <Globe className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-2 border-red-200 dark:border-red-800 hover:shadow-lg transition-shadow bg-white/80 dark:bg-slate-900/80 backdrop-blur">
            <CardContent className="p-4 sm:p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs sm:text-sm font-medium text-muted-foreground mb-1">High Priority</p>
                  <p className="text-2xl sm:text-3xl font-bold text-red-600">{stats.highPriority}</p>
                </div>
                <div className="p-2 sm:p-3 bg-gradient-to-br from-red-500 to-red-600 rounded-xl">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 text-white" />
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

        {/* Assessments Table */}
        <Card className="border-2 border-slate-200 dark:border-slate-800 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur">
          <CardHeader className="border-b bg-gradient-to-r from-slate-50 to-blue-50/30 dark:from-slate-800 dark:to-blue-900/10">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <CardTitle className="text-xl sm:text-2xl flex items-center gap-2">
                  <Target className="h-5 w-5 sm:h-6 sm:w-6 text-blue-600" />
                  All Assessments
                </CardTitle>
                <CardDescription className="mt-1">
                  Showing {startIndex + 1}-{Math.min(endIndex, filteredAssessments.length)} of{" "}
                  {filteredAssessments.length}
                </CardDescription>
              </div>
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1 sm:min-w-[200px]">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search assessments..."
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
                    <TableHead className="font-semibold hidden md:table-cell">Industry</TableHead>
                    <TableHead className="font-semibold hidden lg:table-cell">Recommendations</TableHead>
                    <TableHead className="font-semibold hidden xl:table-cell">SEO Level</TableHead>
                    <TableHead className="font-semibold hidden sm:table-cell">Date</TableHead>
                    <TableHead className="font-semibold">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {paginatedAssessments.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-12">
                        <div className="flex flex-col items-center gap-2">
                          <Target className="h-12 w-12 text-muted-foreground/50" />
                          <p className="text-muted-foreground font-medium">No client assessments found</p>
                          <p className="text-sm text-muted-foreground">Try adjusting your search or filters</p>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedAssessments.map((assessment) => {
                      const recommendations = getRecommendations(assessment)

                      return (
                        <TableRow
                          key={assessment.id}
                          className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors"
                        >
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-2">
                              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white text-sm font-medium flex-shrink-0">
                                {assessment.business_name?.charAt(0)?.toUpperCase() || "?"}
                              </div>
                              <div>
                                <div className="truncate">{assessment.business_name}</div>
                                <div className="text-xs text-muted-foreground">{assessment.business_type}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell className="hidden md:table-cell">
                            <Badge variant="outline">{assessment.industry_niche}</Badge>
                          </TableCell>
                          <TableCell className="hidden lg:table-cell">
                            <div className="flex gap-1 flex-wrap max-w-xs">
                              {recommendations.slice(0, 2).map((rec, idx) => (
                                <Badge key={idx} variant="secondary" className="text-xs">
                                  {rec}
                                </Badge>
                              ))}
                              {recommendations.length > 2 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{recommendations.length - 2}
                                </Badge>
                              )}
                            </div>
                          </TableCell>
                          <TableCell className="hidden xl:table-cell">
                            {assessment.seo_opportunity_level && (
                              <Badge
                                variant={
                                  assessment.seo_opportunity_level === "High"
                                    ? "destructive"
                                    : assessment.seo_opportunity_level === "Medium"
                                    ? "default"
                                    : "secondary"
                                }
                              >
                                {assessment.seo_opportunity_level}
                              </Badge>
                            )}
                          </TableCell>
                          <TableCell className="hidden sm:table-cell">
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                              <Calendar className="h-4 w-4" />
                              {new Date(assessment.created_at).toLocaleDateString()}
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setSelectedAssessment(assessment)}
                                    className="border-2 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800 dark:hover:bg-blue-900/20"
                                  >
                                    <Eye className="h-4 w-4" />
                                    <span className="hidden sm:inline ml-1">View</span>
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto border-2">
                                  <DialogHeader>
                                    <DialogTitle className="text-xl sm:text-2xl flex items-center gap-2">
                                      <Target className="h-6 w-6 text-blue-600" />
                                      Client Assessment Details
                                    </DialogTitle>
                                    <DialogDescription>
                                      Submitted: {new Date(selectedAssessment?.created_at || "").toLocaleString()}
                                    </DialogDescription>
                                  </DialogHeader>

                                  {selectedAssessment && (
                                    <div className="space-y-6 text-sm">
                                      {/* Basic Company Information */}
                                      <div className="border-b pb-4">
                                        <h3 className="font-bold text-lg mb-3 text-blue-600">Company Information</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <p className="font-semibold text-slate-700">Business Name</p>
                                            <p>{selectedAssessment.business_name}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-slate-700">Industry/Niche</p>
                                            <p>
                                              {selectedAssessment.industry_niche === "Other"
                                                ? selectedAssessment.industry_niche_other
                                                : selectedAssessment.industry_niche}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-slate-700">Business Type</p>
                                            <p>{selectedAssessment.business_type}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-slate-700">Years in Operation</p>
                                            <p>{selectedAssessment.years_in_operation}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-slate-700">Company Size</p>
                                            <p>
                                              {selectedAssessment.company_size === "Other"
                                                ? selectedAssessment.company_size_other
                                                : selectedAssessment.company_size}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-slate-700">Geographic Scope</p>
                                            <p>
                                              {selectedAssessment.geographic_scope === "Other"
                                                ? selectedAssessment.geographic_scope_other
                                                : selectedAssessment.geographic_scope}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="mt-3">
                                          <p className="font-semibold text-slate-700 mb-1">Presence</p>
                                          <div className="flex gap-2">
                                            {selectedAssessment.has_physical_stores && (
                                              <Badge variant="outline">Physical Stores</Badge>
                                            )}
                                            {selectedAssessment.has_online_presence && (
                                              <Badge variant="outline">Online Presence</Badge>
                                            )}
                                          </div>
                                        </div>
                                        {selectedAssessment.branches_locations && (
                                          <div className="mt-3">
                                            <p className="font-semibold text-slate-700">Branches/Locations</p>
                                            <p>{selectedAssessment.branches_locations}</p>
                                          </div>
                                        )}
                                      </div>

                                      {/* Website & Digital Assets */}
                                      <div className="border-b pb-4">
                                        <h3 className="font-bold text-lg mb-3 text-blue-600">Website & Digital Assets</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <p className="font-semibold text-slate-700">Website URL</p>
                                            <a
                                              href={selectedAssessment.website_url}
                                              target="_blank"
                                              rel="noopener noreferrer"
                                              className="text-blue-600 hover:underline break-all"
                                            >
                                              {selectedAssessment.website_url}
                                            </a>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-slate-700">Website Type</p>
                                            <p>
                                              {selectedAssessment.website_type === "Other"
                                                ? selectedAssessment.website_type_other
                                                : selectedAssessment.website_type}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-slate-700">Website Condition</p>
                                            <p>{selectedAssessment.website_condition}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-slate-700">Page Speed</p>
                                            <p>{selectedAssessment.page_speed}</p>
                                          </div>
                                        </div>
                                        <div className="mt-3">
                                          <p className="font-semibold text-slate-700 mb-1">Quick Checks</p>
                                          <div className="flex gap-2">
                                            {selectedAssessment.mobile_responsive && (
                                              <Badge variant="outline">Mobile Responsive</Badge>
                                            )}
                                            {selectedAssessment.clear_cta && <Badge variant="outline">Clear CTA</Badge>}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Search Visibility (SEO) */}
                                      <div className="border-b pb-4">
                                        <h3 className="font-bold text-lg mb-3 text-green-600">
                                          Search Visibility (SEO)
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                          <div>
                                            <p className="font-semibold text-slate-700">SEO Opportunity Level</p>
                                            <Badge
                                              variant={
                                                selectedAssessment.seo_opportunity_level === "High"
                                                  ? "destructive"
                                                  : selectedAssessment.seo_opportunity_level === "Medium"
                                                  ? "default"
                                                  : "secondary"
                                              }
                                            >
                                              {selectedAssessment.seo_opportunity_level}
                                            </Badge>
                                          </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2 mb-3">
                                          {selectedAssessment.google_brand_search && (
                                            <Badge variant="outline">Brand Search Visible</Badge>
                                          )}
                                          {selectedAssessment.non_brand_keywords && (
                                            <Badge variant="outline">Non-brand Keywords</Badge>
                                          )}
                                          {selectedAssessment.has_blog_content && (
                                            <Badge variant="outline">Has Blog</Badge>
                                          )}
                                          {selectedAssessment.meta_optimized && (
                                            <Badge variant="outline">Meta Optimized</Badge>
                                          )}
                                        </div>
                                        {selectedAssessment.seo_notes && (
                                          <div>
                                            <p className="font-semibold text-slate-700">SEO Notes</p>
                                            <p>{selectedAssessment.seo_notes}</p>
                                          </div>
                                        )}
                                      </div>

                                      {/* Google Ads / Paid Ads */}
                                      <div className="border-b pb-4">
                                        <h3 className="font-bold text-lg mb-3 text-orange-600">Google Ads / Paid Ads</h3>
                                        <div className="grid grid-cols-2 gap-4 mb-3">
                                          <div>
                                            <p className="font-semibold text-slate-700">Ad Quality</p>
                                            <p>{selectedAssessment.ad_quality || "N/A"}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-slate-700">Paid Ads Opportunity</p>
                                            <p>
                                              {selectedAssessment.paid_ads_opportunity === "Other"
                                                ? selectedAssessment.paid_ads_opportunity_other
                                                : selectedAssessment.paid_ads_opportunity || "N/A"}
                                            </p>
                                          </div>
                                        </div>
                                        <div className="flex flex-wrap gap-2">
                                          {selectedAssessment.google_ads_running && (
                                            <Badge variant="outline">Google Ads Running</Badge>
                                          )}
                                          {selectedAssessment.search_ads_visible && (
                                            <Badge variant="outline">Search Ads</Badge>
                                          )}
                                          {selectedAssessment.shopping_ads_visible && (
                                            <Badge variant="outline">Shopping Ads</Badge>
                                          )}
                                          {selectedAssessment.display_ads_visible && (
                                            <Badge variant="outline">Display Ads</Badge>
                                          )}
                                        </div>
                                      </div>

                                      {/* Social Media Presence */}
                                      <div className="border-b pb-4">
                                        <h3 className="font-bold text-lg mb-3 text-purple-600">Social Media Presence</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <p className="font-semibold text-slate-700">Facebook</p>
                                            <Badge variant="outline">{selectedAssessment.facebook_status || "N/A"}</Badge>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-slate-700">Instagram</p>
                                            <Badge variant="outline">{selectedAssessment.instagram_status || "N/A"}</Badge>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-slate-700">TikTok</p>
                                            <Badge variant="outline">{selectedAssessment.tiktok_status || "N/A"}</Badge>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-slate-700">LinkedIn</p>
                                            <Badge variant="outline">{selectedAssessment.linkedin_status || "N/A"}</Badge>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-slate-700">Posting Frequency</p>
                                            <p>
                                              {selectedAssessment.posting_frequency === "Other"
                                                ? selectedAssessment.posting_frequency_other
                                                : selectedAssessment.posting_frequency || "N/A"}
                                            </p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-slate-700">Engagement Level</p>
                                            <p>{selectedAssessment.engagement_level || "N/A"}</p>
                                          </div>
                                        </div>
                                        {selectedAssessment.social_media_links &&
                                          selectedAssessment.social_media_links.length > 0 && (
                                            <div className="mt-3">
                                              <p className="font-semibold text-slate-700 mb-2">Social Media Links</p>
                                              <div className="space-y-1">
                                                {selectedAssessment.social_media_links
                                                  .filter((link) => link)
                                                  .map((link, idx) => (
                                                    <a
                                                      key={idx}
                                                      href={link}
                                                      target="_blank"
                                                      rel="noopener noreferrer"
                                                      className="text-blue-600 hover:underline break-all block text-sm"
                                                    >
                                                      {link}
                                                    </a>
                                                  ))}
                                              </div>
                                            </div>
                                          )}
                                      </div>

                                      {/* E-commerce / Sales Funnel */}
                                      <div className="border-b pb-4">
                                        <h3 className="font-bold text-lg mb-3 text-teal-600">
                                          E-commerce / Sales Funnel
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                          <div>
                                            <p className="font-semibold text-slate-700">Online Purchasing</p>
                                            <p>{selectedAssessment.online_purchasing_enabled || "N/A"}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-slate-700">Payment Gateways</p>
                                            <p>{selectedAssessment.payment_gateways_visible || "N/A"}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-slate-700">Product Pages Optimized</p>
                                            <p>{selectedAssessment.product_pages_optimized || "N/A"}</p>
                                          </div>
                                          <div>
                                            <p className="font-semibold text-slate-700">Reviews/Testimonials</p>
                                            <p>{selectedAssessment.has_reviews_testimonials || "N/A"}</p>
                                          </div>
                                          <div className="col-span-2">
                                            <p className="font-semibold text-slate-700">Funnel Health</p>
                                            <p>
                                              {selectedAssessment.funnel_health === "Other"
                                                ? selectedAssessment.funnel_health_other
                                                : selectedAssessment.funnel_health || "N/A"}
                                            </p>
                                          </div>
                                        </div>
                                      </div>

                                      {/* Client Intent */}
                                      <div className="border-b pb-4">
                                        <h3 className="font-bold text-lg mb-3 text-indigo-600">Client Intent</h3>
                                        <div className="flex flex-wrap gap-2">
                                          {getClientIntents(selectedAssessment).map((intent, idx) => (
                                            <Badge key={idx} variant="secondary">
                                              {intent}
                                            </Badge>
                                          ))}
                                        </div>
                                      </div>

                                      {/* Service Recommendations */}
                                      <div className="border-b pb-4">
                                        <h3 className="font-bold text-lg mb-3 text-pink-600">Service Recommendations</h3>
                                        <div className="mb-4">
                                          <p className="font-semibold text-slate-700 mb-2">Primary Recommendations</p>
                                          <div className="flex flex-wrap gap-2">
                                            {getRecommendations(selectedAssessment).map((rec, idx) => (
                                              <Badge key={idx} variant="default">
                                                {rec}
                                              </Badge>
                                            ))}
                                          </div>
                                        </div>
                                        <div>
                                          <p className="font-semibold text-slate-700 mb-2">Secondary Recommendations</p>
                                          <div className="flex flex-wrap gap-2">
                                            {selectedAssessment.secondary_recommendations.landing_pages && (
                                              <Badge variant="outline">Landing Pages</Badge>
                                            )}
                                            {selectedAssessment.secondary_recommendations.google_shopping_ads && (
                                              <Badge variant="outline">Google Shopping Ads</Badge>
                                            )}
                                            {selectedAssessment.secondary_recommendations.remarketing && (
                                              <Badge variant="outline">Remarketing</Badge>
                                            )}
                                            {selectedAssessment.secondary_recommendations.content_creation && (
                                              <Badge variant="outline">Content Creation</Badge>
                                            )}
                                            {selectedAssessment.secondary_recommendations.other &&
                                              selectedAssessment.secondary_recommendations.other_text && (
                                                <Badge variant="outline">
                                                  {selectedAssessment.secondary_recommendations.other_text}
                                                </Badge>
                                              )}
                                          </div>
                                        </div>
                                      </div>

                                      {/* Additional Information */}
                                      <div>
                                        <h3 className="font-bold text-lg mb-3 text-slate-700">Additional Information</h3>
                                        <div className="space-y-3">
                                          <div>
                                            <p className="font-semibold text-slate-700">Contact Information</p>
                                            <p>{selectedAssessment.contact_info}</p>
                                          </div>
                                          {selectedAssessment.location && (
                                            <div>
                                              <p className="font-semibold text-slate-700">Location</p>
                                              <p>{selectedAssessment.location}</p>
                                            </div>
                                          )}
                                          {selectedAssessment.additional_notes && (
                                            <div>
                                              <p className="font-semibold text-slate-700">Additional Notes</p>
                                              <p className="whitespace-pre-wrap">{selectedAssessment.additional_notes}</p>
                                            </div>
                                          )}
                                        </div>
                                      </div>
                                    </div>
                                  )}
                                </DialogContent>
                              </Dialog>

                              <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                                <DialogTrigger asChild>
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setAssessmentToDelete(assessment)}
                                    className="border-2 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800 dark:hover:bg-red-900/20"
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </DialogTrigger>
                                <DialogContent>
                                  <DialogHeader>
                                    <DialogTitle>Delete Client Assessment</DialogTitle>
                                    <DialogDescription>
                                      Are you sure you want to delete the assessment for{" "}
                                      {assessmentToDelete?.business_name}? This action cannot be undone.
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
                                    <Button
                                      variant="destructive"
                                      onClick={handleDeleteAssessment}
                                      disabled={deleting}
                                    >
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
