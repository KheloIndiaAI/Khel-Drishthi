import { useState, useRef, useCallback } from "react";
import { Paperclip, Upload, Info, X, Image, FileText, Loader2, Eye, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import type { FormData, PrefillData, AttachmentFile } from "../../utils/formConfig";

interface SectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  prefillData: PrefillData;
  disciplines: string[];
  errors: Record<string, string>;
}

type FileCategory = 'facility' | 'fop' | 'hostel' | 'equipment' | 'document' | 'other';

const FILE_CATEGORIES: { value: FileCategory; label: string }[] = [
  { value: 'facility', label: 'Facility Photos' },
  { value: 'fop', label: 'Field of Play Photos' },
  { value: 'hostel', label: 'Hostel Photos' },
  { value: 'equipment', label: 'Equipment Photos' },
  { value: 'document', label: 'Documents (MoU, Certificates)' },
  { value: 'other', label: 'Other' },
];

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];

export function Section10Attachments({ formData, setFormData, disciplines }: SectionProps) {
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<FileCategory>('facility');
  const [selectedDiscipline, setSelectedDiscipline] = useState<string>('');
  const [caption, setCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
  }, []);

  const uploadFile = async (file: File): Promise<AttachmentFile | null> => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      toast({
        title: "Invalid file type",
        description: "Please upload images (JPG, PNG, WEBP) or documents (PDF, DOC)",
        variant: "destructive",
      });
      return null;
    }

    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Maximum file size is 10MB",
        variant: "destructive",
      });
      return null;
    }

    const centreId = formData.core.stc_id || 'unknown';
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
    const filePath = `${centreId}/${selectedCategory}/${timestamp}_${sanitizedName}`;

    const { data, error } = await supabase.storage
      .from('stc-attachments')
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: false,
      });

    if (error) {
      console.error('Upload error:', error);
      toast({
        title: "Upload failed",
        description: error.message,
        variant: "destructive",
      });
      return null;
    }

    const { data: urlData } = supabase.storage
      .from('stc-attachments')
      .getPublicUrl(data.path);

    return {
      file_id: data.path,
      url: urlData.publicUrl,
      file_type: selectedCategory,
      discipline_code: selectedDiscipline || undefined,
      caption: caption || undefined,
      uploaded_at: new Date().toISOString(),
    };
  };

  const handleFiles = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    setUploading(true);
    const newAttachments: AttachmentFile[] = [];

    for (const file of Array.from(files)) {
      const attachment = await uploadFile(file);
      if (attachment) {
        newAttachments.push(attachment);
      }
    }

    if (newAttachments.length > 0) {
      setFormData({
        ...formData,
        attachments: [...formData.attachments, ...newAttachments],
      });
      toast({
        title: "Files uploaded",
        description: `${newAttachments.length} file(s) uploaded successfully`,
      });
      setCaption('');
    }

    setUploading(false);
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    handleFiles(e.dataTransfer.files);
  }, [selectedCategory, selectedDiscipline, caption]);

  const handleDelete = async (fileId: string) => {
    const { error } = await supabase.storage
      .from('stc-attachments')
      .remove([fileId]);

    if (error) {
      toast({
        title: "Delete failed",
        description: error.message,
        variant: "destructive",
      });
      return;
    }

    setFormData({
      ...formData,
      attachments: formData.attachments.filter(a => a.file_id !== fileId),
    });

    toast({
      title: "File deleted",
      description: "The file has been removed",
    });
  };

  const getFileIcon = (fileType: string) => {
    if (fileType === 'document') return <FileText className="h-8 w-8 text-blue-500" />;
    return <Image className="h-8 w-8 text-green-500" />;
  };

  const groupedAttachments = formData.attachments.reduce((acc, file) => {
    const category = file.file_type || 'other';
    if (!acc[category]) acc[category] = [];
    acc[category].push(file);
    return acc;
  }, {} as Record<string, AttachmentFile[]>);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Paperclip className="h-5 w-5 text-primary" />
        <h3 className="text-lg font-semibold text-foreground">Attachments</h3>
      </div>

      <div className="flex items-start gap-2 p-4 bg-info/10 rounded-lg border border-info/30">
        <Info className="h-5 w-5 text-info flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-foreground">Optional in v4</p>
          <p className="text-sm text-muted-foreground mt-1">
            File uploads are optional. You can submit the form without uploading any documents.
          </p>
        </div>
      </div>

      {/* Upload Configuration */}
      <Card>
        <CardContent className="pt-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Category *</Label>
              <Select value={selectedCategory} onValueChange={(v) => setSelectedCategory(v as FileCategory)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {FILE_CATEGORIES.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>{cat.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {(selectedCategory === 'fop' || selectedCategory === 'equipment') && disciplines.length > 0 && (
              <div className="space-y-2">
                <Label>Discipline (optional)</Label>
                <Select value={selectedDiscipline} onValueChange={setSelectedDiscipline}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select discipline" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {disciplines.map(d => (
                      <SelectItem key={d} value={d}>{d}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Caption (optional)</Label>
              <Input
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                placeholder="Brief description"
              />
            </div>
          </div>

          {/* Drop Zone */}
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              dragOver ? 'border-primary bg-primary/5' : 'border-border'
            } ${uploading ? 'opacity-50 pointer-events-none' : 'cursor-pointer'}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept={ALLOWED_TYPES.join(',')}
              className="hidden"
              onChange={(e) => handleFiles(e.target.files)}
            />

            {uploading ? (
              <>
                <Loader2 className="h-12 w-12 text-primary mx-auto mb-4 animate-spin" />
                <p className="text-sm text-muted-foreground">Uploading...</p>
              </>
            ) : (
              <>
                <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h4 className="text-lg font-medium text-foreground mb-2">Upload Files</h4>
                <p className="text-sm text-muted-foreground mb-4">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-xs text-muted-foreground">
                  Supported: Photos (JPG, PNG, WEBP), Documents (PDF, DOC)
                </p>
                <p className="text-xs text-muted-foreground mt-2">
                  Maximum file size: 10MB per file
                </p>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {formData.attachments.length > 0 && (
        <div className="space-y-4">
          <h4 className="text-sm font-medium text-foreground">
            Uploaded Files ({formData.attachments.length})
          </h4>

          {Object.entries(groupedAttachments).map(([category, files]) => (
            <Card key={category}>
              <CardContent className="pt-4">
                <h5 className="text-sm font-medium text-muted-foreground uppercase mb-3">
                  {FILE_CATEGORIES.find(c => c.value === category)?.label || category}
                </h5>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {files.map((file) => (
                    <div
                      key={file.file_id}
                      className="flex items-center gap-3 p-3 bg-secondary/30 rounded-lg group"
                    >
                      {file.url && file.file_type !== 'document' ? (
                        <img
                          src={file.url}
                          alt={file.caption || 'Attachment'}
                          className="h-12 w-12 object-cover rounded"
                        />
                      ) : (
                        getFileIcon(file.file_type)
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {file.caption || file.file_id.split('/').pop()}
                        </p>
                        {file.discipline_code && (
                          <p className="text-xs text-muted-foreground">{file.discipline_code}</p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {new Date(file.uploaded_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => window.open(file.url, '_blank')}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDelete(file.file_id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {formData.attachments.length === 0 && (
        <p className="text-sm text-muted-foreground text-center">
          No files uploaded yet. This section is optional.
        </p>
      )}

      <div className="space-y-2">
        <h4 className="text-sm font-medium text-foreground">Recommended Uploads</h4>
        <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
          <li>Facility photos (training areas, hostels, medical room)</li>
          <li>Field of Play photos</li>
          <li>MoU/Agreement documents</li>
          <li>Certificates and accreditations</li>
          <li>Equipment inventory documents</li>
        </ul>
      </div>
    </div>
  );
}
