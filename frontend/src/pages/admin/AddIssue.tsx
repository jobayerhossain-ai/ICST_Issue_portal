import { useState, useEffect, useRef } from "react";
import { useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Link as LinkIcon,
  Image as ImageIcon,
  X,
  Tag,
  MapPin,
} from "lucide-react";

import { ISSUE_CATEGORIES } from "@/config/constants";
import { useToast } from "@/hooks/use-toast";

import api from "@/services/api";

const AddIssue = () => {
  const { toast } = useToast();
  const [params] = useSearchParams();
  const editId = params.get("id");

  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);

  const [preview, setPreview] = useState<string | null>(null);
  const [imagePath, setImagePath] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "",
    location: "",
    status: "open",
    evidence: "",
  });

  // Load issue for edit mode
  useEffect(() => {
    if (!editId) return;

    setIsEditing(true);

    const loadIssue = async () => {
      try {
        const { data } = await api.get(`/issues/${editId}`);
        setFormData(data);
        if (data.evidence) {
          setPreview(data.evidence);
        }
      } catch (error) {
        console.error("Failed to load issue", error);
      }
    };

    loadIssue();
  }, [editId]);

  // Upload image (drag or file input)
  const handleImageUpload = async (file: File) => {
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Maximum allowed size is 5MB.",
        variant: "destructive",
      });
      return;
    }

    // Instant preview
    setPreview(URL.createObjectURL(file));

    const formData = new FormData();
    formData.append('file', file);

    try {
      const { data } = await api.post('/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Construct full URL if backend returns relative path
      const fullUrl = `http://localhost:5000${data}`;
      setFormData((prev) => ({ ...prev, evidence: fullUrl }));
      setImagePath(data);

      toast({
        title: "Image uploaded",
        description: "Your image has been uploaded successfully.",
      });
    } catch (error) {
      console.error("Upload failed", error);
      toast({
        title: "Upload failed",
        description: "Failed to upload image.",
        variant: "destructive",
      });
    }
  };

  // URL preview
  const handleImageUrlChange = (url: string) => {
    setFormData({ ...formData, evidence: url });
    setPreview(url || null);
    setImagePath(null);
  };

  // Remove image
  const handleRemoveImage = async () => {
    setPreview(null);
    setFormData({ ...formData, evidence: "" });
    setImagePath(null);

    toast({
      title: "Image removed",
      description: "Image deleted successfully.",
    });
  };

  // Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (isEditing && editId) {
        await api.put(`/issues/${editId}`, { ...formData });
        toast({ title: "Success!", description: "Issue updated successfully" });
      } else {
        await api.post('/issues', {
          ...formData,
          votes: { good: 0, bad: 0 },
          views: 0,
        });

        toast({ title: "Success!", description: "Issue added successfully" });
      }

      // Reset
      setFormData({
        title: "",
        description: "",
        category: "",
        location: "",
        status: "open",
        evidence: "",
      });

      setPreview(null);
      setImagePath(null);
    } catch (err) {
      toast({
        title: "Error",
        description: "Something went wrong.",
        variant: "destructive",
      });
    }

    setIsSubmitting(false);
  };

  return (
    <div className="p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl"
      >
        <h1 className="text-3xl font-bold mb-6 bg-gradient-to-r from-neon-cyan to-neon-purple bg-clip-text text-transparent">
          {isEditing ? "Edit Issue" : "Add New Issue"}
        </h1>

        <form onSubmit={handleSubmit} className="glass-card p-6 space-y-6">
          {/* Title */}
          <input
            type="text"
            required
            value={formData.title}
            onChange={(e) =>
              setFormData({ ...formData, title: e.target.value })
            }
            placeholder="Issue title..."
            className="w-full px-4 py-3 bg-background border rounded-lg"
          />

          {/* Category & Status */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <select
              required
              value={formData.category}
              onChange={(e) =>
                setFormData({ ...formData, category: e.target.value })
              }
              className="px-4 py-3 bg-background border rounded-lg"
            >
              <option value="">Select category</option>
              {ISSUE_CATEGORIES.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>

            <select
              required
              value={formData.status}
              onChange={(e) =>
                setFormData({ ...formData, status: e.target.value })
              }
              className="px-4 py-3 bg-background border rounded-lg"
            >
              <option value="open">Open</option>
              <option value="verified">Verified</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>
          </div>

          {/* Location */}
          <input
            required
            value={formData.location}
            onChange={(e) =>
              setFormData({ ...formData, location: e.target.value })
            }
            placeholder="Location..."
            className="w-full px-4 py-3 bg-background border rounded-lg"
          />

          {/* Description */}
          <textarea
            required
            rows={6}
            value={formData.description}
            onChange={(e) =>
              setFormData({ ...formData, description: e.target.value })
            }
            placeholder="Detailed description..."
            className="w-full px-4 py-3 bg-background border rounded-lg"
          />

          {/* IMAGE UPLOAD */}
          <div className="space-y-4">

            {/* Hidden file input */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) handleImageUpload(file);
              }}
            />

            {/* Drag & Drop box */}
            <div
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault();
                const file = e.dataTransfer.files?.[0];
                if (file) handleImageUpload(file);
              }}
              onClick={() => fileInputRef.current?.click()}
              className="w-full border-2 border-dashed border-primary/40 hover:border-primary rounded-lg p-6 text-center cursor-pointer transition"
            >
              <ImageIcon size={38} className="mx-auto opacity-70 mb-2" />
              <p className="font-medium">Drag & drop image</p>
              <p className="text-xs opacity-70">or click to browse (max 5MB)</p>
            </div>

            {/* URL input */}
            <div>
              <label className="font-medium flex items-center gap-2 mb-1">
                <LinkIcon size={18} /> Or paste image URL
              </label>
              <input
                type="url"
                value={formData.evidence}
                onChange={(e) => handleImageUrlChange(e.target.value)}
                placeholder="https://example.com/image.jpg"
                className="w-full px-4 py-3 bg-background border rounded-lg"
              />
            </div>

            {/* Preview */}
            {preview && (
              <div className="relative w-fit">
                <img
                  src={preview}
                  alt="Issue evidence preview"
                  className="w-48 rounded-lg border"
                />
                <button
                  type="button"
                  onClick={handleRemoveImage}
                  className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1"
                >
                  <X size={14} />
                </button>
              </div>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-gradient-to-r from-neon-cyan to-neon-purple text-primary-foreground rounded-lg font-semibold"
          >
            {isSubmitting
              ? "Processing..."
              : isEditing
                ? "Update Issue"
                : "Add Issue"}
          </button>
        </form>
      </motion.div>
    </div>
  );
};

export default AddIssue;
