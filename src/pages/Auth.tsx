import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import DashboardLayout from "@/components/layout/DashboardLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { Loader2, LogIn, UserPlus, Building2, MapPin, Eye } from "lucide-react";

const emailSchema = z.string().email("Please enter a valid email address");
const passwordSchema = z.string().min(6, "Password must be at least 6 characters");

const DOMAIN = '@kheldrishti.local';

const Auth = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [assignmentType, setAssignmentType] = useState<string>("viewer");
  const [selectedCentreId, setSelectedCentreId] = useState<string>("");
  const [selectedRegionId, setSelectedRegionId] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [checkingSession, setCheckingSession] = useState(true);
  const [loginMode, setLoginMode] = useState<'email' | 'username'>('email');
  const [username, setUsername] = useState("");
  const navigate = useNavigate();
  const { toast } = useToast();

  // Fetch available centres for dropdown
  const { data: centres } = useQuery({
    queryKey: ['stc-centres-list'],
    queryFn: async () => {
      const { data } = await supabase
        .from('stc_capacity')
        .select('centre_id, centre_name, state')
        .order('centre_name');
      
      // Get unique centres
      const unique = new Map<string, { centre_id: string; centre_name: string; state: string }>();
      data?.forEach(c => {
        if (c.centre_id && c.centre_name && !unique.has(c.centre_id)) {
          unique.set(c.centre_id, { 
            centre_id: c.centre_id, 
            centre_name: c.centre_name,
            state: c.state || ''
          });
        }
      });
      return Array.from(unique.values());
    },
  });

  // Fetch available regions for dropdown
  const { data: regions } = useQuery({
    queryKey: ['regional-centres-list'],
    queryFn: async () => {
      const { data } = await supabase
        .from('regional_centres')
        .select('id, name, display_name')
        .order('sort_order');
      return data || [];
    },
  });

  useEffect(() => {
    // Set up auth state listener FIRST
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (session) {
          // Redirect to STC Data Collection page after login
          navigate('/infrastructure/stc');
        }
        setCheckingSession(false);
      }
    );

    // THEN check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate('/infrastructure/stc');
      }
      setCheckingSession(false);
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const validateInputs = () => {
    try {
      emailSchema.parse(email);
      passwordSchema.parse(password);
      return true;
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0].message,
          variant: "destructive"
        });
      }
      return false;
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateInputs()) return;

    // Validate assignment selection
    if (assignmentType === 'centre_incharge' && !selectedCentreId) {
      toast({
        title: "Selection Required",
        description: "Please select the STC centre you are in-charge of.",
        variant: "destructive"
      });
      return;
    }
    if (assignmentType === 'regional_officer' && !selectedRegionId) {
      toast({
        title: "Selection Required",
        description: "Please select your regional office.",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    const redirectUrl = `${window.location.origin}/infrastructure/stc`;

    const metadata: Record<string, string> = {
      name: name || email.split('@')[0],
    };

    // Only add assignment data if not a viewer
    if (assignmentType !== 'viewer') {
      metadata.assignment_type = assignmentType;
      if (assignmentType === 'centre_incharge') {
        metadata.requested_centre_id = selectedCentreId;
      } else if (assignmentType === 'regional_officer') {
        metadata.requested_region_id = selectedRegionId;
      }
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: metadata
      }
    });

    if (error) {
      let message = error.message;
      if (error.message.includes('already registered')) {
        message = "This email is already registered. Please sign in instead.";
      }
      toast({ title: "Sign Up Error", description: message, variant: "destructive" });
    } else {
      toast({
        title: "Account Created!",
        description: assignmentType !== 'viewer' 
          ? "Your account is pending approval. An administrator will review your access request."
          : "You can now sign in with your credentials.",
      });
    }
    setLoading(false);
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    let loginEmail = email;
    
    // If using username mode, construct the email
    if (loginMode === 'username') {
      if (!username.trim()) {
        toast({ title: "Validation Error", description: "Please enter your username", variant: "destructive" });
        return;
      }
      loginEmail = `${username.trim().toLowerCase()}${DOMAIN}`;
    } else {
      if (!validateInputs()) return;
    }

    if (!password || password.length < 6) {
      toast({ title: "Validation Error", description: "Password must be at least 6 characters", variant: "destructive" });
      return;
    }

    setLoading(true);
    const { error } = await supabase.auth.signInWithPassword({ email: loginEmail, password });

    if (error) {
      let message = error.message;
      if (error.message.includes('Invalid login')) {
        message = "Invalid username/email or password. Please try again.";
      }
      toast({ title: "Sign In Error", description: message, variant: "destructive" });
    }
    setLoading(false);
  };

  if (checkingSession) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="flex items-center justify-center min-h-[60vh] py-8">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Khel Drishti</CardTitle>
            <CardDescription>Sign in to access STC Data Collection</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="signin" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="signin">Sign In</TabsTrigger>
                <TabsTrigger value="signup">Sign Up</TabsTrigger>
              </TabsList>
              
              <TabsContent value="signin">
                <form onSubmit={handleSignIn} className="space-y-4">
                  {/* Login mode toggle */}
                  <div className="flex gap-2 p-1 bg-muted rounded-lg">
                    <button
                      type="button"
                      onClick={() => setLoginMode('username')}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        loginMode === 'username' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Username
                    </button>
                    <button
                      type="button"
                      onClick={() => setLoginMode('email')}
                      className={`flex-1 py-2 px-3 rounded-md text-sm font-medium transition-colors ${
                        loginMode === 'email' ? 'bg-background shadow-sm' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      Email
                    </button>
                  </div>

                  {loginMode === 'username' ? (
                    <div className="space-y-2">
                      <Label htmlFor="signin-username">Username</Label>
                      <Input
                        id="signin-username"
                        type="text"
                        placeholder="e.g., stcagartala or rckolkata"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                      />
                      <p className="text-xs text-muted-foreground">
                        Enter your username without @kheldrishti.local
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Label htmlFor="signin-email">Email</Label>
                      <Input
                        id="signin-email"
                        type="email"
                        placeholder="you@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <Label htmlFor="signin-password">Password</Label>
                    <Input
                      id="signin-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>
                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <LogIn className="h-4 w-4 mr-2" />}
                    Sign In
                  </Button>
                </form>
              </TabsContent>
              
              <TabsContent value="signup">
                <form onSubmit={handleSignUp} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="signup-name">Name</Label>
                    <Input
                      id="signup-name"
                      type="text"
                      placeholder="Your Name"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-email">Email</Label>
                    <Input
                      id="signup-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="signup-password">Password</Label>
                    <Input
                      id="signup-password"
                      type="password"
                      placeholder="••••••••"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required
                    />
                  </div>

                  {/* Role Selection */}
                  <div className="space-y-3 pt-2">
                    <Label>I am a...</Label>
                    <RadioGroup 
                      value={assignmentType} 
                      onValueChange={(val) => {
                        setAssignmentType(val);
                        setSelectedCentreId("");
                        setSelectedRegionId("");
                      }}
                      className="grid gap-2"
                    >
                      <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="centre_incharge" id="centre_incharge" />
                        <Label htmlFor="centre_incharge" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Building2 className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium">Centre In-Charge</p>
                            <p className="text-xs text-muted-foreground">STC staff responsible for data entry</p>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="regional_officer" id="regional_officer" />
                        <Label htmlFor="regional_officer" className="flex items-center gap-2 cursor-pointer flex-1">
                          <MapPin className="h-4 w-4 text-primary" />
                          <div>
                            <p className="font-medium">Regional Officer</p>
                            <p className="text-xs text-muted-foreground">Supervise STCs in your region</p>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 p-3 rounded-lg border border-border hover:bg-muted/50 cursor-pointer">
                        <RadioGroupItem value="viewer" id="viewer" />
                        <Label htmlFor="viewer" className="flex items-center gap-2 cursor-pointer flex-1">
                          <Eye className="h-4 w-4 text-muted-foreground" />
                          <div>
                            <p className="font-medium">Viewer</p>
                            <p className="text-xs text-muted-foreground">View-only access to reports</p>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                  </div>

                  {/* Centre Selection for Centre In-Charge */}
                  {assignmentType === 'centre_incharge' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <Label htmlFor="centre-select">Select Your STC Centre</Label>
                      <Select value={selectedCentreId} onValueChange={setSelectedCentreId}>
                        <SelectTrigger id="centre-select">
                          <SelectValue placeholder="Choose your centre..." />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {centres?.map(centre => (
                            <SelectItem key={centre.centre_id} value={centre.centre_id}>
                              {centre.centre_name} ({centre.state})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {/* Region Selection for Regional Officer */}
                  {assignmentType === 'regional_officer' && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                      <Label htmlFor="region-select">Select Your Region</Label>
                      <Select value={selectedRegionId} onValueChange={setSelectedRegionId}>
                        <SelectTrigger id="region-select">
                          <SelectValue placeholder="Choose your region..." />
                        </SelectTrigger>
                        <SelectContent>
                          {regions?.map(region => (
                            <SelectItem key={region.id} value={region.id}>
                              {region.display_name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <UserPlus className="h-4 w-4 mr-2" />}
                    Create Account
                  </Button>
                </form>
                <p className="text-xs text-muted-foreground mt-4 text-center">
                  {assignmentType !== 'viewer' 
                    ? "Your request will be reviewed by an administrator before access is granted."
                    : "New users are assigned \"viewer\" role by default."
                  }
                </p>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
};

export default Auth;
