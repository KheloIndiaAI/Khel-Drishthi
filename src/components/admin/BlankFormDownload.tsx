import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Printer, FormInput, Loader2 } from "lucide-react";
import { downloadBlankFormPDF } from "@/components/stc/utils/blankFormPDF";
import { useToast } from "@/hooks/use-toast";

export function BlankFormDownload() {
  const [downloadingPrintable, setDownloadingPrintable] = useState(false);
  const [downloadingFillable, setDownloadingFillable] = useState(false);
  const { toast } = useToast();

  const handleDownloadPrintable = async () => {
    setDownloadingPrintable(true);
    try {
      downloadBlankFormPDF('printable');
      toast({ title: "Download Started", description: "Printable PDF is being generated..." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate PDF", variant: "destructive" });
    } finally {
      setDownloadingPrintable(false);
    }
  };

  const handleDownloadFillable = async () => {
    setDownloadingFillable(true);
    try {
      downloadBlankFormPDF('fillable');
      toast({ title: "Download Started", description: "Fillable PDF is being generated..." });
    } catch (error) {
      toast({ title: "Error", description: "Failed to generate PDF", variant: "destructive" });
    } finally {
      setDownloadingFillable(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <FileText className="h-5 w-5" />
          Offline Form Download
        </CardTitle>
        <CardDescription>
          Download blank STC Data Collection forms for centres without internet access. 
          They can fill the form manually and submit via email.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button 
            variant="outline" 
            className="flex-1 gap-2 h-auto py-4"
            onClick={handleDownloadPrintable}
            disabled={downloadingPrintable}
          >
            {downloadingPrintable ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <Printer className="h-5 w-5" />
            )}
            <div className="text-left">
              <div className="font-medium">Printable PDF</div>
              <div className="text-xs text-muted-foreground">Optimized for printing</div>
            </div>
          </Button>
          
          <Button 
            variant="outline" 
            className="flex-1 gap-2 h-auto py-4"
            onClick={handleDownloadFillable}
            disabled={downloadingFillable}
          >
            {downloadingFillable ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <FormInput className="h-5 w-5" />
            )}
            <div className="text-left">
              <div className="font-medium">Fillable PDF</div>
              <div className="text-xs text-muted-foreground">Interactive form fields</div>
            </div>
          </Button>
        </div>
        
        <p className="text-xs text-muted-foreground mt-4">
          Both versions contain the same 9 sections as the online form. Completed forms should be scanned and emailed to stc.data@sai.gov.in
        </p>
      </CardContent>
    </Card>
  );
}
