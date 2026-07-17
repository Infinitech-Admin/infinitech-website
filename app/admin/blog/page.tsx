// 📁 Place this file at: app/admin/blog/page.tsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import {
  ChevronLeft,
  ChevronRight,
  Eye,
  FileText,
  Search,
  Plus,
  Pencil,
  Trash2,
  Loader,
  ImagePlus,
  Video,
  X,
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  API_URL,
  BlogPostRecord,
  fetchBlogPosts,
  createBlogPost,
  updateBlogPost,
  deleteBlogPost,
} from "@/lib/api";
import { uploadMultipleImages, uploadFileInChunks } from "@/lib/chunkedUpload";

const ITEMS_PER_PAGE = 10;

type FormState = {
  id: number | null;
  title: string;
  description: string;
  content: string;
  category: string;
  author: string;
  is_published: boolean;
  images: string[];
  image_urls: string[];
  video_path: string | null;
  video_url: string | null;
};

const emptyForm: FormState = {
  id: null,
  title: "",
  description: "",
  content: "",
  category: "",
  author: "",
  is_published: true,
  images: [],
  image_urls: [],
  video_path: null,
  video_url: null,
};

export default function BlogAdminPage() {
  const router = useRouter();
  const [posts, setPosts] = useState<BlogPostRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [message, setMessage] = useState("");

  const [viewPost, setViewPost] = useState<BlogPostRecord | null>(null);

  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [saving, setSaving] = useState(false);

  const [imageUploading, setImageUploading] = useState(false);
  const [imageProgress, setImageProgress] = useState(0);
  const [videoUploading, setVideoUploading] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);

  // Delete confirmation dialog state
  const [deleteTarget, setDeleteTarget] = useState<BlogPostRecord | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("adminToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }
    loadPosts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router, currentPage]);

  const loadPosts = async () => {
    setLoading(true);
    try {
      const res = await fetchBlogPosts({
        search: searchQuery || undefined,
        page: currentPage,
        per_page: ITEMS_PER_PAGE,
      });
      setPosts(res.data);
      setTotalPages(res.last_page);
      setTotalCount(res.total);
    } catch (error) {
      console.error("Error fetching blog posts:", error);
      setMessage(
        `Failed to load blog posts: ${error instanceof Error ? error.message : "Unknown error"}`,
      );
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  // Re-search when the query changes (debounced-ish via page reset)
  useEffect(() => {
    const t = setTimeout(() => {
      setCurrentPage(1);
      loadPosts();
    }, 350);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  const openCreateForm = () => {
    setForm(emptyForm);
    setFormOpen(true);
  };

  const openEditForm = (post: BlogPostRecord) => {
    setForm({
      id: post.id,
      title: post.title,
      description: post.description,
      content: post.content || "",
      category: post.category || "",
      author: post.author || "",
      is_published: post.is_published,
      images: post.images || [],
      image_urls: post.image_urls || [],
      video_path: post.video_path,
      video_url: post.video_url,
    });
    setFormOpen(true);
  };

  // Handles one or many files selected at once -- each is uploaded as its
  // own direct request to Laravel, in parallel, then appended to the array.
  const handleImageSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    setImageUploading(true);
    setImageProgress(0);
    try {
      const results = await uploadMultipleImages(files, setImageProgress);
      setForm((f) => ({
        ...f,
        images: [...f.images, ...results.map((r) => r.path)],
        image_urls: [...f.image_urls, ...results.map((r) => r.url)],
      }));
    } catch (error) {
      console.error(error);
      setMessage("One or more images failed to upload.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setImageUploading(false);
      e.target.value = "";
    }
  };

  const removeImageAt = (index: number) => {
    setForm((f) => ({
      ...f,
      images: f.images.filter((_, i) => i !== index),
      image_urls: f.image_urls.filter((_, i) => i !== index),
    }));
  };

  const handleVideoSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setVideoUploading(true);
    setVideoProgress(0);
    try {
      // Large files go through chunked upload -- never hits any 4MB limit,
      // because it never passes through a Next.js API route.
      const result = await uploadFileInChunks(file, setVideoProgress);
      setForm((f) => ({
        ...f,
        video_path: result.path,
        video_url: result.url,
      }));
    } catch (error) {
      console.error(error);
      setMessage("Video upload failed.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setVideoUploading(false);
      e.target.value = "";
    }
  };

  const saveForm = async () => {
    if (!form.title.trim() || !form.description.trim()) {
      setMessage("Title and description are required.");
      setTimeout(() => setMessage(""), 3000);
      return;
    }

    setSaving(true);
    try {
      const payload = {
        title: form.title,
        description: form.description,
        content: form.content || null,
        category: form.category || null,
        author: form.author || null,
        is_published: form.is_published,
        images: form.images,
        video_path: form.video_path,
      };

      if (form.id) {
        await updateBlogPost(form.id, payload);
        setMessage("Blog post updated successfully!");
      } else {
        await createBlogPost(payload);
        setMessage("Blog post created successfully!");
      }

      setFormOpen(false);
      setForm(emptyForm);
      loadPosts();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error saving blog post:", error);
      setMessage("Failed to save blog post.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      await deleteBlogPost(deleteTarget.id);
      setMessage("Blog post deleted successfully!");
      setDeleteTarget(null);
      loadPosts();
      setTimeout(() => setMessage(""), 3000);
    } catch (error) {
      console.error("Error deleting blog post:", error);
      setMessage("Failed to delete blog post.");
      setTimeout(() => setMessage(""), 3000);
    } finally {
      setDeleting(false);
    }
  };

  if (loading && posts.length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin mb-4 inline-block">
            <FileText className="h-8 w-8 text-cyan-600" />
          </div>
          <p className="text-muted-foreground">Loading blog posts...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <FileText className="h-5 w-5 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white">
                Blog Posts
              </h1>
              <p className="text-muted-foreground">
                Create, edit, and manage blog content
              </p>
            </div>
          </div>
          <Button
            onClick={openCreateForm}
            className="bg-cyan-600 hover:bg-cyan-700"
          >
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Button>
        </div>

        {message && (
          <Alert className="mb-4 bg-blue-50 dark:bg-blue-950 border-blue-200 dark:border-blue-800">
            <AlertDescription className="text-blue-800 dark:text-blue-200">
              {message}
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-6 border-2">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, author, or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 overflow-hidden">
          <CardHeader className="bg-gradient-to-r from-cyan-50 to-blue-50 dark:from-cyan-950 dark:to-blue-950 border-b-2">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>All Posts</CardTitle>
                <CardDescription>
                  Showing {posts.length} of {totalCount} posts
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-slate-100 dark:bg-slate-800">
                    <TableHead className="font-bold">ID</TableHead>
                    <TableHead className="font-bold">Status</TableHead>
                    <TableHead className="font-bold">Title</TableHead>
                    <TableHead className="font-bold">Category</TableHead>
                    <TableHead className="font-bold">Author</TableHead>
                    <TableHead className="font-bold">Media</TableHead>
                    <TableHead className="font-bold">Created</TableHead>
                    <TableHead className="font-bold text-center">
                      Actions
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {posts.map((post) => (
                    <TableRow
                      key={post.id}
                      className="hover:bg-cyan-50/50 dark:hover:bg-cyan-900/20 border-b"
                    >
                      <TableCell className="font-bold text-cyan-600">
                        {post.id}
                      </TableCell>
                      <TableCell>
                        {post.is_published ? (
                          <Badge className="bg-green-500 hover:bg-green-600">
                            Published
                          </Badge>
                        ) : (
                          <Badge variant="secondary">Draft</Badge>
                        )}
                      </TableCell>
                      <TableCell className="font-medium max-w-[220px] truncate">
                        {post.title}
                      </TableCell>
                      <TableCell className="text-sm">
                        {post.category || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm">
                        {post.author || "N/A"}
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="flex items-center gap-2">
                          {post.image_urls?.length > 0 && (
                            <span className="flex items-center gap-1 text-green-600">
                              <ImagePlus className="h-4 w-4" />
                              {post.image_urls.length}
                            </span>
                          )}
                          {post.video_url && (
                            <Video className="h-4 w-4 text-blue-600" />
                          )}
                          {(!post.image_urls || post.image_urls.length === 0) &&
                            !post.video_url &&
                            "—"}
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(post.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-center">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setViewPost(post)}
                                className="border-2 border-cyan-200 hover:bg-cyan-50 hover:text-cyan-700 dark:border-cyan-800"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            {viewPost?.id === post.id && (
                              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                                <DialogHeader>
                                  <DialogTitle>{post.title}</DialogTitle>
                                  <DialogDescription>
                                    {post.category || "Uncategorized"} ·{" "}
                                    {post.author || "Unknown author"} ·{" "}
                                    {new Date(post.created_at).toLocaleString()}
                                  </DialogDescription>
                                </DialogHeader>
                                <div className="space-y-4">
                                  {post.image_urls?.length > 0 && (
                                    <div className="grid grid-cols-3 gap-2">
                                      {post.image_urls.map((url, i) => (
                                        // eslint-disable-next-line @next/next/no-img-element
                                        <img
                                          key={i}
                                          src={url}
                                          alt={`${post.title} ${i + 1}`}
                                          className="w-full h-28 rounded-lg object-cover"
                                        />
                                      ))}
                                    </div>
                                  )}
                                  {post.video_url && (
                                    <video
                                      src={post.video_url}
                                      controls
                                      className="w-full rounded-lg max-h-72"
                                    />
                                  )}
                                  <p className="text-sm text-slate-600 dark:text-slate-300">
                                    {post.description}
                                  </p>
                                  {post.content && (
                                    <div className="text-sm whitespace-pre-line border-t pt-3">
                                      {post.content}
                                    </div>
                                  )}
                                </div>
                              </DialogContent>
                            )}
                          </Dialog>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => openEditForm(post)}
                            className="border-2 border-blue-200 hover:bg-blue-50 hover:text-blue-700 dark:border-blue-800"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>

                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setDeleteTarget(post)}
                            className="border-2 border-red-200 hover:bg-red-50 hover:text-red-700 dark:border-red-800"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {posts.length === 0 && (
                    <TableRow>
                      <TableCell
                        colSpan={8}
                        className="text-center py-10 text-muted-foreground"
                      >
                        No blog posts found.
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
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4 mr-1" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  setCurrentPage(Math.min(totalPages, currentPage + 1))
                }
                disabled={currentPage === totalPages}
              >
                Next
                <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </div>
        )}

        {/* Create / Edit dialog */}
        <Dialog open={formOpen} onOpenChange={setFormOpen}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{form.id ? "Edit Post" : "New Post"}</DialogTitle>
              <DialogDescription>
                {form.id
                  ? "Update this blog post"
                  : "Fill in the details to publish a new blog post"}
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input
                  id="title"
                  value={form.title}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, title: e.target.value }))
                  }
                  placeholder="Post title"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={form.category}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, category: e.target.value }))
                    }
                    placeholder="e.g. News"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="author">Author</Label>
                  <Input
                    id="author"
                    value={form.author}
                    onChange={(e) =>
                      setForm((f) => ({ ...f, author: e.target.value }))
                    }
                    placeholder="Author name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Short Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, description: e.target.value }))
                  }
                  placeholder="Short summary shown on the blog card..."
                  rows={2}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="content">Full Content</Label>
                <Textarea
                  id="content"
                  value={form.content}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, content: e.target.value }))
                  }
                  placeholder="Full post body..."
                  rows={8}
                />
              </div>

              {/* Image upload -- multiple images supported */}
              <div className="space-y-2">
                <Label>Images</Label>

                {form.image_urls.length > 0 && (
                  <div className="grid grid-cols-4 gap-2">
                    {form.image_urls.map((url, i) => (
                      <div key={i} className="relative">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={url}
                          alt={`Image ${i + 1}`}
                          className="h-20 w-full rounded-lg object-cover border"
                        />
                        <button
                          type="button"
                          onClick={() => removeImageAt(i)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageSelect}
                  disabled={imageUploading}
                />
                <p className="text-xs text-muted-foreground">
                  Select multiple files at once to upload a gallery. Each is
                  uploaded directly to the backend, in parallel.
                </p>
                {imageUploading && (
                  <div className="text-xs text-muted-foreground flex items-center gap-2">
                    <Loader className="h-3 w-3 animate-spin" />
                    Uploading... {imageProgress}%
                  </div>
                )}
              </div>

              {/* Video upload (chunked) */}
              <div className="space-y-2">
                <Label>Video (optional, uploaded in chunks)</Label>
                {form.video_url ? (
                  <div className="relative w-fit">
                    <video
                      src={form.video_url}
                      controls
                      className="h-32 rounded-lg border"
                    />
                    <button
                      type="button"
                      onClick={() =>
                        setForm((f) => ({
                          ...f,
                          video_path: null,
                          video_url: null,
                        }))
                      }
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Input
                      type="file"
                      accept="video/*"
                      onChange={handleVideoSelect}
                    />
                    {videoUploading && (
                      <div className="mt-2 text-xs text-muted-foreground flex items-center gap-2">
                        <Loader className="h-3 w-3 animate-spin" />
                        Uploading in chunks... {videoProgress}%
                      </div>
                    )}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  id="is_published"
                  checked={form.is_published}
                  onCheckedChange={(checked) =>
                    setForm((f) => ({ ...f, is_published: checked }))
                  }
                />
                <Label htmlFor="is_published">Published</Label>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setFormOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={saveForm}
                disabled={saving || imageUploading || videoUploading}
                className="bg-cyan-600 hover:bg-cyan-700"
              >
                {saving ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Saving...
                  </>
                ) : form.id ? (
                  "Save Changes"
                ) : (
                  "Create Post"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Delete confirmation dialog */}
        <Dialog
          open={deleteTarget !== null}
          onOpenChange={(open) => !open && setDeleteTarget(null)}
        >
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Delete this post?</DialogTitle>
              <DialogDescription>
                {deleteTarget && (
                  <>
                    You&apos;re about to permanently delete{" "}
                    <span className="font-semibold text-slate-700 dark:text-slate-200">
                      &ldquo;{deleteTarget.title}&rdquo;
                    </span>
                    . This cannot be undone.
                  </>
                )}
              </DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setDeleteTarget(null)}
                disabled={deleting}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={deleting}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleting ? (
                  <>
                    <Loader className="h-4 w-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete Post"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
