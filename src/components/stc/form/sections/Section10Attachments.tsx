import { Paperclip, Upload, Info } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import type { FormData, PrefillData } from "../../utils/formConfig";

interface SectionProps {
  formData: FormData;
  setFormData: (data: FormData) => void;
  prefillData: PrefillData;
  disciplines: string[];
  errors: Record<string, string>;
}

export function Section10Attachments({ formData, setFormData }: SectionProps) {
  // File upload will be implemented in a future version
  // For now, show a placeholder

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
            File uploads are optional in this version. You can submit the form without uploading any documents.
          </p>
        </div>
      </div>

      <Card>
        <CardContent className="pt-6">
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h4 className="text-lg font-medium text-foreground mb-2">Upload Files</h4>
            <p className="text-sm text-muted-foreground mb-4">
              Drag and drop files here, or click to browse
            </p>
            <p className="text-xs text-muted-foreground">
              Supported: Photos (JPG, PNG), Documents (PDF, DOC)
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Maximum file size: 10MB per file
            </p>
          </div>

          {/* Placeholder for uploaded files */}
          {formData.attachments.length > 0 && (
            <div className="mt-4 space-y-2">
              <h5 className="text-sm font-medium text-foreground">Uploaded Files</h5>
              {formData.attachments.map((file, index) => (
                <div key={index} className="flex items-center gap-2 p-2 bg-secondary/30 rounded">
                  <Paperclip className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">{file.file_type}</span>
                </div>
              ))}
            </div>
          )}

          {formData.attachments.length === 0 && (
            <p className="text-sm text-muted-foreground text-center mt-4">
              No files uploaded yet. This section is optional.
            </p>
          )}
        </CardContent>
      </Card>

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
