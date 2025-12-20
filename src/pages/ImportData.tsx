import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Upload, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Link } from "react-router-dom";

const ImportData = () => {
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null);
  const { toast } = useToast();

  const parseCSV = (text: string) => {
    const lines = text.trim().split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    const data = [];
    
    for (let i = 1; i < lines.length; i++) {
      const values: string[] = [];
      let current = '';
      let inQuotes = false;
      
      for (const char of lines[i]) {
        if (char === '"') {
          inQuotes = !inQuotes;
        } else if (char === ',' && !inQuotes) {
          values.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      values.push(current.trim());
      
      const row: Record<string, string> = {};
      headers.forEach((header, index) => {
        row[header] = values[index] || '';
      });
      data.push(row);
    }
    
    return data;
  };

  const importCentres = async () => {
    setImporting(true);
    setProgress(10);
    setResult(null);

    try {
      // Fetch the CSV file
      const response = await fetch('/data/centres.csv');
      const csvText = await response.text();
      setProgress(30);

      // Parse the CSV
      const centres = parseCSV(csvText);
      setProgress(50);

      // Call the edge function to import
      const { data, error } = await supabase.functions.invoke('import-centres', {
        body: { centres }
      });

      setProgress(100);

      if (error) {
        throw new Error(error.message);
      }

      if (data.success) {
        setResult({ 
          success: true, 
          message: `Successfully imported ${data.inserted} of ${data.total} centres!`
        });
        toast({
          title: "Import Complete",
          description: `${data.inserted} centres imported successfully.`,
        });
      } else {
        throw new Error(data.error || "Import failed");
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : "Unknown error";
      setResult({ success: false, message });
      toast({
        title: "Import Failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setImporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="container mx-auto max-w-2xl">
        <Link to="/" className="text-primary hover:underline mb-6 inline-block">
          ← Back to Dashboard
        </Link>
        
        <Card className="glass-panel">
          <CardHeader>
            <CardTitle className="font-display text-3xl">Import Training Centres</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-muted-foreground">
              Import 1,147 training centres from the CSV file into the database.
              This includes KIC, KISCE, STC, and NCOE centres across India.
            </p>

            {importing && (
              <div className="space-y-2">
                <Progress value={progress} className="h-2" />
                <p className="text-sm text-muted-foreground">
                  {progress < 30 && "Fetching CSV data..."}
                  {progress >= 30 && progress < 50 && "Parsing centres data..."}
                  {progress >= 50 && progress < 100 && "Importing to database..."}
                  {progress >= 100 && "Complete!"}
                </p>
              </div>
            )}

            {result && (
              <div className={`p-4 rounded-lg flex items-center gap-3 ${
                result.success ? 'bg-accent/10 text-accent' : 'bg-destructive/10 text-destructive'
              }`}>
                {result.success ? (
                  <CheckCircle2 className="h-5 w-5" />
                ) : (
                  <AlertCircle className="h-5 w-5" />
                )}
                <span>{result.message}</span>
              </div>
            )}

            <Button 
              onClick={importCentres} 
              disabled={importing}
              className="w-full"
              size="lg"
            >
              <Upload className="mr-2 h-5 w-5" />
              {importing ? "Importing..." : "Import Centres Data"}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default ImportData;
